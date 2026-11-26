import { EventEmitter } from 'events';
import ActivityLog from '../models/ActivityLog';
import { Types } from 'mongoose';

export const appEvents = new EventEmitter();

interface TicketEvent {
  event: string;
  description: string;
  ticketId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  metadata?: Record<string, unknown>;
}

appEvents.on('ticket:created', async (data: TicketEvent) => {
  await ActivityLog.create({
    event: 'TICKET_CREATED',
    description: data.description,
    ticket: data.ticketId,
    performedBy: data.userId,
    metadata: data.metadata,
  });
});

appEvents.on('ticket:updated', async (data: TicketEvent) => {
  await ActivityLog.create({
    event: 'TICKET_UPDATED',
    description: data.description,
    ticket: data.ticketId,
    performedBy: data.userId,
    metadata: data.metadata,
  });
});

appEvents.on('ticket:status_changed', async (data: TicketEvent) => {
  await ActivityLog.create({
    event: 'STATUS_CHANGED',
    description: data.description,
    ticket: data.ticketId,
    performedBy: data.userId,
    metadata: data.metadata,
  });
});

appEvents.on('ticket:resolved', async (data: TicketEvent) => {
  await ActivityLog.create({
    event: 'TICKET_RESOLVED',
    description: data.description,
    ticket: data.ticketId,
    performedBy: data.userId,
    metadata: data.metadata,
  });
});

appEvents.on('comment:added', async (data: TicketEvent) => {
  await ActivityLog.create({
    event: 'COMMENT_ADDED',
    description: data.description,
    ticket: data.ticketId,
    performedBy: data.userId,
    metadata: data.metadata,
  });
});

appEvents.on('ticket:deleted', async (data: TicketEvent) => {
  await ActivityLog.create({
    event: 'TICKET_DELETED',
    description: data.description,
    ticket: data.ticketId,
    performedBy: data.userId,
    metadata: data.metadata,
  });
});
