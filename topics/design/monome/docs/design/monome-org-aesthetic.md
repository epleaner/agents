# Monome.org aesthetic (observed)

## 1. Overview

This document describes the observed visual language and UI patterns across monome.org and monome.org/docs, based on the captured screenshots in `artifacts/screenshots/monome-org/`.

The site presents two closely-related but distinct "modes":
- A commerce / editorial surface with a dark, text-forward layout and product photography (`../../artifacts/screenshots/monome-org/products/site__home__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__policy__desktop.png`).
- A documentation surface with an intentionally plain, manual-like UI (sidebar navigation, restrained typography, and blue link accents) (`../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__serialosc__setup__desktop.png`).

## 2. Visual positioning and brand tone

1) Craft-forward, minimal, and "human scale" rather than corporate.
- The store/product surface reads like a field note: long-form paragraphs, low visual ornament, and plain language, reinforced by the explicit "tiny organization" tone on policy pages (`../../artifacts/screenshots/monome-org/products/site__policy__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__home__lower__desktop.png`).

2) Tools-as-instruments framing.
- Product narratives emphasize use, behavior, and possibility, not feature marketing; the layout keeps copy adjacent to hardware photos instead of isolating specs into a separate module (`../../artifacts/screenshots/monome-org/products/site__home__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__home__mid__desktop.png`).

3) Documentation as a quiet knowledge base.
- The docs UI prioritizes stable reading over novelty: simple navigation, neutral backgrounds, and a consistent page scaffold across topics (`../../artifacts/screenshots/monome-org/docs/docs__help__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__norns__scripting__desktop.png`).

## 3. Design principles extracted

1) Reduce choices; let content carry.
- Pages lean on a small set of primitives (headings, paragraphs, links, rules, images, code blocks) rather than custom card systems (`../../artifacts/screenshots/monome-org/docs/docs__serialosc__setup__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__past__desktop.png`).

2) Prefer durable typography to decorative styling.
- Emphasis is created via size, weight, underline rules, and spacing; color is mostly reserved for links and occasional secondary text (`../../artifacts/screenshots/monome-org/docs/docs__help__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__policy__desktop.png`).

3) Photography conveys material truth.
- Images are naturalistic, with real surfaces, neutral lighting, and minimal post-treatment; they behave as evidence, not adornment (`../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__bstock__mobile.png`).

4) Provide exits and anchors.
- Repeated "back to top" and a consistent footer afford a predictable reading loop (`../../artifacts/screenshots/monome-org/docs/docs__help__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__grid__firmware__desktop.png`).

## 4. Typography, hierarchy, and rhythm

1) Docs: large, bold page titles with a signature underline.
- H1s are prominent and paired with a horizontal rule that signals section start (e.g., "help", "scripting") (`../../artifacts/screenshots/monome-org/docs/docs__help__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__norns__scripting__desktop.png`).

2) Docs: restrained body text with link-as-primary accent.
- Body copy is medium gray on white, with standard paragraph spacing; links are bright blue and stand out as the primary interactive signal (`../../artifacts/screenshots/monome-org/docs/docs__norns__scripting__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`).

3) Site: monospaced, lowercase-forward voice.
- The commerce/editorial pages use a monospaced feel (or monospaced-like rhythm), frequent lowercase, and dense leading; emphasis comes from underline and occasional bold labels like prices and headings (`../../artifacts/screenshots/monome-org/products/site__past__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__policy__desktop.png`).

4) Rhythm: long scroll, punctuated by media.
- Large photography blocks interrupt long text runs to reset attention without introducing new UI constructs (`../../artifacts/screenshots/monome-org/products/site__home__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__home__lower__desktop.png`).

## 5. Layout, information architecture, and navigation

1) Docs desktop: persistent sidebar + content column.
- Left nav lists product families and expands via small chevrons; content stays in a centered column with generous margins (`../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__help__desktop.png`).

2) Docs navigation layers: global -> section -> page.
- Breadcrumbs show local context (e.g., `norns / scripting`), while the sidebar provides cross-section movement (`../../artifacts/screenshots/monome-org/docs/docs__norns__scripting__desktop.png`).

3) Docs includes search as a first-class affordance.
- A search field sits at the top of the docs layout on desktop, aligned with the minimal IA approach (`../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`).

4) Site: intentionally simple IA, leaning on scroll.
- The store/editorial surface reads as a single narrative flow; product CTAs appear inline (e.g., "add to cart" buttons) rather than as separate card grids (`../../artifacts/screenshots/monome-org/products/site__home__mid__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__home__mobile.png`).

## 6. Color and contrast

1) Docs palette: off-white + light gray scaffolding, blue link accent.
- Sidebar sits on a light gray field, main content on white, and links are consistently blue (`../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__help__desktop.png`).

2) Site palette: charcoal canvas with near-white text.
- Long-form pages maintain high readability via bright text on dark background; secondary text shifts to a softer gray (`../../artifacts/screenshots/monome-org/products/site__policy__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__past__desktop.png`).

3) UI controls are subdued.
- Buttons (e.g., add-to-cart) use a simple neutral fill rather than brand color blocks, keeping focus on content and photos (`../../artifacts/screenshots/monome-org/products/site__home__mid__desktop.png`).

## 7. Code and technical content styling

1) Monospaced code blocks on a light gray panel.
- Docs use inset code blocks with a subtle gray background and minimal syntax color; blocks are integrated into the reading flow rather than visually framed as "widgets" (`../../artifacts/screenshots/monome-org/docs/docs__serialosc__setup__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__serialosc__osc__desktop.png`).

