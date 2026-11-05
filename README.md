# Fontnexa

Fontnexa is a responsive Unicode text generator and personal portfolio project by Arbaz Ali. Visitors can enter text, browse category-based styles, copy a result, and send feedback through Formspree while the website stays hosted on GitHub Pages.

## Features

- 13 categories, including Gaming, Instagram, WhatsApp, Love, Business, Study, and Festive.
- 396 available styles: 36 for Gaming and 30 for every other category.
- Search, category filters, copy-to-clipboard support, and a `Show more styles` control.
- Recent Copies stored only in the visitor's browser, with a clear-history control.
- A light interface by default, with a separate dark preview for Gaming styles.
- Creator profile and portfolio sections with skills, projects, and experience.
- LinkedIn and GitHub profile links, a browser-tab favicon, and a branded social-preview image.
- A short Unicode compatibility note and a privacy note beside the feedback form.
- A feedback form connected to Formspree.

## Project structure

```
fontnexa/
├── assets/
│   ├── arbaz-ali.png                 # Creator portrait
│   ├── fontnexa-favicon.svg           # Browser-tab icon
│   └── fontnexa-social-preview.png    # Social sharing background
├── css/
│   └── style.css       # Responsive layout, light theme, and Gaming dark mode
├── js/
│   └── app.js          # Unicode styles, filters, copying, pagination, and form behaviour
├── index.html          # Page content and accessible structure
└── README.md           # Project and deployment guide
```

## How the generator works

1. `index.html` receives text from the main input box.
2. `js/app.js` converts letters into supported Unicode variants, such as mathematical bold, italic, monospace, double-struck, full-width, circled, and small-caps characters.
3. Each category combines a text transformation with decorative Unicode symbols. A small style factory expands the catalogue consistently instead of duplicating the same code hundreds of times.
4. The browser updates results live. It initially shows 12 cards and adds more only when the visitor selects **Show more styles**.
5. Clicking a card copies its exact text with the Clipboard API. A fallback handles browsers where that API is unavailable.
6. A successful copy is saved in **Recent Copies** on that browser only. Visitors can re-copy an entry or clear the history at any time.

## Why this project uses vanilla HTML, CSS, and JavaScript

This project does not need a framework or build step. Keeping it in vanilla technologies makes it simple to host, makes the text generator fast to load, and provides direct practice with DOM events, responsive CSS, browser APIs, and accessible HTML forms.

## Run locally

Open `index.html` in a modern browser. No package installation or build command is needed.

For the feedback form, use the deployed GitHub Pages URL. Local file previews cannot submit to Formspree correctly.

## Deploy free with GitHub Pages

1. Create a public GitHub repository named `fontnexa`.
2. Upload the complete project folder. Keep `index.html` at the repository top level and keep the `assets`, `css`, and `js` folders unchanged.
3. In GitHub, open **Settings** → **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose the `main` branch and `/ (root)` folder, then select **Save**.
6. Open the generated `github.io` link to test the generator and feedback form.

## Feedback form setup

The feedback form submits to Formspree and does not require a server in this repository. Formspree handles the form delivery and sends notifications to the configured receiving email address.

## Talking points for an interview

- The generator uses Unicode characters rather than downloaded font files, so copied text works in many social apps and games.
- The style library is data-driven: transformations and decorators are combined by category to make the large collection maintainable.
- The Gaming filter toggles a class on the document body, allowing the same layout to use a focused dark colour palette.
- Results are paginated in the browser to avoid rendering every card at once.
- The feedback form sends a `FormData` request to a Formspree endpoint, allowing it to work from GitHub Pages.

## Future improvements

- Add a saved favourites list with `localStorage`.
- Add share links for common social platforms.
- Add manually curated regional-language styles after checking how they render across devices.
- Add a dedicated portfolio domain and project case studies.
