export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: 'bug' | 'feature' | 'general' | 'account' | 'billing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdBy: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  ticket: string;
  author: { _id: string; name: string; email: string; role: string };
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  event: string;
  description: string;
  ticket?: { _id: string; title: string };
  performedBy: { _id: string; name: string; email: string };
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TicketStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}
