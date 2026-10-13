# Review Reply Studio

A useful little tool for small business owners: turn a customer review into two editable replies in English or Korean. Built with **Codex Astra**, directed by Dan Jeong, October 12, 2026.

- **Live:** https://review-reply-studio-seven.vercel.app
- **Dan's portfolio:** https://proof.getsundayable.com/dan-jeong/
- **Build log:** [BUILD_LOG.md](BUILD_LOG.md)

## What it does

Paste a review, select its rating and a response style, and create two drafts. You can choose a topic, add a public business contact, edit the wording, copy a reply, or download both drafts. English and Korean examples are included. A neutral privacy mode avoids confirming personal details for sensitive businesses.

This is a **Codex-built app**, not a runtime AI service. It uses deterministic templates and simple topic matching. It makes no model/API calls and requires no API key. That keeps the demo free, fast, and easy to run in a workshop.

## Privacy and limits

Review text stays in the current browser tab. There are no analytics, cookies, saved reviews, accounts, or backend. The app never posts on your behalf. Static hosting still receives normal page/asset requests, but not review text. Clipboard and downloaded text are controlled by the user.

Topic matching can be wrong. Check the suggested topic, facts, tone, and privacy before posting. The tool does not investigate a complaint, provide legal advice, or verify the review. It does not invent compensation, refunds, completed fixes, or customer details. A high rating with concern words produces a neutral draft and a note. Sensitive-detail detection is a convenience, not a complete personal-data detector.

## Run locally

Node.js 20 or newer. No dependencies are needed.

```sh
npm test
npm run build
npm run dev
```

Open `http://127.0.0.1:4173` in your browser. Build output is in `dist/`. Deploy that directory to a static host; `vercel.json` supplies the Vercel build and security headers.

## How it is built

- Plain HTML, CSS, and ES modules; no framework or build dependency.
- Pure drafting logic in `src/engine.js`, independently tested with Node's test runner.
- User text is assigned with `textContent` / textarea values, never interpreted as HTML.
- Content Security Policy blocks outbound connections from the app.
- Self-hosted fonts; keyboard controls, visible focus, reduced-motion support, and responsive layout.
- Sundayable's current Paper/Card/Ink brand, Gabarito and Figtree typography.

The [portfolio page](https://proof.getsundayable.com/dan-jeong/) was also built with Codex Astra during the same work session. Event counts there distinguish registrations from Luma's public “Went” labels; the intro-video slot remains pending until Dan provides the recording.

## License

Application code: [MIT](LICENSE). Bundled Gabarito and Figtree fonts are distributed under their respective SIL Open Font Licenses, included in `public/fonts/`.
