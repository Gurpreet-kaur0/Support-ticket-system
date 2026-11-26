import { Response } from 'express';
import { validationResult } from 'express-validator';
import Ticket from '../models/Ticket';
import Comment from '../models/Comment';
import { AuthRequest } from '../middleware/auth';
import { appEvents } from '../events/eventEmitter';

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return;
  }

  const { title, description, category, priority } = req.body;
  const ticket = await Ticket.create({
    title, description, category, priority,
    createdBy: req.user!._id,
  });

  appEvents.emit('ticket:created', {
    event: 'TICKET_CREATED',
    description: `Ticket "${title}" created`,
    ticketId: ticket._id,
    userId: req.user!._id,
    metadata: { category, priority },
  });

  res.status(201).json({ message: 'Ticket created', ticket });
};

export const getMyTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { createdBy: req.user!._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [tickets, total] = await Promise.all([
    Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Ticket.countDocuments(filter),
  ]);

  res.json({ tickets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

export const getAllTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const allowedSortFields = ['createdAt', 'updatedAt', 'priority', 'status', 'title'];
  const requestedSortField = req.query.sortBy as string;
  const sortField = allowedSortFields.includes(requestedSortField) ? requestedSortField : 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Ticket.countDocuments(filter),
  ]);

  res.json({ tickets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

export const getTicketById = async (req: AuthRequest, res: Response): Promise<void> => {
  const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'name email');
  if (!ticket) {
    res.status(404).json({ message: 'Ticket not found' });
    return;
  }

  if (req.user!.role !== 'admin' && ticket.createdBy._id.toString() !== req.user!._id.toString()) {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  const comments = await Comment.find({ ticket: ticket._id })
    .populate('author', 'name email role')
    .sort({ createdAt: 1 });

  res.json({ ticket, comments });
};

export const updateTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return;
  }

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404).json({ message: 'Ticket not found' });
    return;
  }

  const isOwner = ticket.createdBy.toString() === req.user!._id.toString();
  const isAdmin = req.user!.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  const { title, description, category, priority, status } = req.body;
  const oldStatus = ticket.status;

  if (isOwner && !isAdmin) {
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (category) ticket.category = category;
    if (priority) ticket.priority = priority;
  } else {
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (category) ticket.category = category;
    if (priority) ticket.priority = priority;
    if (status) ticket.status = status;
  }

  await ticket.save();

  if (status && status !== oldStatus) {
    const eventName = status === 'resolved' ? 'ticket:resolved' : 'ticket:status_changed';
    appEvents.emit(eventName, {
      description: `Status changed from "${oldStatus}" to "${status}"`,
      ticketId: ticket._id,
      userId: req.user!._id,
      metadata: { oldStatus, newStatus: status },
    });
  } else {
    appEvents.emit('ticket:updated', {
      description: `Ticket "${ticket.title}" updated`,
      ticketId: ticket._id,
      userId: req.user!._id,
    });
  }

  res.json({ message: 'Ticket updated', ticket });
};

export const deleteTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404).json({ message: 'Ticket not found' });
    return;
  }

  const isOwner = ticket.createdBy.toString() === req.user!._id.toString();
  if (!isOwner && req.user!.role !== 'admin') {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  appEvents.emit('ticket:deleted', {
    description: `Ticket "${ticket.title}" deleted`,
    ticketId: ticket._id,
    userId: req.user!._id,
  });

  await Comment.deleteMany({ ticket: ticket._id });
  await ticket.deleteOne();

  res.json({ message: 'Ticket deleted' });
};

export const getTicketStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [statusStats, priorityStats, categoryStats, total] = await Promise.all([
    Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Ticket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Ticket.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Ticket.countDocuments(),
  ]);

  const toMap = (arr: { _id: string; count: number }[]) =>
    Object.fromEntries(arr.map(({ _id, count }) => [_id, count]));

  res.json({
    total,
    byStatus: toMap(statusStats),
    byPriority: toMap(priorityStats),
    byCategory: toMap(categoryStats),
  });
};
