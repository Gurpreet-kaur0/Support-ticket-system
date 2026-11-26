import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { TicketStats, ActivityLog } from '../types';
import { BarChart3, AlertCircle, CheckCircle, Clock, Ticket } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/tickets/stats'),
          api.get('/activity', { params: { limit: 10 } }),
        ]);
        setStats(statsRes.data);
        setRecentActivity(activityRes.data.logs);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading dashboard...</div>;
  if (!stats) return null;

  const statCards = [
    { label: 'Total Tickets', value: stats.total, icon: Ticket, color: 'bg-blue-500' },
    { label: 'Open', value: stats.byStatus.open || 0, icon: AlertCircle, color: 'bg-yellow-500' },
    { label: 'In Progress', value: stats.byStatus.in_progress || 0, icon: Clock, color: 'bg-orange-500' },
    { label: 'Resolved', value: stats.byStatus.resolved || 0, icon: CheckCircle, color: 'bg-green-500' },
  ];

  const eventIcons: Record<string, string> = {
    TICKET_CREATED: '🎫',
    TICKET_UPDATED: '✏️',
    STATUS_CHANGED: '🔄',
    TICKET_RESOLVED: '✅',
    COMMENT_ADDED: '💬',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of support ticket activity</p>
        </div>
        <Link to="/admin/tickets" className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
          View All Tickets
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-xl`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">By Priority</h2>
          </div>
          <div className="p-5 space-y-3">
            {['urgent', 'high', 'medium', 'low'].map((p) => {
              const count = stats.byPriority[p] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const colors: Record<string, string> = { urgent: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-blue-500', low: 'bg-gray-400' };
              return (
                <div key={p}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium text-gray-700">{p}</span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${colors[p]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No recent activity</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {recentActivity.map((log) => (
                <div key={log._id} className="p-4 flex items-start gap-3">
                  <span className="text-lg">{eventIcons[log.event] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{log.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{log.performedBy.name}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
