# Brian's portfolio design

Direction chosen for this redesign: an editorial personal portfolio connecting graphic design and practical IT work. The person's name and existing portrait establish identity; content comes from the existing portfolio.

- Latest direction requested by the user: use the attached palette, enlarge supporting information, reference the Canva Freelance Creative Portfolio Website, retain bold type and the original photographic colors.
- Latest palette sampled directly from the user's replacement image: #E3F2FD, #90CAF9, #2196F3, #0D47A1. Light blue forms the page background; medium blue anchors the introductory panel; bright blue emphasizes its heading; deep blue defines text, buttons, and work history. Photographic colors stay unchanged. Optional dark surfaces are deeper blue tones.
- Latest refinement explicitly requested by the user: modern blue gradients instead of rigid flat panels, and a white "Satu perspektif." phrase. The introduction uses a deep-to-medium blue gradient to preserve white-text contrast and emphasize the phrase. Work history uses a quieter matching gradient. The white contact button is the key action within the dark introduction. Supporting text remains pale blue and the larger readable sizes are retained.
- OLED refinement: page, navigation, footer, and form backgrounds use pure #000000 in dark mode, with white primary text and light-blue accents. Hero and work history have explicit black-to-blue gradients in dark mode. Light-mode work history now uses a horizontal deep-to-medium-blue gradient, so the change in color is visible within each job row rather than spread across the full height of the section. Portrait colors and readable type sizes are preserved.
- Latest work-history override: use exactly the two blues from the new image, #90CAF9 to #2196F3, in both themes. Text in this section uses #071A35 to remain readable across the lighter gradient. OLED page backgrounds and the hero treatment stay as previously requested.
- Superseding work-history direction: the user prefers the blue hero shown in their latest screenshot. Work history now uses the same 125-degree gradient and stops as the light hero (#092E70, #0D47A1 at 48%, #1B65B7), in both themes, with white headings and pale-blue supporting text. The dark page retains its pure-black background.
- Reference reviewed visually: https://www.canva.com/templates/EAGjWdrXU5Q-freelance-creative-portfolio-website/. Borrowed the wide rounded introductory panel, prominent portrait, dominant typography, and generous compositions. Retained the user's requested bold font rather than copying the reference's serif headings or orange colors.
- Locally hosted Bricolage Grotesque at weight 800 gives headings distinctive shapes and a strong silhouette. Locally hosted DM Sans supports long Indonesian descriptions. Fonts load directly from the site's assets rather than a third-party stylesheet.
- ENERGY 3 / RHYTHM 3 / MOTION 1: prominent typography and a cropped portrait; distinct profile, chronological work, skills, and contact compositions; motion limited to interaction feedback.
- The original color portrait sits in a large rounded white frame within the blue introduction panel. No grayscale, tint, blend mode, or color-altering filter.
- Latest readability revision: primary paragraphs 22px on desktop and 20px on mobile; job descriptions 20px; supporting labels, dates, captions, navigation, and footer information 18px. Job descriptions and supplementary competencies now use single-column lists, so larger text is not crowded into narrow columns. The menu collapses below 1101px to accommodate larger navigation text.
- Horizontal rules separate content rather than elevate everything into cards. Dates belong in a dedicated chronological column on desktop, above each job on mobile.
- Real content and existing destinations remain intact. No invented projects, testimonials, statistics, or illustrations were added.
- Native cursor and immediately readable text replace continuous decorative motion. Forms retain their existing behavior; menus support keyboard dismissal and communicate their expanded state.

## Verification

- Latest browser checks at 320, 375, 390, 640, 768, 900, 1024, and 1440px: no horizontal overflow; profile paragraphs measure 20px on mobile and 22px on desktop, job descriptions 20px, and metadata 18px. The portrait has no filter. Internal destinations and font loading were verified during prior revisions.
- Light/dark toggle, persistence after reload, mobile navigation, navigation dismissal, and Escape dismissal work. JavaScript syntax check passes; no page errors occurred during browser checks.
- The supplied palette uses deep-blue text on lighter blue backgrounds and pale-blue text on deep-blue work-history sections. Key text/background pairings are checked against the 4.5:1 AA threshold.
- Delivery review: purpose-specific composition, existing photograph and personal information, working destinations, visible keyboard focus, native pointer, and reduced-motion support. Contact opens the visitor's email application; email delivery itself was not tested.

## Theme transition

- Theme changes reveal the new page from the center of the mode button over 900ms, using a radial mask with a feathered edge in both directions. The opaque center covers the viewport before the snapshot is removed.
- Reduced-motion preferences bypass the effect. Browsers without View Transitions fade surface and text colors over 600ms. Repeated clicks during the animation are ignored; snapshot failures still apply the selected theme and release the transition state.
- Verified desktop and 375px mobile transitions in both directions, cleanup after completion, and persistence after reload. Targeted mocked checks cover reduced motion, fallback, repeated clicks, and snapshot failure. Tracking function and its initialization remain unchanged.

## Code cleanup

- Removed six uncalled legacy animation functions and the unused navbar scroll class. Preserved the tracking function's content exactly, apart from file line-ending normalization, and retained its startup call.
- Consolidated repeated CSS selectors, typography overrides, and the duplicate 1100px breakpoint. Removed unused X-image and error-state styles, unused color tokens, redundant dark work-history overrides, and the old stylesheet that the page no longer loaded.
- Compared 31 computed style properties across all content elements at five widths in both themes: zero differences before and after cleanup.
- Verified tracking with mocked IP success/failure, location success/denial, unavailable geolocation, and initialization after window load. No test tracking data was sent externally. Form email preparation, navigation state, mobile menu dismissal, back-to-top, and theme persistence passed. JavaScript syntax check passed.
