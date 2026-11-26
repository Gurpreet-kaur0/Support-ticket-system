import { Router } from 'express';
import { body } from 'express-validator';
import { addComment, getComments } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/:ticketId', [
  body('content').trim().notEmpty().withMessage('Comment content is required').isLength({ max: 2000 }),
], addComment);

router.get('/:ticketId', getComments);

export default router;
