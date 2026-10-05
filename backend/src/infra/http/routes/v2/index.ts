const express = require('express');
const router = express.Router();

const v1Router = require('../v1');
const authenticateMiddleware = require('../../middlewares/authenticate.middleware');
const getPlayersV2Controller = require('../../../../controllers/players/get-players-v2.ctrl');

// v2: /get-players now returns a { data, meta } envelope instead of a bare array.
// Must be registered before the v1 fallback below — Express matches routes in
// registration order, so this override has to win before v1Router's own
// handler for the same path would otherwise respond first. That also puts it ahead of
// v1Router's authenticate middleware, so it has to apply that itself.
router.get('/get-players', authenticateMiddleware, getPlayersV2Controller);

// Inherit every other v1 route unchanged.
router.use(v1Router);

module.exports = router;

export {};
