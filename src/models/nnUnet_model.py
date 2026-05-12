# nnUnet_model.py --> nnU-Net with Deep Supervision (for segmentation tasks)

import torch
import torch.nn as nn
import torch.nn.functional as F

# -------------------------------------------------
# Basic blocks (nnU-Net style)
# -------------------------------------------------
class DoubleConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.LeakyReLU(inplace=True),

            nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.LeakyReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


class Down(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.block = nn.Sequential(
            nn.MaxPool2d(2),
            DoubleConv(in_ch, out_ch)
        )

    def forward(self, x):
        return self.block(x)


class Up(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.up = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=False)
        self.conv = DoubleConv(in_ch, out_ch)

    def forward(self, x1, x2):
        x1 = self.up(x1)

        # padding for odd sizes
        diffY = x2.size(2) - x1.size(2)
        diffX = x2.size(3) - x1.size(3)

        x1 = F.pad(
            x1,
            [diffX // 2, diffX - diffX // 2,
             diffY // 2, diffY - diffY // 2]
        )

        x = torch.cat([x2, x1], dim=1)
        return self.conv(x)


class OutConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv = nn.Conv2d(in_ch, out_ch, 1)

    def forward(self, x):
        return self.conv(x)


# -------------------------------------------------
# nnU-Net + Deep Supervision
# -------------------------------------------------
class UNetDeepSupervision(nn.Module):
    def __init__(self, in_channels=1, num_classes=4, base_c=64):
        super().__init__()

        # Encoder
        self.inc   = DoubleConv(in_channels, base_c)
        self.down1 = Down(base_c, base_c * 2)
        self.down2 = Down(base_c * 2, base_c * 4)
        self.down3 = Down(base_c * 4, base_c * 8)
        self.down4 = Down(base_c * 8, base_c * 16)

        # Decoder
        self.up1 = Up(base_c * 16 + base_c * 8, base_c * 8)
        self.up2 = Up(base_c * 8  + base_c * 4, base_c * 4)
        self.up3 = Up(base_c * 4  + base_c * 2, base_c * 2)
        self.up4 = Up(base_c * 2  + base_c,     base_c)

        # Final outputs (Deep Supervision heads)
        self.out_final = OutConv(base_c, num_classes)
        self.out_ds1   = OutConv(base_c * 2, num_classes)
        self.out_ds2   = OutConv(base_c * 4, num_classes)
        self.out_ds3   = OutConv(base_c * 8, num_classes)

    def forward(self, x):
        # Encoder
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)
        x5 = self.down4(x4)

        # Decoder
        d1 = self.up1(x5, x4)   # deepest
        d2 = self.up2(d1, x3)
        d3 = self.up3(d2, x2)
        d4 = self.up4(d3, x1)

        # Outputs
        out_final = self.out_final(d4)
        out_ds1   = self.out_ds1(d3)
        out_ds2   = self.out_ds2(d2)
        out_ds3   = self.out_ds3(d1)

        # Return ALL outputs (training)
        return out_final, out_ds1, out_ds2, out_ds3