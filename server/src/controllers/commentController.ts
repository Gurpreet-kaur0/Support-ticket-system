import { Response } from 'express';
import { validationResult } from 'express-validator';
import Comment from '../models/Comment';
import Ticket from '../models/Ticket';
import { AuthRequest } from '../middleware/auth';
import { appEvents } from '../events/eventEmitter';

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return;
  }

  const ticket = await Ticket.findById(req.params.ticketId);
  if (!ticket) {
    res.status(404).json({ message: 'Ticket not found' });
    return;
  }

  const isOwner = ticket.createdBy.toString() === req.user!._id.toString();
  if (!isOwner && req.user!.role !== 'admin') {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  const comment = await Comment.create({
    content: req.body.content,
    ticket: ticket._id,
    author: req.user!._id,
  });

  await comment.populate('author', 'name email role');

  appEvents.emit('comment:added', {
    description: `Comment added to ticket "${ticket.title}"`,
    ticketId: ticket._id,
    userId: req.user!._id,
  });

  res.status(201).json({ message: 'Comment added', comment });
};

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  const ticket = await Ticket.findById(req.params.ticketId);
  if (!ticket) {
    res.status(404).json({ message: 'Ticket not found' });
    return;
  }

  const isOwner = ticket.createdBy.toString() === req.user!._id.toString();
  if (!isOwner && req.user!.role !== 'admin') {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  const comments = await Comment.find({ ticket: ticket._id })
    .populate('author', 'name email role')
    .sort({ createdAt: 1 });

  res.json({ comments });
};