2) Inline code appears as small gray pills.
- Inline tokens like file paths or identifiers are rendered as compact, rounded or boxed tags, supporting scanability in instructions and reference sections (`../../artifacts/screenshots/monome-org/docs/docs__grid__firmware__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__serialosc__setup__desktop.png`).

3) References lean on tables and dense lists.
- API/reference-style pages use long, structured lists (and table-like layouts) with links as the navigation backbone (`../../artifacts/screenshots/monome-org/docs/docs__norns__reference__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__crow__reference__desktop.png`).

## 8. Imagery and material cues

1) Material honesty: neutral lighting, real environments.
- Photos show devices on wood, concrete, and studio backdrops without heavy gradients or graphic overlays (`../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__bstock__mobile.png`).

2) Documentation uses images as context, not decoration.
- Pages often lead with a single product photo, then move immediately into text instructions and links (`../../artifacts/screenshots/monome-org/docs/docs__grid__firmware__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__iii__index__desktop.png`).

3) Commerce pages use image cadence to pace long scroll.
- Repeated image blocks segment product descriptions and maintain engagement without introducing complex layout systems (`../../artifacts/screenshots/monome-org/products/site__home__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__home__lower__desktop.png`).

## 9. Interaction and motion (or absence)

1) Interaction is mostly conventional links.
- The dominant affordance across both surfaces is the hyperlink (blue in docs, underlined in site lists), with minimal additional UI chrome (`../../artifacts/screenshots/monome-org/docs/docs__help__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__past__desktop.png`).

2) Docs navigation supports expansion but avoids visual theatrics.
- Sidebar items show chevrons suggesting collapsible sections; the page content itself remains static and typography-led (`../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`).

3) Commerce CTAs are plain, high-contrast blocks.
- Add-to-cart buttons are large and simple, implying directness over delight animation (`../../artifacts/screenshots/monome-org/products/site__home__mid__desktop.png`).

## 10. Responsive behavior

1) Docs: sidebar collapses to a hamburger menu.
- Desktop shows persistent nav; mobile reduces it to a top bar with a menu icon, keeping content as a single column (`../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__index__mobile.png`).

2) Docs: typography scales while preserving hierarchy cues.
- Titles remain large and underlined; spacing stays generous even on mobile (`../../artifacts/screenshots/monome-org/docs/docs__norns__scripting__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__norns__scripting__mobile.png`).

3) Site: inherently single-column; mobile is a straight reflow.
- The long-scroll narrative and images stack naturally; the main change is tighter line length and denser vertical cadence (`../../artifacts/screenshots/monome-org/products/site__home__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__home__mobile.png`).

## 11. Component and pattern inventory

Docs surface (monome/docs):
- Top bar: "monome/docs" label + hamburger (mobile) / search (desktop) (`../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__index__mobile.png`).
- Sidebar nav with collapsible section groups and a persistent "monome" home link (`../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`).
- Breadcrumb row for local context (`../../artifacts/screenshots/monome-org/docs/docs__norns__scripting__desktop.png`).
- H1 with underline rule; section headings that repeat the rule motif (`../../artifacts/screenshots/monome-org/docs/docs__help__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__serialosc__setup__desktop.png`).
- Inline code pills + fenced code blocks (`../../artifacts/screenshots/monome-org/docs/docs__grid__firmware__desktop.png`, `../../artifacts/screenshots/monome-org/docs/docs__serialosc__osc__desktop.png`).
- Reference layouts: long lists, tables, and anchor-heavy pages (`../../artifacts/screenshots/monome-org/docs/docs__norns__reference__desktop.png`).
- Footer pattern: "back to top" and "help" links (`../../artifacts/screenshots/monome-org/docs/docs__help__desktop.png`).

Site surface (monome.org):
- Long-scroll narrative sections mixing text, lists, and photography (`../../artifacts/screenshots/monome-org/products/site__home__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__home__lower__desktop.png`).
- Prominent neutral add-to-cart buttons with price + short spec line blocks (`../../artifacts/screenshots/monome-org/products/site__home__mid__desktop.png`).
- Simple legal/policy documents with numbered lists and divider rules (`../../artifacts/screenshots/monome-org/products/site__policy__desktop.png`).
- Footer signature pattern: "monome — updated <date>" (`../../artifacts/screenshots/monome-org/products/site__policy__mobile.png`, `../../artifacts/screenshots/monome-org/products/site__past__desktop.png`).

## 12. Guardrails (if you extend or re-skin)

1) Keep the system small.
- Prefer the existing primitives (type, rules, links, images, code blocks) over introducing new "component kits" (`../../artifacts/screenshots/monome-org/docs/docs__help__desktop.png`).

2) Preserve link semantics as the key interaction language.
- Docs: blue links on light background; site: underlined links on dark background (`../../artifacts/screenshots/monome-org/docs/docs__serialosc__setup__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__past__desktop.png`).

3) Maintain generous whitespace and readable measure.
- Docs rely on calm margins; site relies on tight, consistent single-column text that doesn't collapse into multi-column complexity (`../../artifacts/screenshots/monome-org/docs/docs__help__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__policy__desktop.png`).

4) Photography should remain documentary.
- Avoid glossy 3D renders or heavy overlays; the current image language is grounded and tactile (`../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`, `../../artifacts/screenshots/monome-org/products/site__bstock__mobile.png`).

5) Avoid decorative motion.
- If motion is introduced, it should be functional (e.g., nav expansion) and otherwise stay out of the reading experience (`../../artifacts/screenshots/monome-org/docs/docs__index__desktop.png`).

## 13. Evidence caveats

- Some screenshot filenames appear mismatched to the page content shown (for example, `../../artifacts/screenshots/monome-org/docs/docs__grid__disassembly__desktop.png` displays a "Teletype" page). This document cites screenshots as stored in the repo rather than re-mapping or renaming.
