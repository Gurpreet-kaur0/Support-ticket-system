import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, Comment } from '../types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Trash2, Edit3 } from 'lucide-react';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', priority: '', status: '' });

  const fetchTicket = async () => {
    try {
      const { data } = await api.get(`/tickets/${id}`);
      setTicket(data.ticket);
      setComments(data.comments);
      setEditForm({
        title: data.ticket.title,
        description: data.ticket.description,
        category: data.ticket.category,
        priority: data.ticket.priority,
        status: data.ticket.status,
      });
    } catch {
      toast.error('Failed to load ticket');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post(`/comments/${id}`, { content: newComment });
      setComments([...comments, data.comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/tickets/${id}`, editForm);
      setTicket(data.ticket);
      setEditing(false);
      toast.success('Ticket updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this ticket? This cannot be undone.')) return;
    try {
      await api.delete(`/tickets/${id}`);
      toast.success('Ticket deleted');
      navigate(-1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading...</div>;
  if (!ticket) return null;

  const isOwner = ticket.createdBy._id === user?.id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isOwner || isAdmin;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" />
            <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
            <div className="grid grid-cols-3 gap-4">
              <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="general">General</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="account">Account</option>
                <option value="billing">Billing</option>
              </select>
              <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {isAdmin && (
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <span className="text-xs text-gray-400 capitalize">{ticket.category}</span>
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(true)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-gray-700 mt-4 whitespace-pre-wrap">{ticket.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span>By <strong>{ticket.createdBy.name}</strong></span>
              <span>{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Comments ({comments.length})</h2>
        </div>

        {comments.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No comments yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <div key={comment._id} className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                  {comment.author.role === 'admin' && (
                    <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">Admin</span>
                  )}
                  <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        {canEdit && (
          <form onSubmit={handleComment} className="p-4 border-t border-gray-200">
            <div className="flex gap-3">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              <button type="submit" disabled={!newComment.trim()}
                className="flex items-center gap-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
