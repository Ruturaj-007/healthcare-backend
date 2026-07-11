const { z } = require('zod');

const createProfileSchema = z.object({
  specialization: z.string().trim().min(2),
  experienceYrs: z.number().int().nonnegative(),
  consultFee: z.number().positive(),
});

const addAvailabilitySchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

module.exports = { createProfileSchema, addAvailabilitySchema };