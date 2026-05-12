# Usage

Run the main pipeline using:

```bash
python main_pipeline.py
```

---

# Input

The system requires two echocardiography ultrasound sequences in NIfTI format:

* `4CH` (Four-Chamber View)
* `2CH` (Two-Chamber View)

Example:

```python
path_4ch = "test_cases/patient0233/patient0233_4CH_half_sequence.nii.gz"

path_2ch = "test_cases/patient0233/patient0233_2CH_half_sequence.nii.gz"
```

---

# Pipeline Overview

The pipeline performs the following steps:

1. Load echocardiography sequences
2. Segment cardiac structures using a deep learning model
3. Detect ED (End-Diastolic) and ES (End-Systolic) frames
4. Compute cardiac measurements:

   * EF
   * EDV
   * ESV
   * SV
   * LV Max Area
   * FAC
   * LA MAx Area
   * LA EF
5. Predict EF using a 3D CNN video model
6. Compute final ensemble EF prediction
7. Generate visualization outputs and diagnostic report

---

# System Pipeline


![System Pipeline](test_cases/pipline_of_cadiovision.png)


---

# Output

The system generates:

## Clinical Measurements

* Ejection Fraction (EF)
* End-Diastolic Volume (EDV)
* End-Systolic Volume (ESV)
* Stroke Volume (SV)
* Left Ventricle Maximum Area (LV Max Area)
* Fractional Area Change (FAC)
* Left Atrium Maximum Area (LA Max Area)
* Left Atrial Ejection Fraction (LA EF)

## Visualization Outputs

* Segmentation GIFs
* Overlay GIFs
* ED/ES frame visualizations

## Diagnostic Output

Example:

```text
===== Cardiac Report =====

Diagnosis: Normal

Final EF : 61.42 %

EDV : 124.37 mL
ESV : 48.12 mL
SV  : 76.25 mL
LV Max Area : 21.42 cm²
LA Max Area : 18.37 cm²

FAC   : 45.73 %
LA EF : 52.18 %
```
