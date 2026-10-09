import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { seedInitialData } from './seed.js';

dotenv.config();

const app = express();

// Connect to Database
await connectDB();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'online',
    platform: 'DeadlineSOS Academic Emergency Platform',
    version: '1.0.0',
    db: dbStatus
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Auto-seed demo dataset on startup
try {
  await seedInitialData();
} catch (err) {
  console.warn('[Seed] Startup seed notice:', err.message);
}

const server = app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 DeadlineSOS Backend Server running on port ${PORT}`);
  console.log(`🎯 Priority Engine & Timetable Scheduler Active`);
  console.log(`=================================================\n`);
});

export default app;
