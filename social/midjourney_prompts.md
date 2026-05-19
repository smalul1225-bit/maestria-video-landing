# Maestría IA — 12 Midjourney / Veo Prompts (AIVB-style AI Influencer Posts)

These prompts replicate the AIVB aesthetic: photorealistic AI-generated influencer portraits (1:1) with bold text overlays you'll add after generating.

**Generation order:** Use these in Midjourney v7 with `--ar 1:1 --style raw --v 7 --s 250`. For Veo / Sora, use the descriptive paragraph as-is and request square output. After generation, paste into Canva / Figma and add the text overlay from `captions.md` (the title line of each — e.g. "ESTO ES IA").

Suffix to append to every prompt: `--ar 1:1 --style raw --s 250 --v 7`

---

### 01 → "ESTO ES IA"
> Hyperrealistic close-up portrait of a confident young Latina woman, 25, looking directly at camera with a slight smirk, natural makeup, soft golden hour light from window, warm orange wall background, shallow depth of field, 85mm lens, shot on Hasselblad H6D, editorial fashion photography, ultra-detailed skin texture, professional color grading, cinematic.

### 02 → "CONTENIDO SOCIAL"
> Cinematic wide shot of a 28-year-old Mexican male creator sitting on the floor of a minimalist studio, holding a phone vertically, neon orange ring light reflecting in his glasses, dark moody atmosphere with bokeh purple lights in background, vertical phone screen glowing, shot on ARRI Alexa, color graded teal-and-orange, hyperrealistic.

### 03 → "CUALQUIER ESTILO"
> Triptych composite of the SAME woman in three radically different aesthetics: left panel — anime illustration style with big eyes and pastel colors; center panel — photoreal cinematic portrait with dramatic chiaroscuro lighting; right panel — vintage 1970s film grain with warm tones. Identical pose across all three: head turned 3/4 toward camera. Connected by a thin orange gradient line.

### 04 → "30 SEGUNDOS"
> Top-down flatlay of a black analog stopwatch on bright orange background, the second hand frozen at the 30-second mark, surrounded by floating semi-transparent video thumbnail frames, glossy product photography, hard shadow, shot from directly above with macro detail, ultra-sharp focus on the stopwatch face.

### 05 → "SIN CÁMARA"
> Symbolic photograph of a vintage professional cinema camera being dissolved into pixels and orange light particles, mid-disintegration, against a cream-colored seamless studio backdrop, dramatic side lighting, conceptual fine-art photography, ultra-realistic, with floating data fragments and code snippets faintly visible in the air around it.

### 06 → "TU PRÓXIMO VIDEO VIRAL"
> Dynamic action shot of a Colombian female content creator, 23, mid-laugh while holding a phone selfie-style, confetti and orange light particles exploding behind her, blurred motion suggesting going viral, bright sunlit outdoor setting, vibrant saturated colors, shot on Sony A7R V, magazine cover composition.

### 07 → "+20.000 CREADORES"
> Collage grid of 12 different AI-generated young Latin American content creators (mixed gender, mixed countries: Mexico, Argentina, Colombia, Brazil, Chile, Peru), each in their own square frame, all photorealistic, all looking at camera with slight smiles, soft uniform lighting, neutral backgrounds, modern editorial style — like a community Instagram grid screenshot.

### 08 → "$9 USD AL MES"
> Photorealistic still life of a single crisp $10 USD bill being torn slightly to reveal "$9" written underneath in handwritten marker, on bright orange paper background, hard product photography lighting, shallow depth of field, ultra-sharp focus on the bill, premium magazine aesthetic.

### 09 → "LO QUE NADIE TE ENSEÑA"
> Cinematic dark portrait of a 30-year-old Brazilian male professor figure with intelligent eyes, leaning against a chalkboard covered in faintly visible AI diagrams and Spanish notes, single orange light beam cutting across his face from the side, mysterious moody atmosphere, shot on Leica SL2, conceptual editorial photography, deep shadows.

### 10 → "EL FUTURO"
> Futuristic wide shot of a young Latina woman, 26, in a sleek dark room facing a giant holographic video grid that surrounds her in 360°, orange neon light reflections on her face, cinematic sci-fi atmosphere, shot like a Blade Runner 2049 still, ultra-detailed, color graded purple-and-orange.

### 11 → "DE CERO A VIRAL"
> Split-screen composition of the same young male Argentine creator, 24, in two states: LEFT side — sitting alone in a dim cluttered bedroom looking defeated at a laptop; RIGHT side — standing confidently in a bright modern studio with phone showing millions of views. Same outfit, dramatic before/after, cinematic color grading, editorial storytelling photography.

### 12 → "DESBLOQUEA TU CREATIVIDAD"
> Symbolic conceptual photograph of a glowing orange padlock unlocking in mid-air, with creative elements (paintbrushes, video clips, music notes, lightning bolts) bursting out in an explosion of color, against a deep purple gradient background, hyperrealistic CGI render with cinematic lighting, dramatic and inspirational.

---

## Veo / Sora variant (if you want video posts instead of static)

For Veo, add `, 5-second loop, subtle ambient motion, camera locked off, perfect cinematic loop` to each prompt.

For Sora, prepend each prompt with `A 5-second cinematic clip of: ` and append `, smooth slow-motion, locked camera, perfect for social media loop`.

---

## After generation: text overlay spec

Use Figma / Canva or these exact PIL settings to add the title line over the AI image:

| Image | Title text | Position | Color |
|-------|-----------|----------|-------|
| 01 | ESTO ES IA. | Top-center | White |
| 02 | CONTENIDO SOCIAL | Top-center | White |
| 03 | CUALQUIER ESTILO. UN SOLO PROMPT. | Bottom-center | White on dark gradient strip |
| 04 | 30 SEGUNDOS | Center | Orange |
| 05 | SIN CÁMARA. | Top-center | Black |
| 06 | TU PRÓXIMO VIDEO VIRAL | Top-center | White |
| 07 | +20.000 CREADORES | Top-center on dark band | White |
| 08 | DESDE $9 USD/MES | Center | White |
| 09 | APRENDE LO QUE NADIE TE ENSEÑA | Bottom | Orange |
| 10 | EL FUTURO DEL VIDEO | Center | White |
| 11 | DE CERO A VIRAL | Center across split | White |
| 12 | DESBLOQUEA TU CREATIVIDAD | Top-center | White |

Font: **Avenir Next Bold** / Helvetica Bold / Inter Bold. Always include `@maestriavideo` watermark at bottom.
