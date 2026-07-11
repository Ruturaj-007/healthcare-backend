const { registerUser , loginUser} = require('../services/auth.service');

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

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
