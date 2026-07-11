const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const errorMiddleware = require('./middlewares/error.middleware');
const authRoutes = require('./routes/auth.routes');
const doctorRoutes = require('./routes/doctor.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);

app.use(errorMiddleware); // ALWAYS LAST — every future route goes ABOVE this line

module.exports = app;