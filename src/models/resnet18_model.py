# resnet18_model.py --> R(2+1)D-18 + Spatial & Temporal Attention (EF regressor)

import torch
import torch.nn as nn

# Try to import weights enum for newer torchvision
try:
    from torchvision.models.video import r3d_18, R3D_18_Weights
    HAS_WEIGHTS_ENUM = True
except Exception:
    from torchvision.models.video import r3d_18
    R3D_18_Weights = None
    HAS_WEIGHTS_ENUM = False


# -------------------------------------------------
# Spatial Attention (3D)
# -------------------------------------------------
class SpatialAttention3D(nn.Module):
    """
    Channel-agnostic spatial attention for 3D feature maps
    """
    def __init__(self, kernel_size=7):
        super().__init__()
        padding = kernel_size // 2
        self.conv = nn.Conv3d(
            in_channels=2,
            out_channels=1,
            kernel_size=kernel_size,
            padding=padding,
            bias=False
        )
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        # x: (B,C,T,H,W)
        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out, _ = torch.max(x, dim=1, keepdim=True)
        attn = torch.cat([avg_out, max_out], dim=1)
        attn = self.sigmoid(self.conv(attn))
        return x * attn


# -------------------------------------------------
# Temporal Attention
# -------------------------------------------------
class TemporalAttention(nn.Module):
    """
    Temporal attention over time dimension T
    """
    def __init__(self, in_channels):
        super().__init__()
        self.conv1 = nn.Conv1d(in_channels, in_channels // 2, kernel_size=1)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv1d(in_channels // 2, 1, kernel_size=1)
        self.softmax = nn.Softmax(dim=-1)

    def forward(self, x):
        """
        x: (B, C, T)
        returns: (B, C)
        """
        attn = self.conv2(self.relu(self.conv1(x)))   # (B,1,T)
        attn = self.softmax(attn)                      # temporal weights
        x = (x * attn).sum(dim=-1)                     # weighted sum over T
        return x


# -------------------------------------------------
# ResNet3D EF Regressor (Spatial + Temporal Attention)
# -------------------------------------------------
class ResNet3D_EF(nn.Module):
    """
    R(2+1)D-18 + Spatial + Temporal Attention for EF regression

    Input:  (B, C, T, H, W)
    Output: (B,)
    """

    def __init__(self, pretrained=False, in_channels=3, dropout=0.3):
        super().__init__()

        """print(
            f"Initializing ResNet3D_EF + Spatial & Temporal Attn | "
            f"pretrained={pretrained}, HasWeightsEnum={HAS_WEIGHTS_ENUM}"
        )"""

        # ------------------------------
        # Backbone
        # ------------------------------
        if pretrained and HAS_WEIGHTS_ENUM:
            self.backbone = r3d_18(weights=R3D_18_Weights.DEFAULT)
        else:
            self.backbone = r3d_18(pretrained=pretrained)

        # Modify first conv to accept in_channels
        try:
            old_conv = self.backbone.stem[0]
            if old_conv.in_channels != in_channels:
                new_conv = nn.Conv3d(
                    in_channels,
                    old_conv.out_channels,
                    kernel_size=old_conv.kernel_size,
                    stride=old_conv.stride,
                    padding=old_conv.padding,
                    bias=False
                )
                with torch.no_grad():
                    if old_conv.in_channels == 3 and in_channels == 1:
                        new_conv.weight[:] = old_conv.weight.mean(dim=1, keepdim=True)
                    else:
                        nn.init.kaiming_normal_(new_conv.weight, mode="fan_out")
                self.backbone.stem[0] = new_conv
        except Exception:
            pass

        # Remove classification head
        try:
            in_feat = self.backbone.fc.in_features
            self.backbone.fc = nn.Identity()
        except Exception:
            in_feat = 512
            self.backbone.fc = nn.Identity()

        # ------------------------------
        # Attention blocks
        # ------------------------------
        self.spatial_attn = SpatialAttention3D(kernel_size=7)
        self.temporal_attn = TemporalAttention(in_feat)

        # ------------------------------
        # Regression head
        # ------------------------------
        self.regressor = nn.Sequential(
            nn.Linear(in_feat, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(256, 1)
        )

    # -------------------------------------------------
    # Forward
    # -------------------------------------------------
    def forward(self, x):
        if not torch.is_tensor(x):
            raise TypeError("Input must be torch.Tensor")
        if x.dim() != 5:
            raise ValueError(f"Expected (B,C,T,H,W), got {tuple(x.shape)}")

        feat = self.backbone(x)

        # Backbone returns feature map
        if feat.dim() == 5:
            # Spatial attention
            feat = self.spatial_attn(feat)              # (B,C,T,H,W)

            # Global spatial pooling
            feat = feat.mean(dim=[3, 4])                # (B,C,T)

            # Temporal attention
            feat = self.temporal_attn(feat)             # (B,C)

            out = self.regressor(feat)
            return out.view(-1)

        # Backbone returns flat features
        elif feat.dim() == 2:
            out = self.regressor(feat)
            return out.view(-1)

        # Fallback
        else:
            feat = feat.view(feat.size(0), -1)
            out = self.regressor(feat)
            return out.view(-1)
