import { Router } from 'express';
import { body } from 'express-validator';
import {
  createTicket, getMyTickets, getAllTickets,
  getTicketById, updateTicket, deleteTicket, getTicketStats,
} from '../controllers/ticketController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 5000 }),
  body('category').optional().isIn(['bug', 'feature', 'general', 'account', 'billing']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
], createTicket);

router.get('/my', getMyTickets);
router.get('/all', authorizeAdmin, getAllTickets);
router.get('/stats', authorizeAdmin, getTicketStats);
router.get('/:id', getTicketById);

router.put('/:id', [
  body('title').optional().trim().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('category').optional().isIn(['bug', 'feature', 'general', 'account', 'billing']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
], updateTicket);

router.delete('/:id', deleteTicket);

export default router;
