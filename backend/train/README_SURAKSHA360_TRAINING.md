# Suraksha360: 4-Bit QLoRA Fine-Tuning & Deployment Guide

This guide details the complete parameter-efficient fine-tuning (PEFT / QLoRA) and export pipeline for **Suraksha360**, specifically tailored to run within the **8 GB dedicated VRAM budget** of the **NVIDIA GeForce RTX 5050 Laptop GPU**.

---

## 1. VRAM Budget & Hardware Optimization

| Component | Precision / Configuration | VRAM Footprint |
| :--- | :--- | :---: |
| **Base Model** (Qwen2.5-7B) | 4-bit NormalFloat (NF4) | ~4.2 GB |
| **LoRA Adapters** ($r=16, \alpha=32$) | Float16 | ~0.3 GB |
| **Optimizer States** | Paged AdamW 8-bit | ~0.6 GB |
| **Activations & KV Cache** | Gradient Checkpointing enabled | ~0.7 GB |
| **Total Training Footprint** | | **~5.8 GB / 8.0 GB** |

> [!NOTE]
> Gradient checkpointing is enabled in `train_suraksha360_qlora.py` to discard intermediate activations during forward pass and recompute them in backward pass, reducing peak activation memory by ~60%.

---

## 2. Dataset Generation

The dataset generator creates high-signal instruction pairs across four core domains:
- **Conversational Companion & Empathy**: Empathetic dialogue handling fatigue, stress, and informal chat in English, Hindi, and Telugu.
- **Atmospheric & Climate Physics**: Detailed physical explanations of heat index, dew point, wet-bulb thresholds, and convective precipitation.
- **Vernacular Agro-Meteorology**: Rainfast periods, pesticide spraying windows, and irrigation scheduling.
- **NDMA/IMD Civil Safety SOPs**: Cyclone alerts, cloud-to-ground lightning crouch protocol, and flood bypass driving rules.

To regenerate or expand the dataset:
```powershell
cd e:\Project APEX\Projects\AakashaVani\backend
python train/generate_suraksha360_dataset.py
```
Output files:
- `train/suraksha360_train.jsonl` (85% split)
- `train/suraksha360_val.jsonl` (15% split)

---

## 3. Local Training Execution (RTX 5050)

### Prerequisites:
```powershell
pip install torch transformers peft bitsandbytes accelerate datasets trl
```

### Run Fine-Tuning:
```powershell
python train/train_suraksha360_qlora.py `
  --base_model "Qwen/Qwen2.5-7B-Instruct" `
  --train_file "train/suraksha360_train.jsonl" `
  --output_dir "train/suraksha360_lora_output" `
  --epochs 3 `
  --batch_size 2 `
  --grad_accum 4 `
  --lr 2e-4
```

---

## 4. Exporting & Merging to Ollama GGUF

Once the LoRA adapter weights are saved in `train/suraksha360_lora_output/`:

### Step A: Merge LoRA Adapter into 16-bit Base Model
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

base = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-7B-Instruct", device_map="cpu")
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-7B-Instruct")
model = PeftModel.from_pretrained(base, "train/suraksha360_lora_output")
merged = model.merge_and_unload()

merged.save_pretrained("train/suraksha360_merged_16bit")
tokenizer.save_pretrained("train/suraksha360_merged_16bit")
```

### Step B: Convert to GGUF via llama.cpp
```bash
python llama.cpp/convert_hf_to_gguf.py train/suraksha360_merged_16bit/ --outtype q8_0 --outfile suraksha360_finetuned_q8.gguf
```

### Step C: Register in Ollama
Create a `Modelfile.finetuned`:
```dockerfile
FROM ./suraksha360_finetuned_q8.gguf

PARAMETER temperature 0.35
PARAMETER top_p 0.90
PARAMETER num_ctx 4096
PARAMETER num_predict 300
```
Then run:
```powershell
ollama create suraksha360:finetuned -f Modelfile.finetuned
```
Update `backend/.env`:
```env
OLLAMA_MODEL=suraksha360:finetuned
```
Suraksha360 will now run your custom-trained weights directly on the RTX 5050 GPU!
