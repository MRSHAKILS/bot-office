# Visual changelog (v2 pass)
- Palette locked to VISUAL.md: void #e8e6e1, floor #f4f2ec + 1px #ddd8ce grid texture, slab edge, walls #f7f5f0 with #cfc9bd baseboard.
- Zone carpets = department colour at 12% over floor; lettering darker-neutral, no mipmap blur, letter-spaced.
- Desks #c4a882, chairs #3a3f46, monitors #1c1f24 bezel / #0b0d10 screen; dept accent cube → slim stripe.
- Glass lead office #9eb7c8 @18% with thin white top/bottom frames.
- Lounge: muted slate rug, charcoal sofas, styled coffee table; plants reduced to 8, pale planters, sage foliage.
- Server LEDs use status green/blue; research screens on near-black with crisp slate/blue type.
- Lighting: NoToneMapping (palette-accurate), white hemi + single soft sun, 2048 PCF soft shadows, tuned bias/normalBias.
- Camera framing: projects slab corners into view space and fits with ~8% margin (3% on portrait) for any aspect (desktop-first; no phone screenshots maintained).
- Tags: white pill + hairline border, status-dot colours from spec; collision pass (working first, idle staggered up 18px, faded if still colliding); integer px.
- HUD: secondary Simulate button bottom-centre, blue Simulation pill, amber feed chip top-right, new "N working" live chip.
- Password gate: centred white card, large title, blue primary button, blurred backdrop.
- Usage board: white panel, blue top rule, #111827 large figure, no-mipmap text.
- Unchanged: desk snap logic in bots/bot.ts, Worker API, TEAM ids/colours, `simulated` flag in apply().

## 2026-10-30
- Fishbowl glass curtain, per-bot workstations with RGB underglow + animated screens, per-bot outfits.
--- MOTION note ---
- Motion system: see MOTION.md (walk gait, sit ease, desk typing/idle breathe; no snap under 28u).

## 2026-10-30 — v3 fidelity + layout pass
- Layout: slab expanded to x −20..22, z −14..15 (`FLOOR_BOUNDS`); SWE moved to its own **Software** zone (16.8, 4) with its own carpet; Engineering is Mibot-only again. Extra corridor x 20.6.
- Glass: fishbowl, lead-office and ribs raised to 3.6u (back walls 3.7u + cornice); camera fit uses y 3.8.
- Controls: left-drag pans on the ground plane, right-drag orbits within ±34° yaw / narrow tilt, target clamped to the slab.
- Wall art: 5 framed gallery pieces (MathScriber AI, Gargantua, ChashiBhAI + 2 stack posters). Titles only.
- Fidelity: bevelled boxes everywhere, matte PBR (Standard, roughness 0.72–0.88) + low studio IBL; tiled floor with tone variation; sculpted humanoid bots (capsule limbs w/ elbows, hands, tapered torso, round head, hair cap, belt/collar folds).
