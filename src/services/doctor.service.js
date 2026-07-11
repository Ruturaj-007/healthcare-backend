const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function createDoctorProfile(userId, { specialization, experienceYrs, consultFee }) {
  const existing = await prisma.doctorProfile.findUnique({ where: { userId } });
  if (existing) {
    throw new ApiError(409, 'Doctor profile already exists for this user');
  }

  return prisma.doctorProfile.create({
    data: { userId, specialization, experienceYrs, consultFee },
  });
}

async function addAvailability(userId, { startTime, endTime }) {
  const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(404, 'Doctor profile not found. Create a profile first.');
  }

  if (new Date(startTime) >= new Date(endTime)) {
    throw new ApiError(400, 'startTime must be before endTime');
  }

  return prisma.availability.create({
    data: { doctorId: profile.id, startTime, endTime },
  });
}

async function getDoctorAvailability(doctorProfileId) {
  return prisma.availability.findMany({
    where: { doctorId: doctorProfileId, isBooked: false, startTime: { gte: new Date() } },
    orderBy: { startTime: 'asc' },
  });
}

async function listDoctors({ specialization }) {
  return prisma.doctorProfile.findMany({
    where: specialization ? { specialization: { contains: specialization, mode: 'insensitive' } } : {},
    include: { user: { select: { name: true, email: true } } },
  });
}

module.exports = { createDoctorProfile, addAvailability, getDoctorAvailability, listDoctors };