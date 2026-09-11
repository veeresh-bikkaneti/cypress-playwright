# Setup-and-use screen recording

Committed artifact: [`setup-and-use.mp4`](./setup-and-use.mp4)  
Poster: [`poster.png`](./poster.png)

The video is the human walkthrough of:

1. Docs home (`docs/index.html`) — what is in the repo, why not squash, setup commands
2. Interactive architecture (`docs/architecture.html`) — Setup and Migrate flows, Consumer vs Demo

## Regenerate

From the repo root (Playwright browsers already required for the test suite):

```bash
node docs/demo/record-demo.mjs
```

That script:

- Serves `docs/` on `127.0.0.1:4173`
- Records 1280×720 Chromium
- Writes `docs/demo/setup-and-use.webm` then transcodes to H.264 MP4 with ffmpeg
- Writes `docs/demo/poster.png` from the architecture diagram

Keep the MP4 under GitHub’s 50 MB warning. Do not Git-LFS it — GitHub.com will play a committed `.mp4` from the file view.
