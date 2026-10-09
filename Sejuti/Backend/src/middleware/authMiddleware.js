import jwt from 'jsonwebtoken';
import { Store } from '../services/store.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'deadlinesos_cyber_super_secret_jwt_key_2026');
      
      const user = await Store.findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[AuthMiddleware] Invalid Token:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token expired or invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no bearer token provided' });
  }
};
