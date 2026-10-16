---
name: frontend
description: Frontend UI/UX design, Chrome DevTools live testing, accessibility audit, and GitHub issue generation.
---

# Frontend Skill: UI/UX Quality & Chrome DevTools Live Testing

Use this skill when designing, reviewing, or testing frontend interfaces, especially on live deployments.

## 1. UI/UX & Design System Principles
- **Clarity over cleverness**: High-contrast text, legible fonts, clear borders and active focus rings.
- **Solid crisp surfaces**: Avoid washed-out low-contrast frosted blurs that compromise text readability.
- **Responsive-first**: Test 375px (mobile portrait), 768px (tablet), 1280px (standard desktop), and 1920px (widescreen).
- **Accessibility (a11y)**:
  - Form controls have matching `<label>` elements.
  - Interactive elements have keyboard focus visibility and `aria-*` tags.
  - Color contrast meets WCAG AA (minimum 4.5:1 for body text, 3:1 for large text/icons).
- **Graceful Loading & Errors**: Always show spinners/skeletons during async ops; display actionable inline error banners.

## 2. Chrome DevTools Testing Workflow
Run Chrome in headless or remote debugging mode to audit live URLs:

```bash
# Dump DOM & verify initial render:
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --dump-dom "https://example.com"

# Capture desktop screenshot:
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --screenshot="desktop.png" --window-size=1280,800 "https://example.com"

# Capture mobile screenshot (iPhone/Pixel viewport):
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --screenshot="mobile.png" --window-size=375,812 "https://example.com"
```

### Automated Chrome DevTools Protocol (CDP) Scripting:
Use Node.js with native `http` or WebSocket to connect to Chrome's `--remote-debugging-port` to:
- Capture console errors (`Runtime.consoleAPICalled`, `Log.entryAdded`).
- Inspect network requests and failed HTTP calls.
- Query computed CSS styles and layout bounds.
- Measure Core Web Vitals (LCP, CLS, FID).

## 3. GitHub Issue Creation Standard
When bugs or UX regressions are identified during live site audits, file an issue via `gh issue create`:

```bash
gh issue create \
  --title "<type>(<scope>): <concise description>" \
  --body "### Summary
<what is happening>

### Steps to Reproduce
1. Navigate to <url>
2. Observe <element>

### Expected Behavior
<what should happen>

### Actual Behavior / Live Audit Finding
<console errors, screenshot refs, or metrics>" \
  --label "bug,ui/ux"
```
