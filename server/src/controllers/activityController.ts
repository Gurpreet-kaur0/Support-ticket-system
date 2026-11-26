import { Response } from 'express';
import ActivityLog from '../models/ActivityLog';
import { AuthRequest } from '../middleware/auth';

export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.ticketId) filter.ticket = req.query.ticketId;
  if (req.query.event) filter.event = req.query.event;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('performedBy', 'name email')
      .populate('ticket', 'title'),
    ActivityLog.countDocuments(filter),
  ]);

  res.json({ logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};
