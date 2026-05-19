# Maestría IA — Social Asset Pack

24 posts across 2 Facebook Pages. Designs are **shared** (same 12 images on both pages); **captions differ** by page so the algorithm doesn't flag duplicate content.

## Folder layout

```
social/
├── shared/          ← 12 master PNGs (1080×1080)
├── page-1/          ← copies for Maestría IA (Page A)
├── page-2/          ← copies for Maestría IA Academia (Page B)
├── captions.md      ← 24 Spanish captions (12 per page)
├── midjourney_prompts.md  ← optional AI-influencer alternatives
├── generate_posts.py      ← regenerate any post with `python3 generate_posts.py`
└── README.md        ← this file
```

## Two-Page strategy

| Page | Name | Angle | URL handle (suggested) |
|------|------|-------|------------------------|
| A | **Maestría IA** | Bold, hook-driven, TikTok energy | `@MaestríaIA` |
| B | **Maestría IA Academia** | Calmer, educational, "learn from experts" | `@MaestríaIAAcademia` |

Same product (maestriavideo.com), two voices, two audiences. Cross-link them in About sections.

## Important: the image gap

I generated **typography-style** posts (bold text + brand orange, no faces) because my toolset doesn't include AI face generation. The AIVB aesthetic relies heavily on AI influencer faces — to replicate it exactly, you have two paths:

1. **Use what's here.** Typography-style is a totally valid style — Apple, Linear, and Stripe all use it. It will look intentional and professional. Risk: lower scroll-stop rate than face-driven posts.
2. **Generate face versions in Midjourney / Veo.** See `midjourney_prompts.md` — 12 ready-to-paste prompts. After generating, drop into Canva, add the title text overlay (specs in the same file), and replace the shared/ images.

I recommend launching with the typography pack now (today) and swapping in Midjourney versions over the next week as you generate them. Don't wait — first posts matter for FB's authenticity scoring.

## Posting cadence

**Don't post all 12 on day 1.** New FB Pages dumping 12 identical-looking posts trigger spam flags.

Spread over **~3 weeks per page** (~ post every 2 days). Stagger Page A and Page B by 2–3 hours so they don't look coordinated. See `captions.md` for the full schedule.

## What I still need from you

1. **Confirm Page names** (default: Maestría IA + Maestría IA Academia)
2. **Pick a Facebook account** to use as the Page admin
3. **Decide:** typography pack now, or wait for Midjourney face versions?
4. **Profile pic + cover photo** for each page — I can generate simple branded versions (logo + orange gradient) on request, but if you want photos of "a Latina female face" as profile pic, you'll need to generate those in Midjourney.
