import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  isDone: {
    type: Boolean,
    default: false
  }
});

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true
    },
    course: {
      type: String,
      required: [true, 'Please provide a course code or subject'],
      trim: true
    },
    type: {
      type: String,
      enum: ['assignment', 'exam', 'project', 'quiz'],
      default: 'assignment'
    },
    deadline: {
      type: Date,
      required: [true, 'Please set a deadline date/time']
    },
    estimatedHours: {
      type: Number,
      required: [true, 'Please provide estimated hours'],
      min: 0.5,
      default: 3
    },
    hoursCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    weightage: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 5
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 3
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    subtasks: [subtaskSchema],
    priorityScore: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;
