const doctorService = require('../services/doctor.service');

async function createProfile(req, res, next) {
  try {
    const profile = await doctorService.createDoctorProfile(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Doctor profile created', data: profile });
  } catch (error) {
    next(error);
  }
}

async function addAvailability(req, res, next) {
  try {
    const slot = await doctorService.addAvailability(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Availability added', data: slot });
  } catch (error) {
    next(error);
  }
}

async function getAvailability(req, res, next) {
  try {
    const slots = await doctorService.getDoctorAvailability(req.params.doctorId);
    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
}

async function listDoctors(req, res, next) {
  try {
    const doctors = await doctorService.listDoctors({ specialization: req.query.specialization });
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
}

module.exports = { createProfile, addAvailability, getAvailability, listDoctors };