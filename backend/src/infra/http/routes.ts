const express = require('express');
const router = express.Router();
const cors = require('cors');

const v1Router = require('./routes/v1');
const v2Router = require('./routes/v2');

router.use(cors({ origin: process.env.CORS_ORIGIN }));

router.use('/api/v1', v1Router);
router.use('/api/v2', v2Router);

export = router;
