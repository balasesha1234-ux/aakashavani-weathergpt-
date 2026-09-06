"""
AakashaVani: Domain-Specific SLM Fine-Tuning Pipeline (LoRA / QLoRA)
Target Base Models: unsloth/Llama-3.2-1B-Instruct, google/gemma-2-2b-it, or Qwen/Qwen2.5-1.5B-Instruct
Task: Meteorology, ICAR Agromet Advisory, and NDMA Disaster Safety
"""

import os
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer

# Configuration
MODEL_ID = os.getenv("BASE_MODEL", "meta-llama/Llama-3.2-1B-Instruct")
OUTPUT_DIR = "./aakashavani_lora_adapter"
DATASET_PATH = "./dataset.jsonl"

def train():
    print(f"🚀 Starting AakashaVani Fine-Tuning Pipeline for: {MODEL_ID}")
    
    # 1. 4-bit Quantization Configuration for memory efficiency
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    # 2. Load Base Model & Tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )
    model = prepare_model_for_kbit_training(model)

    # 3. LoRA Adapter Configuration
    peft_config = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # 4. Load Dataset
    dataset = load_dataset("json", data_files=DATASET_PATH, split="train")

    # 5. Training Arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=2,
        learning_rate=2e-4,
        logging_steps=10,
        num_train_epochs=3,
        weight_decay=0.01,
        fp16=True,
        save_strategy="epoch",
        report_to="none"
    )

    # 6. SFT Trainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        tokenizer=tokenizer,
        args=training_args,
        max_seq_length=1024
    )

    print("🔥 Training AakashaVani LoRA Adapters...")
    trainer.train()

    # 7. Save Final Adapter
    trainer.model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print(f"✅ Successfully saved fine-tuned AakashaVani model to: {OUTPUT_DIR}")

if __name__ == "__main__":
    train()
