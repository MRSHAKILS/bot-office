# Visual changelog (v2 pass)
- Palette locked to VISUAL.md: void #e8e6e1, floor #f4f2ec + 1px #ddd8ce grid texture, slab edge, walls #f7f5f0 with #cfc9bd baseboard.
- Zone carpets = department colour at 12% over floor; lettering darker-neutral, no mipmap blur, letter-spaced.
- Desks #c4a882, chairs #3a3f46, monitors #1c1f24 bezel / #0b0d10 screen; dept accent cube → slim stripe.
- Glass lead office #9eb7c8 @18% with thin white top/bottom frames.
- Lounge: muted slate rug, charcoal sofas, styled coffee table; plants reduced to 8, pale planters, sage foliage.
- Server LEDs use status green/blue; research screens on near-black with crisp slate/blue type.
- Lighting: NoToneMapping (palette-accurate), white hemi + single soft sun, 2048 PCF soft shadows, tuned bias/normalBias.
- Camera framing: projects slab corners into view space and fits with ~8% margin (3% on portrait) for any aspect — no empty bands on phone.
- Tags: white pill + hairline border, status-dot colours from spec; collision pass (working first, idle staggered up 18px, faded if still colliding); integer px.
- HUD: secondary Simulate button bottom-centre, blue Simulation pill, amber feed chip top-right, new "N working" live chip.
- Password gate: centred white card, large title, blue primary button, blurred backdrop.
- Usage board: white panel, blue top rule, #111827 large figure, no-mipmap text.
- Unchanged: desk snap logic in bots/bot.ts, Worker API, TEAM ids/colours, `simulated` flag in apply().

## 2026-10-30
- Fishbowl glass curtain, per-bot workstations with RGB underglow + animated screens, per-bot outfits.
