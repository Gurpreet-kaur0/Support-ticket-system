import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TicketIcon, LogOut, LayoutDashboard, Plus, List } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
              <TicketIcon className="w-6 h-6" />
              HelpDesk
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin/dashboard" className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/admin/tickets" className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                    <List className="w-4 h-4" /> All Tickets
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/tickets" className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                    <List className="w-4 h-4" /> My Tickets
                  </Link>
                  <Link to="/tickets/new" className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                    <Plus className="w-4 h-4" /> New Ticket
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-500">Signed in as </span>
              <span className="font-medium text-gray-900">{user.name}</span>
              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                {user.role}
              </span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
