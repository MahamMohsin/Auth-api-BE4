const express = require('express');
const router = express.Router();
const infoController = require('../controllers/info.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Public — no auth
router.get('/public/info', infoController.publicInfo);

// Protected — guarded by the same middleware, reused across both routes
router.get('/protected/profile', requireAuth, infoController.profile);
router.get('/protected/dashboard', requireAuth, infoController.dashboard);

module.exports = router;
