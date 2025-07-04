import torch
from PIL import Image
from transformers import AutoProcessor, LlavaOnevisionForConditionalGeneration
import json

class ClothAnalyzer:
    def __init__(self, model_id: str = "llava-hf/llava-onevision-qwen2-0.5b-ov-hf"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # Load model and processor
        self.model = LlavaOnevisionForConditionalGeneration.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            low_cpu_mem_usage=True
        ).to(self.device)

        self.processor = AutoProcessor.from_pretrained(model_id)

        # Default prompt content
        self.base_prompt = "give me the description of the cloth (e.g., colour , type , design), ge .type of cloth (top, bottom, pants, etc), design description (e.g., laced, short-sleeved), and any other feature?"

    def analyze(self, image: Image.Image, custom_prompt: str = None) -> str:
        """Analyze the image and return description of the clothing"""
        
        prompt_text = custom_prompt or self.base_prompt

        # Format chat conversation
        conversation = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt_text},
                    {"type": "image"},
                ],
            },
        ]

        # Apply prompt template
        prompt = self.processor.apply_chat_template(conversation, add_generation_prompt=True)

        # Preprocess
        inputs = self.processor(images=image, text=prompt, return_tensors='pt').to(self.device)

        # Generate output
        output = self.model.generate(**inputs, max_new_tokens=200, do_sample=False)

        # Decode and clean
        response = self.processor.decode(output[0][2:], skip_special_tokens=True)
        cleaned_response = response.split("assistant")[-1].strip()

        return cleaned_response
    
    
    def get_image_prompt(self , parsed_results):
        llm_prompt = f"""
                        You are an intelligent parser that receives search results from a product database.

                        Each result contains:
                        - An image reference (usually a URL or ID)
                        - A JSON-formatted string with product attributes (like brand, color, type, etc.)

                        Your job is to parse each result and clearly extract:
                        1. The product image reference
                        2. A short, human-readable product description (2–3 lines max) based on the JSON content

                        Format your output as a JSON list of items with this structure:

                        [
                        {{
                            "image": "<image_id_or_url>",
                            "description": "<clean, readable description of the item>"
                        }},
                        ...
                        ]

                        Only include fields that matter visually like color, type, design, material, etc.
                        Avoid showing numeric fields or IDs unless they're relevant.

                        Here is the data:
                        {json.dumps(parsed_results, indent=2)}
                        """
        return llm_prompt

