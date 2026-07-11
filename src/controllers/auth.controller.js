const { registerUser } = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const result = await registerUser({
        name,
        email, 
        password
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register };