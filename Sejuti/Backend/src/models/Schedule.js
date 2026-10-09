import mongoose from 'mongoose';

const scheduleBlockSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  startTime: {
    type: String, // HH:mm
    required: true
  },
  duration: {
    type: Number, // hours (e.g., 1.5)
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  title: {
    type: String,
    required: true
  },
  course: {
    type: String,
    default: 'GENERAL'
  },
  type: {
    type: String,
    enum: ['assignment', 'exam', 'project', 'quiz', 'buffer', 'review'],
    default: 'assignment'
  },
  isBuffer: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    blocks: [scheduleBlockSchema],
    deficitHours: {
      type: Number,
      default: 0
    },
    bottleneckDetected: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);

export default Schedule;
