const express = require('express');
const path = require('path');

const router = express.Router();
const PAGES_DIR = path.join(__dirname, '..', 'pages');

// Standalone HTML pages served as full documents from server/pages/.
// Use these when a demo needs something the React app's static hosting can't
// provide, like custom response headers. To add a page, put the HTML file in
// server/pages/ and register it here. It's served at /pages/<slug>.
// Shared CSS/JS lives in server/pages/assets/ and is served at /pages/assets/.
const PAGES = {
  // Deliberately broken COOP header for the FC OAuth rapid-disconnect demo.
  // COOP is ignored in iframes and only applies on a full document load.
  'fc-oauth-disconnect-coop': {
    file: 'fc-oauth-disconnect-coop.html',
    headers: { 'Cross-Origin-Opener-Policy': 'same-origin' },
  },
};

router.use('/assets', express.static(path.join(PAGES_DIR, 'assets')));

router.get('/:slug', (req, res, next) => {
  if (!Object.hasOwn(PAGES, req.params.slug)) return next();
  const page = PAGES[req.params.slug];

  res.set(page.headers || {});
  res.sendFile(page.file, { root: PAGES_DIR });
});

module.exports = router;
