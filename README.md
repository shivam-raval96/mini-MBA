# Mini-MBA Notes

Interactive notes from the Harvard Mini-MBA. Static HTML site, no build step.

Live site: https://shivam-raval96.github.io/mini-MBA/

## Structure

```
mini-MBA/
├── index.html               ← landing page (edit the topic list here)
├── topics/
│   ├── strategy.html
│   ├── finance.html
│   ├── marketing.html
│   ├── accounting.html
│   ├── operations.html
│   └── _template.html       ← copy this when adding a new topic
├── assets/
│   ├── style.css            ← Harvard crimson theme + layout
│   └── script.js            ← TOC, margin comments, ref tooltips
└── .nojekyll                ← serve raw files on GitHub Pages
```

## Editing content

### Text
All prose lives inside `<article class="topic-content">`. Plain HTML — no Markdown step. Sections start with `<h2>` (subsections `<h3>`); the **left TOC is generated automatically** from those headings.

### Margin comments (right side, anchored to text)
Add an anchor in the prose and a matching note in the right column:

```html
<!-- in the paragraph -->
...some claim<sup class="comment-anchor" data-comment="c1">1</sup>...

<!-- in <aside class="comments-col"> -->
<div class="comment" data-for="c1">
  <span class="comment-num">1.</span> Margin note text.
</div>
```

JS positions each comment vertically next to its anchor. Clicking either side scrolls to the other.

### References (tooltips on hover + list at bottom)
Wrap the cited phrase, give it a key, and add an `<li>` with the same `id`:

```html
<!-- in the prose -->
<span class="ref" data-ref="r-porter1996">Porter (1996)</span>

<!-- or with no visible phrase, just a superscript marker -->
<span class="ref" data-ref="r-porter1996"></span>

<!-- in the references section at the end -->
<li id="r-porter1996">Porter, M. E. (1996). What Is Strategy? <em>HBR</em>, 74(6).</li>
```

A `[N]` superscript is added automatically, hover shows the full citation, click jumps to the references list.

### Other building blocks
- **Term box**: `<div class="term"><span class="term-name">Foo</span> Definition.</div>`
- **Figure with SVG**: wrap an `<svg>` in `<figure>` and add `<figcaption>`.
- **Blockquote / table**: plain HTML, styled by CSS.

## Adding a new topic

1. `cp topics/_template.html topics/your-topic.html`
2. Edit title, subtitle, content, references.
3. Add a `<li>` to the topic list in `index.html`.

## Local preview

```bash
cd mini-MBA
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

GitHub Pages from the `main` branch. After pushing, in the repo settings → Pages → set source to `main` / root. Site will be at `https://shivam-raval96.github.io/mini-MBA/`.
