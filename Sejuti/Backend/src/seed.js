import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { Store } from './services/store.js';
import { calculateTaskScore } from './services/priorityEngine.js';

dotenv.config();

export const seedInitialData = async () => {
  console.log('[Seed] Populating realistic academic deadline dataset...');

  const demoEmail = 'alex.dev@university.edu';
  let demoUser = await Store.findUserByEmail(demoEmail);

  if (!demoUser) {
    demoUser = await Store.createUser({
      name: 'Alex Vance',
      email: demoEmail,
      password: 'password123',
      dailyCapacityHours: 4,
      peakHours: 'night'
    });
    console.log(`[Seed] Created Demo User: ${demoEmail} / password123`);
  }

  const userId = demoUser._id || demoUser.id;

  // Clear existing tasks for demo user to ensure clean state
  await Store.clearUserTasks(userId);

  const now = new Date();
  const addHours = (hrs) => new Date(now.getTime() + hrs * 60 * 60 * 1000);

  const sampleTasks = [
    {
      title: 'Dynamic Programming & NP-Hard Reduction Assignment',
      course: 'CS301 - ALGORITHMS',
      type: 'assignment',
      deadline: addHours(14), // 14 hours away - High Emergency!
      estimatedHours: 6,
      hoursCompleted: 1.5,
      weightage: 9,
      difficulty: 5,
      status: 'in-progress',
      subtasks: [
        { title: 'Formulate memoized recursion relations', isDone: true },
        { title: 'Prove 3-SAT polynomial reduction', isDone: false },
        { title: 'Implement benchmark timer & test suite', isDone: false },
        { title: 'Generate LaTeX PDF report', isDone: false }
      ]
    },
    {
      title: 'Kernel Concurrency & Mutex Threading Lab',
      course: 'CS304 - OS KERNELS',
      type: 'assignment',
      deadline: addHours(28), // 28 hours away
      estimatedHours: 5,
      hoursCompleted: 0.5,
      weightage: 8,
      difficulty: 4,
      status: 'in-progress',
      subtasks: [
        { title: 'Resolve race conditions in spinlock queue', isDone: true },
        { title: 'Implement deadlock prevention banker algorithm', isDone: false },
        { title: 'Pass POSIX stress test scripts', isDone: false }
      ]
    },
    {
      title: 'Final Comprehensive Exam — Relational Algebra & Indexing',
      course: 'CS308 - DATABASES',
      type: 'exam',
      deadline: addHours(44), // 44 hours away - Critical Exam
      estimatedHours: 8,
      hoursCompleted: 2,
      weightage: 10,
      difficulty: 4,
      status: 'in-progress',
      subtasks: [
        { title: 'Review B+ Tree balancing & index scans', isDone: true },
        { title: 'Practice 2PL Concurrency control problems', isDone: true },
        { title: 'Solve 2024 Past Papers (Sections A & B)', isDone: false },
        { title: 'Write cheat sheet on ACID isolation levels', isDone: false }
      ]
    },
    {
      title: 'Raft Distributed Consensus Protocol Project',
      course: 'CS410 - DISTRIBUTED SYS',
      type: 'project',
      deadline: addHours(76), // 3 days away
      estimatedHours: 10,
      hoursCompleted: 2,
      weightage: 9,
      difficulty: 5,
      status: 'in-progress',
      subtasks: [
        { title: 'Leader Election heartbeat mechanism', isDone: true },
        { title: 'Log Replication & term synchronization', isDone: false },
        { title: 'Network partition failover simulation', isDone: false },
        { title: 'Deploy 5-node cluster benchmark', isDone: false }
      ]
    },
    {
      title: 'Zero-Knowledge Proofs & Elliptic Curve Cryptography Quiz',
      course: 'CS420 - CRYPTOGRAPHY',
      type: 'quiz',
      deadline: addHours(96), // 4 days away
      estimatedHours: 3,
      hoursCompleted: 0,
      weightage: 6,
      difficulty: 3,
      status: 'pending',
      subtasks: [
        { title: 'Read Chapter 7: Discrete Logarithm assumptions', isDone: false },
        { title: 'Complete practice quiz on Diffie-Hellman', isDone: false }
      ]
    },
    {
      title: 'TCP Reno vs BBR Congestion Control Simulation',
      course: 'CS302 - NETWORKS',
      type: 'assignment',
      deadline: addHours(120), // 5 days away
      estimatedHours: 4,
      hoursCompleted: 4,
      weightage: 7,
      difficulty: 3,
      status: 'completed',
      subtasks: [
        { title: 'Run ns-3 packet drop simulations', isDone: true },
        { title: 'Plot throughput vs packet loss curves', isDone: true },
        { title: 'Submit lab write-up', isDone: true }
      ]
    }
  ];

  for (const t of sampleTasks) {
    const scoreData = calculateTaskScore(t, demoUser.dailyCapacityHours || 4);
    await Store.createTask({
      ...t,
      userId,
      priorityScore: scoreData.priorityScore
    });
  }

  console.log(`[Seed] Successfully seeded ${sampleTasks.length} realistic tasks with urgent deadlines!`);
};

// If run directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  await connectDB();
  await seedInitialData();
  process.exit(0);
}
