# Built with Codex Astra

**Date:** October 12, 2026. **Direction:** Dan Jeong / Sundayable.

Dan asked Codex to build a genuinely useful public demo for small business owners, without paid APIs, as part of his Codex Ambassador application. This repository is the resulting working project.

1. **Choose the daily task.** Drafting thoughtful customer review replies is a small, repeatable business-owner task. The app supports English and Korean, matching Dan's intended workshop audience.
2. **Build and test the core.** Codex Astra implemented a deterministic drafting engine, topic suggestions, a sensitive-business mode, input validation, and tests for mixed reviews, privacy, Korean output, invalid input, and HTML injection handling. See the first commit, `a573667`.
3. **Build the workspace.** Codex Astra created the responsive interface, editable output, clipboard fallback, text download, example reviews, stale-input notices, and local-only behavior. The model was used to build the software, not to process users' reviews at runtime.
4. **Verify and ship.** `npm test` passed all 11 tests. `npm run build` succeeded. Aside browser checks covered empty-input errors, English generation, a Korean professional reply at phone width, editing, clipboard copy, and a downloaded `.txt` containing the edited draft. The deployed app generated a reply successfully. An anonymous HTTP request to the production URL returned the expected app title and its `connect-src 'none'` Content Security Policy.

**Live app:** https://review-reply-studio-seven.vercel.app/

**Initial production deployment:** `dpl_7B3cdHW1DrPufZXcMkVPPTbzFScZ`, Sundayable Vercel team, source revision `13aa1b1`. The generated team/branch alias requires login, so the public project domain above is used throughout the application materials.

**Final link update:** source revision `8b15706`, deployed as `dpl_By7UVs7MZNsPiDe4TAAM7T5wm5n1`. The portfolio uses the clean public route https://proof.getsundayable.com/dan-jeong/ . Tests and build passed again after the link update.

**Codex session reference:** `01a1328f-9415-75a1-8093-23db2f93b5e0`. The session itself is kept private; this log and the actual commits provide the public build record.

The commit history preserves the build stages. No emails, customer data, attendee rosters, access tokens, or private application research are included in this repository.
