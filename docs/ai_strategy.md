# AI Product Consistency Strategy

## The Core Problem

When generating product photography with AI, the biggest challenge is **product fidelity** — the generated images must show the exact same product, not an AI-interpreted version of it.

## Our Approach

### 1. Image-to-Image (img2img) at Low Strength
- We pass the original product image as `init_image` to Stability AI
- `strength=0.30–0.40` means the AI can only change ~30-40% of the image
- This preserves the product's shape, proportions, and major details

### 2. Background Removal First
- We use `rembg` to cleanly extract the product from its background
- The isolated product is used as init_image, so the AI starts from a clean product state
- Prevents the original background from influencing scene generation

### 3. Strong Negative Prompts
Every generation uses negative prompts like:
```
altered product, different design, different color, distorted product, 
changed jewelry, blurry product, cartoon, AI artifact, fake jewelry
```

### 4. Type-Specific Prompts
Each of the 8 generation types has carefully tuned prompts:
- **White background**: Maximum product preservation, minimal scene change
- **Theme backgrounds**: Contextual environment, product stays sharp
- **Creative backgrounds**: More artistic freedom while keeping product locked
- **Model wearing**: Lower strength (0.30) to preserve product on model

## Production-Grade Improvements

For pixel-perfect product consistency in a production system:

1. **ComfyUI + ControlNet**: Use Canny edge detection to lock product outline
2. **IP-Adapter**: Use product as reference image for style conditioning  
3. **Inpainting pipeline**: Generate background only, composite product in post
4. **Custom fine-tuned model**: Fine-tune on product images using DreamBooth/LoRA
5. **Two-stage pipeline**:
   - Stage 1: Generate background scene without product
   - Stage 2: Composite extracted product (with shadow/reflection) onto scene

## Current Limitations

- img2img at low strength (~35%) achieves ~85-90% product fidelity
- Very fine details (small engravings, thin chains) may lose clarity
- Model wearing shots are hardest — the model body introduces variance
- For absolute pixel-perfect results, post-processing compositing is required
