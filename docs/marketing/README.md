# Bot Office marketing package

An 80-second portfolio film showing actual app-rendered simulation footage. Deliverables are generated in `marketing-output/` (ignored by Git):

- `bot-office-youtube.mp4`: 1920x1080, 16:9, H.264/AAC, 30 fps.
- `bot-office-linkedin.mp4`: 1080x1350, 4:5, separately composed for the feed, H.264/AAC, 30 fps.
- `bot-office-captions.srt`: narration captions; phrase captions are also burned into both videos.
- `thumbnail.jpg`: YouTube cover.

## Story and truthfulness

Hook → team roles → dedicated workstations → movement → camera and lighting → demo/live distinction → GitHub invitation. A simulation disclosure remains on every frame. The five product-name personas are illustrative, not connected services, endorsements, or autonomous execution demonstrations. No hiring outcomes or performance metrics are claimed.

The captured viewport is motion-interpolated to 30 fps during export; this is an edited portfolio film, not a real-time performance benchmark. Typography and captions are not motion-interpolated.

Narration: synthetic Microsoft Zira Desktop voice generated locally, not a recording or clone of the creator. Original ambient score is synthesized by `assemble.py`; no stock music or external music samples. Captions use sentence timing proportional to the synthesized narration duration; they are not word-level forced alignment.

## Reproduce

1. Run `powershell -File scripts/marketing/narrate.ps1` to generate narration from the manifest using Windows System.Speech. The manifest records each segment duration.
2. `npm run dev -- --host 127.0.0.1 --port 5175`
3. `python scripts/marketing/capture-server.py`
4. Open `http://127.0.0.1:5175/?simulate=1&record=1`, keep the tab active, and click **Record portfolio film**. The development-only tool records the actual rendered scene into two compositions and saves to the local sink. It is absent from the production bundle.
5. `python scripts/marketing/assemble.py` (requires FFmpeg and NumPy).
6. Inspect representative frames, captions, duration, audio and playback before publishing.

The local capture sink accepts only the two expected filenames and the development origin. Stop it after recording. Videos are prepared for manual upload; no YouTube or LinkedIn posting is performed.

## YouTube title

I Built a 3D Office for an AI Team | Bot Office

## YouTube description

What if AI teamwork were easier to understand at a glance?

Bot Office is my interactive 3D workspace for visualizing agent status. This walkthrough shows a public simulation with dedicated research, QA, marketing, product, and data-analysis workstations, animated desk journeys, and day-to-night lighting.

The named AI personas are illustrative, not connected third-party services. The separate authenticated live mode displays status pushed by the real bot team.

Built with TypeScript, Three.js, Vite, and a Cloudflare Worker with a SQLite Durable Object.

Code: https://github.com/MRSHAKILS/bot-office

Interested in software engineering, research tools, and useful AI interfaces? Let's connect and build something useful.

Synthetic narration. Simulated footage. #ThreeJS #TypeScript #SoftwareEngineering

## LinkedIn post

I wanted to make AI teamwork easier to understand—so I built Bot Office.

It turns agent status into an interactive 3D workspace: dedicated workstations, visible desk journeys, a team directory, and day-to-night lighting.

This demo explores research, QA, marketing, product planning, and data analysis. The product-name personas are illustrative; they aren't third-party integrations. A separate authenticated mode reads real bot status.

The interesting engineering work was keeping the visual story honest: separating demo and live identities, matching department labels to roles, and checking movement through the floor plan.

Built with TypeScript, Three.js, Vite, and Cloudflare. I'd love to bring this mix of software engineering, research-minded testing, and product thinking to a team building useful tools.

Code: https://github.com/MRSHAKILS/bot-office

What would help you understand an AI team's work at a glance?

#SoftwareEngineering #ThreeJS #BuildInPublic

## Final ElevenLabs edition

Use `marketing-output/bot-office-youtube-elevenlabs.mp4` and `marketing-output/bot-office-linkedin-elevenlabs.mp4`. These replace the rejected Windows narration with Jamie - Upbeat & Professional (ElevenLabs v4). Generation ID: JUCs5eYwfgQHOn0KUnpi. No voice cloning was used.

Run `python scripts/marketing/finish-elevenlabs.py` after downloading the authorized narration as `marketing-output/elevenlabs-jamie.mp3`. The seven audio sections are split at detected silence midpoints and placed at the original chapter starts. Caption phrase timing is proportional within each section, not forced-aligned word timing; transcription service was unavailable. Final footage uses temporal frame blending; this is an edited film, not a real-time rendering benchmark. The older `assemble.py` exports are superseded.
