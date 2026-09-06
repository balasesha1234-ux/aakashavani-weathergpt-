#!/usr/bin/env python3
"""
AakashaVani: Suraksha360 4-Bit QLoRA Fine-Tuning Script
Optimized specifically for NVIDIA GeForce RTX 5050 Laptop GPU (8 GB Dedicated VRAM).

Architecture:
- Base Model: Qwen/Qwen2.5-7B-Instruct (or compatible Qwen series)
- Quantization: 4-Bit NormalFloat (NF4) with double quantization
- Parameter Efficient Fine-Tuning: LoRA (rank=16, alpha=32)
- Memory Optimization: Gradient Checkpointing enabled (VRAM footprint ~5.6 GB)
"""

import os
import sys
import argparse
import json
from pathlib import Path

def parse_args():
    parser = argparse.ArgumentParser(description="Fine-tune Suraksha360 with 4-bit QLoRA on 8GB VRAM")
    parser.add_argument("--base_model", type=str, default="Qwen/Qwen2.5-7B-Instruct", help="Base model HuggingFace ID")
    parser.add_argument("--train_file", type=str, default="train/suraksha360_train.jsonl", help="Training JSONL path")
    parser.add_argument("--val_file", type=str, default="train/suraksha360_val.jsonl", help="Validation JSONL path")
    parser.add_argument("--output_dir", type=str, default="train/suraksha360_lora_output", help="Output directory")
    parser.add_argument("--epochs", type=int, default=3, help="Training epochs")
    parser.add_argument("--batch_size", type=int, default=2, help="Per-device train batch size (keep 1-2 for 8GB VRAM)")
    parser.add_argument("--grad_accum", type=int, default=4, help="Gradient accumulation steps")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--max_seq_len", type=int, default=512, help="Max sequence length")
    return parser.parse_args()

def format_prompt(example: dict) -> str:
    """Formats an instruction pair into the standardized Qwen ChatML format."""
    system_prompt = (
        "You are Suraksha360, the sovereign on-device AI for AakashaVani. "
        "Provide concise, empathetic, and factual advice on weather, agro-meteorology, and safety. "
        "Never contradict physical sensor data."
    )
    user_content = example["instruction"]
    if example.get("input"):
        user_content += f"\n\nContext:\n{example['input']}"
    
    assistant_content = example["output"]

    return (
        f"<|im_start|>system\n{system_prompt}<|im_end|>\n"
        f"<|im_start|>user\n{user_content}<|im_end|>\n"
        f"<|im_start|>assistant\n{assistant_content}<|im_end|>"
    )

def main():
    args = parse_args()
    print("=" * 65)
    print("[INFO] Suraksha360 QLoRA Fine-Tuning Pipeline (8GB VRAM Profile)")
    print(f"       Target GPU: NVIDIA GeForce RTX 5050 (8 GB Dedicated VRAM)")
    print(f"       Base Model: {args.base_model}")
    print(f"       Train File: {args.train_file}")
    print(f"       Output Dir: {args.output_dir}")
    print("=" * 65)

    # Check for required ML libraries
    try:
        import torch
        from transformers import (
            AutoModelForCausalLM,
            AutoTokenizer,
            BitsAndBytesConfig,
            TrainingArguments
        )
        from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
        from datasets import Dataset
    except ImportError as e:
        print("\n[WARNING] Deep learning dependencies not fully installed in this environment:")
        print(f"          Missing: {e}")
        print("\nTo execute this training script locally or on Colab/Cloud, install:")
        print("  pip install torch transformers peft bitsandbytes accelerate datasets trl")
        print("\nDetailed guide available at: backend/train/README_SURAKSHA360_TRAINING.md")
        return

    # 1. Device and VRAM Check
    if not torch.cuda.is_available():
        print("[ERROR] CUDA is not available. GPU acceleration required for QLoRA training.")
        sys.exit(1)

    device_name = torch.cuda.get_device_name(0)
    vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
    print(f"[CUDA] Detected GPU: {device_name} ({vram_gb:.2f} GB VRAM)")

    # 2. 4-bit Quantization Config (NF4)
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True
    )

    print("\n[STEP 1/5] Loading tokenizer & 4-bit quantized base model...")
    tokenizer = AutoTokenizer.from_pretrained(args.base_model, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    model = AutoModelForCausalLM.from_pretrained(
        args.base_model,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )

    # 3. Prepare for k-bit training & Enable Gradient Checkpointing
    model = prepare_model_for_kbit_training(model)
    model.gradient_checkpointing_enable()

    # 4. Configure LoRA (Rank 16, Alpha 32)
    peft_config = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # 5. Load & Format Dataset
    print("\n[STEP 2/5] Formatting domain training dataset...")
    train_texts = []
    with open(args.train_file, "r", encoding="utf-8") as f:
        for line in f:
            item = json.loads(line.strip())
            train_texts.append({"text": format_prompt(item)})

    train_dataset = Dataset.from_list(train_texts)

    # 6. Training Arguments
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        learning_rate=args.lr,
        logging_steps=10,
        save_strategy="epoch",
        fp16=True,
        optim="paged_adamw_8bit",
        warmup_ratio=0.05,
        lr_scheduler_type="cosine",
        report_to="none"
    )

    # 7. Execute Training via SFTTrainer
    print("\n[STEP 3/5] Initializing Trainer...")
    from trl import SFTTrainer

    trainer = SFTTrainer(
        model=model,
        train_dataset=train_dataset,
        peft_config=peft_config,
        dataset_text_field="text",
        max_seq_length=args.max_seq_len,
        tokenizer=tokenizer,
        args=training_args,
    )

    print("\n[STEP 4/5] Starting 4-bit QLoRA Fine-Tuning on RTX 5050...")
    trainer.train()

    # 8. Save Output Adapter
    print(f"\n[STEP 5/5] Saving fine-tuned LoRA adapter to {args.output_dir}...")
    trainer.model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print("\n[SUCCESS] Suraksha360 LoRA adapter fine-tuning complete!")
    print(f"          Weights saved to: {args.output_dir}")
    print("=" * 65)

if __name__ == "__main__":
    main()
