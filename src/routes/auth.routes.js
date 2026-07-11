const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');

const router = express.Router();
const protect = require('../middlewares/auth.middleware');
router.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }));
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

module.exports = router;