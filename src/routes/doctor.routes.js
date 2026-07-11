const express = require('express');
const controller = require('../controllers/doctor.controller');
const protect = require('../middlewares/auth.middleware');
const restrictTo = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { createProfileSchema, addAvailabilitySchema } = require('../validations/doctor.validation');

const router = express.Router();

router.get('/', controller.listDoctors);
router.get('/:doctorId/availability', controller.getAvailability);

router.post('/profile', protect, restrictTo('DOCTOR'), validate(createProfileSchema), controller.createProfile);
router.post('/availability', protect, restrictTo('DOCTOR'), validate(addAvailabilitySchema), controller.addAvailability);

module.exports = router;