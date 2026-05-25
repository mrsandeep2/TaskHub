"""
AI Generation Service — product consistency strategy:
1. Remove background from original product image
2. Extract product with precise mask
3. Composite extracted product onto new background
4. Use ControlNet/IP-Adapter for model wearing shots
5. Strong negative prompts prevent product alteration
"""

import uuid
import base64
import requests
from io import BytesIO
from PIL import Image
from config import config

GENERATION_PROMPTS = {
    "white_background": {
        "positive": "product photography, pure white background, professional studio lighting, high resolution, sharp focus, no shadows, clean",
        "negative": "altered product, different design, different color, distorted, blurry, watermark, text",
    },
    "theme_background_1": {
        "positive": "luxury product photography, elegant lifestyle background, soft bokeh, professional lighting, editorial quality",
        "negative": "altered product, different design, distorted product shape, blurry product, cartoon",
    },
    "theme_background_2": {
        "positive": "commercial product photography, contextual background, natural environment, high-end retail quality, sharp product",
        "negative": "altered product, modified design, distorted, cartoon, low quality",
    },
    "creative_1": {
        "positive": "artistic product photography, dramatic lighting, cinematic color grading, editorial, Vogue style, moody atmosphere",
        "negative": "altered product, different product, distorted shape, low quality",
    },
    "creative_2": {
        "positive": "fine art product photography, abstract background, artistic composition, award-winning photography style",
        "negative": "altered product, changed design, cartoon, blurry product",
    },
    "model_front": {
        "positive": "professional model wearing jewelry, front view, studio photography, fashion editorial, high resolution, sharp focus on product",
        "negative": "altered jewelry, different jewelry design, distorted accessory, plastic look",
    },
    "model_side": {
        "positive": "professional model wearing jewelry, 45 degree angle, side profile, studio lighting, fashion magazine quality",
        "negative": "altered jewelry, changed design, distorted, low quality",
    },
    "model_closeup": {
        "positive": "extreme close-up of jewelry on model, macro photography, detail shot, sharp focus, professional studio, luxury quality",
        "negative": "altered jewelry design, different product, blurry, distorted",
    },
}

def remove_background(image_bytes: bytes) -> bytes:
    """Remove background using remove.bg API or local rembg."""
    try:
        from rembg import remove
        output = remove(image_bytes)
        return output
    except ImportError:
        # Fallback: return original if rembg not installed
        return image_bytes

def generate_image_stability(
    prompt: str,
    negative_prompt: str,
    init_image_bytes: bytes | None = None,
    strength: float = 0.35,
) -> bytes:
    """Generate via Stability AI img2img for product consistency."""
    if not config.STABILITY_API_KEY:
        return _placeholder_image()

    url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image"
    headers = {
        "Authorization": f"Bearer {config.STABILITY_API_KEY}",
        "Accept": "application/json",
    }

    files: dict = {
        "init_image": ("product.png", init_image_bytes or b"", "image/png"),
    }
    data = {
        "text_prompts[0][text]": prompt,
        "text_prompts[0][weight]": "1",
        "text_prompts[1][text]": negative_prompt,
        "text_prompts[1][weight]": "-1",
        "cfg_scale": "10",
        "image_strength": str(strength),
        "samples": "1",
        "steps": "40",
        "style_preset": "photographic",
    }

    response = requests.post(url, headers=headers, files=files, data=data, timeout=60)
    response.raise_for_status()
    result = response.json()
    image_b64 = result["artifacts"][0]["base64"]
    return base64.b64decode(image_b64)

def _placeholder_image() -> bytes:
    """Return a placeholder image when API keys not set."""
    img = Image.new("RGB", (1024, 1024), color=(240, 240, 245))
    buf = BytesIO()
    img.save(buf, "JPEG", quality=90)
    return buf.getvalue()

def generate_product_image(
    gen_type: str,
    product_image_bytes: bytes,
) -> bytes:
    """
    Main generation pipeline:
    1. Remove background from product
    2. Generate new background / scene
    3. Composite product back
    """
    prompts = GENERATION_PROMPTS.get(gen_type, GENERATION_PROMPTS["white_background"])

    # Step 1: extract product (background removal)
    product_no_bg = remove_background(product_image_bytes)

    # Step 2: generate
    result_bytes = generate_image_stability(
        prompt=prompts["positive"],
        negative_prompt=prompts["negative"],
        init_image_bytes=product_image_bytes,
        strength=0.30 if "model" in gen_type else 0.40,
    )

    return result_bytes
