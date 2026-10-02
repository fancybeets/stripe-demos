// Loaded automatically by the react-scripts dev server (runs before the SPA fallback).
// Production hosting sets the same header via client/public/_headers.
module.exports = function (app) {
  // Deliberately broken COOP header for the FC OAuth rapid-disconnect demo
  app.use('/misc/fc-oauth-disconnect/coop', (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
  });
};
