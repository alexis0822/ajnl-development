# AJNL Development

A polished, responsive portfolio starter built with plain HTML, CSS, and a small amount of JavaScript. It is ready to open locally or deploy to any static host.

## Run locally

No build step is required.

1. Open `index.html` directly in a browser, or
2. Serve the folder with a simple local server:

```bash
cd ajnl-development
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Replace the placeholders

All editable portfolio content lives in `index.html`.

- **Photo:** Replace the `.portrait-placeholder` block with an image such as `<img src="assets/profile.jpg" alt="Alexis Negrón" />`. Keep the existing class if you want the same sizing.
- **Project screenshots:** The Healthy Body Rehab and International Cabinets cards now use optimized screenshots from `assets/images/` and open an accessible gallery. Add or replace gallery images in the matching folder, then update the image count and captions in `script.js` if needed.
- **Project names and descriptions:** Update the `<h3>` and the paragraph inside each `.project-card`. The first two cards currently use verified public details for Healthy Body Rehab and International Cabinets Group Corp.; the third card remains a generic placeholder.
- **Tech stacks:** Edit the `<li>` elements inside each `.tech-list`. The current labels reflect the public repository structure, not a private implementation detail.
- **Project links:** The first two cards point to their verified live domains. For the third card, replace `href="#contact"` on its `.placeholder-link` with the real project URL and remove the `placeholder-link` class and `data-project` attribute.
- **Project onboarding:** The `Start a project` button opens `onboarding.html`, a three-step brief that collects project direction, scope, budget, timeline, and contact details.
- **Contact email:** The portfolio and onboarding email drafts use `alexisjnegron@gmail.com` as the recipient.
- **Forms:** The forms are intentionally non-functional until you add a Formspree endpoint to the inline setup notes in `index.html` and `onboarding.html`.

## Verified project references

- **Healthy Body Rehab:** `https://www.healthybodyrehab.com` · public repo: `alexis0822/HBR-page`
- **International Cabinets Group Corp.:** `https://internationalcabinetsgc.com/` · public repo: `alexis0822/International-Cabinets-test`

These links and descriptions were checked against the connected GitHub repositories and Google Analytics web-stream configuration on September 5, 2026. No private Analytics metrics are displayed on the portfolio page.

## Customize the look

The main design tokens are at the top of `styles.css`. Update the color variables, typography, spacing, and max container width there before changing individual components. `--accent-deep` controls the darker hover and focus color used by the project links so they stay readable on the light work section.

## Design direction

The current direction takes cues from the reference homepage you shared without copying its wording, imagery, or exact section structure:

- **Hero:** full-bleed, dark, image-like stage with a centered statement and one primary CTA.
- **Navigation:** quiet overlay navigation with a simple brand lockup and one high-contrast action.
- **Typography:** large, light-weight display type with compact supporting copy and restrained mono labels.
- **Color:** near-black and warm paper neutrals, with a small electric-blue accent used for emphasis.
- **Layout:** generous vertical spacing, full-width bands, and simple project presentation instead of nested cards.
- **Motion:** short hover transitions plus subtle scroll reveals; reduced-motion users get the same layout without animation.
- **Navigation:** fixed at the top with a transparent hero state and a soft dark blur once the page moves beneath it.

The hero still uses CSS art as a visual placeholder, while the first two project cards now use real screenshots supplied for the portfolio.

## Project galleries

Click either filled project image to open its lightbox gallery. Visitors can use the previous/next buttons, thumbnail strip, keyboard arrows, Escape, or horizontal touch swipes. The Fullscreen control uses the browser Fullscreen API when available and falls back to an edge-to-edge modal when it is not.

- **Healthy Body Rehab:** `assets/images/healthybody/healthybody-01.jpg` through `healthybody-04.jpg`
- **International Cabinets:** `assets/images/icg/icg-01.jpg` through `icg-06.jpg`
- **Optimization:** source PNGs are resized to 1800px maximum dimension and exported as JPEG copies for the web; the original Desktop folders are unchanged.
- **Accessibility:** project images are keyboard-focusable, gallery focus is restored on close, controls have labels, and reduced-motion users avoid gallery transitions.

## Scroll reveal motion

The page uses a small `IntersectionObserver` in `script.js` instead of an animation library. Elements with `data-reveal` fade in and move upward by a small distance as they enter the viewport. The hero uses `data-reveal="load"` so it appears on first load.

- **Adjust the motion:** change `--reveal-distance` or `--reveal-duration` near the top of `styles.css`.
- **Adjust the stagger:** change each element’s `data-reveal-delay` value in milliseconds.
- **Disable motion for a section:** remove its `reveal` class and `data-reveal` attribute.
- **Accessibility:** users with `prefers-reduced-motion: reduce` see all content immediately with no transform or transition. If `IntersectionObserver` is unavailable, the script also reveals everything as a no-motion fallback.

## Sticky navigation

The nav stays fixed while scrolling. It starts transparent over the hero and receives a light dark tint plus backdrop blur after the page moves more than 24 pixels, keeping it readable over the light project and contact sections.

- **Adjust the trigger:** change the `24` value in `updateHeader()` inside `script.js`.
- **Adjust the tint:** edit `.site-header.is-scrolled` in `styles.css`.
- **Disable the sticky behavior:** change `.site-header` from `position: fixed` to `position: absolute` and remove the header scroll listener in `script.js`.

## Project onboarding

`onboarding.html` and `onboarding.js` provide a no-backend intake flow. The form validates required answers, saves draft responses to `localStorage`, creates a readable project summary, and offers both copy-to-clipboard and a prefilled `mailto:` draft. The `mailto:` link opens the device’s configured default email provider, such as Gmail when it is registered as the handler. The page never sends email automatically; the visitor reviews the draft and presses Send.

- **Change the recipient:** update `contactEmail` near the top of `onboarding.js` and the owner email links in `index.html` and `onboarding.html`.
- **Customize questions:** edit the field markup in `onboarding.html` and update `getFormData()` plus `formatSummary()` in `onboarding.js`. `formatSummary()` controls the plain-text brief and the body of the email draft.
- **Disable draft saving:** remove the `input` and `change` listeners that call `saveDraft()`.
- **Connect a real backend later:** replace the submit handler near the bottom of `onboarding.js` with a `fetch()` request to Formspree, Netlify Forms, your own API, or another form service. Send `getFormData()` as structured data or `formatSummary(getFormData())` as plain text, then keep the on-screen summary as a fallback.
- **Add automatic delivery later:** configure the destination email in the future service or API, not in browser-only code. Keep `contactEmail` for the current `mailto:` draft and add loading, success, and failure messages around the future request.
- **Documents copy:** the packaged standalone folder is saved at `~/Documents/AJNL-Development-Portfolio` on this Mac.
- **Step logic:** `Continue` advances only after the current step validates. `Build my summary` is hidden until the final step, and `syncStepControls()` re-applies that rule on load and after every transition so both actions cannot appear together.

## File structure

```text
ajnl-development/
├── assets/
│   └── images/
│       ├── healthybody/
│       └── icg/
├── index.html
├── onboarding.html
├── onboarding.css
├── onboarding.js
├── script.js
├── styles.css
└── README.md
```
