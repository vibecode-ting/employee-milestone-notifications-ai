# Project Guidelines & Rules

## ⚠️ Critical Rule: Never Commit or Push Directly to `main`
- **NEVER** commit or push directly to `main`.
- All development must occur on feature branches (`feat/...`, `fix/...`, `chore/...`).
- To deploy to production:
  1. Create a feature/fix branch.
  2. Test locally (`npm run build`).
  3. Push branch and open a Pull Request (PR) against `main`.
  4. CI runs build and tests on PR.
  5. PR **must be approved by user** before merge.
  6. Merging into `main` triggers production deploy to Firebase Hosting.
