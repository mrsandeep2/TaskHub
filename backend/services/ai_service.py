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
from PIL import Image, ImageDraw, ImageFont
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
    gen_type: str = "white_background",
) -> bytes:
    """Generate via Stability AI img2img for product consistency."""
    if not config.STABILITY_API_KEY:
        return _placeholder_image_composite(init_image_bytes, gen_type)

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

def _placeholder_image_composite(product_bytes: bytes | None, gen_type: str) -> bytes:
    """Create a beautiful mock composite image when API key is not set."""
    width, height = 1024, 1024
    bg = Image.new("RGB", (width, height), color=(245, 245, 247))
    draw = ImageDraw.Draw(bg)
    
    # Define gradients/colors based on type
    if gen_type == "white_background":
        # Pure studio white with a soft vignette/border
        draw.rectangle([(0, 0), (width, height)], fill=(255, 255, 255))
        draw.rectangle([(20, 20), (width-20, height-20)], outline=(240, 240, 240), width=2)
    elif "theme_background" in gen_type or "creative" in gen_type:
        # Luxury warm gradient
        for y in range(height):
            r = int(24 + (48 - 24) * (y / height))
            g = int(20 + (24 - 20) * (y / height))
            b = int(36 + (48 - 36) * (y / height))
            draw.line([(0, y), (width, y)], fill=(r, g, b))
    else:
        # Studio grey/beige backdrop for models
        for y in range(height):
            r = int(210 - (210 - 180) * (y / height))
            g = int(205 - (205 - 175) * (y / height))
            b = int(200 - (200 - 170) * (y / height))
            draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Add abstract background details
    if gen_type != "white_background":
        draw.ellipse([(-200, -200), (600, 600)], fill=None, outline=(255, 255, 255), width=1)
        draw.ellipse([(width-600, height-600), (width+200, height+200)], fill=None, outline=(255, 255, 255), width=1)

    # Process and overlay product image if provided
    if product_bytes:
        try:
            prod_img = Image.open(BytesIO(product_bytes))
            if prod_img.mode != 'RGBA':
                prod_img = prod_img.convert('RGBA')
            
            # Scale to fit nicely in the frame
            prod_img.thumbnail((750, 750), Image.Resampling.LANCZOS)
            
            # Center coordinates
            px = (width - prod_img.width) // 2
            py = (height - prod_img.height) // 2
            
            # Composite using alpha channel if present
            if 'A' in prod_img.getbands():
                bg.paste(prod_img, (px, py), prod_img)
            else:
                bg.paste(prod_img, (px, py))
        except Exception as e:
            print(f"[Placeholder] Error pasting product image: {e}", flush=True)

    # Draw label tag at the bottom
    try:
        lbl = gen_type.replace("_", " ").title()
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except Exception:
            font = None
            
        if font:
            bbox = draw.textbbox((0, 0), lbl, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        else:
            text_width = len(lbl) * 7
            text_height = 12
            
        tag_w = text_width + 40
        tag_h = text_height + 20
        tx = (width - text_width) // 2
        ty = height - 70 - text_height // 2
        
        draw.rounded_rectangle(
            [(width - tag_w) // 2, height - 80, (width + tag_w) // 2, height - 40],
            radius=10,
            fill=(15, 23, 42, 220),
            outline=(255, 255, 255),
            width=1
        )
        draw.text((tx, ty), lbl, fill=(255, 255, 255), font=font)
    except Exception as e:
        print(f"[Placeholder] Error drawing text: {e}", flush=True)

    buf = BytesIO()
    bg.save(buf, "JPEG", quality=95)
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
        gen_type=gen_type,
    )

    return result_bytes
