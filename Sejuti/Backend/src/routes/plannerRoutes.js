import express from 'express';
import { getGeneratedSchedule, rebalanceTimetable } from '../controllers/plannerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/generate', getGeneratedSchedule);
router.post('/rebalance', rebalanceTimetable);

export default router;
