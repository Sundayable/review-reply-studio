# Built with Codex Astra

**Date:** October 12, 2026. **Direction:** Dan Jeong / Sundayable.

Dan asked Codex to build a genuinely useful public demo for small business owners, without paid APIs, as part of his Codex Ambassador application. This repository is the resulting working project.

1. **Choose the daily task.** Drafting thoughtful customer review replies is a small, repeatable business-owner task. The app supports English and Korean, matching Dan's intended workshop audience.
2. **Build and test the core.** Codex Astra implemented a deterministic drafting engine, topic suggestions, a sensitive-business mode, input validation, and tests for mixed reviews, privacy, Korean output, invalid input, and HTML injection handling. See the first commit, `a573667`.
3. **Build the workspace.** Codex Astra created the responsive interface, editable output, clipboard fallback, text download, example reviews, stale-input notices, and local-only behavior. The model was used to build the software, not to process users' reviews at runtime.
4. **Verify and ship.** Test and browser/deployment results are recorded below after verification.

The commit history preserves the build stages. No emails, customer data, attendee rosters, access tokens, or private application research are included in this repository.
