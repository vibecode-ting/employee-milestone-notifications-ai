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

## Agent & Model Specifications
- **Model Target**: Gemini Flash / Antigravity routing (`gemini-3.6-flash`, `gemini-3.8-flash`, `gemini-2.0-flash`).
- Dual multimodal vision & OCR capabilities powered by Google AI Studio API and Firebase Cloud Functions.
- All AI generative outputs must have fallback templates for offline and demo safety.

## Testing & Build Validation
- Always run `npm run build` locally to validate TypeScript (`tsc -b`) and Vite production bundle before committing.
- Ensure no unresolved merge conflict markers or syntax errors exist.
- Double-check Firestore security rules and Cloud Functions compatibility when modifying schemas.

## Project Coding Conventions
- **Frontend Stack**: React 18, Vite, TypeScript, Tailwind CSS, Lucide icons.
- **Backend & Cloud**: Firebase Authentication, Firestore Database, Firebase Storage, and Google Cloud Functions.
- **State & Theme**: Dark/light theme support with high-contrast accessibility across all viewports.
- **Co-authoring**: No automated co-author trailers or third-party AI signatures in commit messages.
