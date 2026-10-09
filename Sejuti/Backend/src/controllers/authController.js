import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Store } from '../services/store.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'deadlinesos_cyber_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, dailyCapacityHours, peakHours } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, password)' });
    }

    const userExists = await Store.findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const user = await Store.createUser({
      name,
      email,
      password,
      dailyCapacityHours: Number(dailyCapacityHours) || 4,
      peakHours: peakHours || 'night'
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyCapacityHours: user.dailyCapacityHours,
        peakHours: user.peakHours
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await Store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or user does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyCapacityHours: user.dailyCapacityHours,
        peakHours: user.peakHours
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await Store.findUserById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        dailyCapacityHours: user.dailyCapacityHours,
        peakHours: user.peakHours
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user capacity and settings
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, dailyCapacityHours, peakHours } = req.body;
    const userId = req.user._id || req.user.id;

    const updates = {};
    if (name) updates.name = name;
    if (dailyCapacityHours !== undefined) updates.dailyCapacityHours = Number(dailyCapacityHours);
    if (peakHours) updates.peakHours = peakHours;

    const updated = await Store.updateUser(userId, updates);

    res.json({
      success: true,
      user: {
        id: updated._id || updated.id,
        name: updated.name,
        email: updated.email,
        dailyCapacityHours: updated.dailyCapacityHours,
        peakHours: updated.peakHours
      }
    });
  } catch (error) {
    next(error);
  }
};
