# AakashaVani LoRA Adapter

## Model Information
- **Base Model**: meta-llama/Llama-3.2-1B-Instruct
- **Adapter Type**: LoRA (Low-Rank Adaptation)
- **LoRA Rank (r)**: 16
- **LoRA Alpha**: 32
- **Training Date**: 2026-09-01

## Training Data
- **Training Examples**: 188
- **Validation Examples**: 23
- **Categories Covered**:
  - General Weather Queries
  - Agricultural Advisory
  - Disaster Safety
  - Multilingual Support (English, Hindi, Telugu, Marathi)

## Performance
- Trained for 3 epochs on domain-specific data
- Optimized for conversational weather and agricultural advice
- Focus on natural, grounded responses

## Usage

### With Hugging Face Transformers
```python
from peft import AutoPeftModelForCausalLM
from transformers import AutoTokenizer

model = AutoPeftModelForCausalLM.from_pretrained("./aakashavani_lora_model")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.2-1B-Instruct")

prompt = "Will it rain in Hyderabad today?"
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=100)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

### With AakashaVani Backend
The model is automatically loaded by `LLMGenerationEngine` as the Tier-3 fallback.

## Training Configuration
- Batch Size: 4 (with 2x gradient accumulation)
- Learning Rate: 2e-4 (with linear decay)
- Optimizer: AdamW
- Weight Decay: 0.01
- Mixed Precision: FP16
- Target Modules: q_proj, v_proj, k_proj, o_proj, gate_proj, up_proj, down_proj

## Domain Adaptation Focus
This LoRA adapter teaches the model to:
- Speak naturally about weather and forecasts
- Provide ICAR agricultural guidance
- Respond appropriately to disaster/emergency scenarios
- Handle multilingual queries (English, Hindi, Telugu)
- Ask clarification questions when needed
- Acknowledge uncertainty appropriately
- Ground responses in live weather data

## Notes
- The adapter is small (~8MB) and fast to load
- Can be merged with base model for deployment
- Compatible with quantization (4-bit, 8-bit)
- Tested on domain-specific evaluation set of 24 examples
