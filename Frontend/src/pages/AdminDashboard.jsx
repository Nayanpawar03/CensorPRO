import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import censorProLogo from '../assets/CensorProLogo.png'

const AdminDashboard = () => {
  const API_BASE_URL = useMemo(() => (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  ), []);

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState({}); // id -> { expert_response, decision }
  const [previewUrl, setPreviewUrl] = useState(null);
  const [viewed, setViewed] = useState({}); // id -> true if image viewed
  const [stats, setStats] = useState({ total: 0, pending: 0, under_review: 0, done: 0, approved: 0, rejected: 0 });

  const getToken = () => {
    try { return localStorage.getItem('token'); } catch { return null; }
  };

  const fetchQueue = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/content/admin/queue`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch queue');
      setQueue(Array.isArray(data) ? data : (data?.items || []));
    } catch (err) {
      setError(err.message || 'Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/content/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch {}
  };

  useEffect(() => {
    fetchQueue();
    fetchStats();
    const intervalId = setInterval(() => { fetchQueue(); fetchStats(); }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const updateResponse = (id, field, value) => {
    setResponses(prev => ({
      ...prev,
      [id]: {
        expert_response: prev[id]?.expert_response || '',
        decision: prev[id]?.decision || 'Approved',
        [field]: value
      }
    }));
  };

  const submitReview = async (itemId) => {
    const token = getToken();
    if (!token) { setError('Not authenticated'); return; }
    const body = responses[itemId] || {};
    if (!body.expert_response || !body.decision) {
      setError('Please enter expert response and decision.');
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/content/admin/review/${itemId}` , {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expert_response: body.expert_response, decision: body.decision })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to submit review');
      setMessage('Review sent successfully');
      setQueue(prev => prev.filter(i => (i.id || i._id) !== itemId));
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    }
  };

  const isImage = (item) => !!item?.image_path;
  const itemId = (item) => item.id || item._id;

  const Header = () => (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center rounded-b-xl">
      <div className="flex items-center gap-2">
        <img src={censorProLogo} alt="CensorPro Logo" className="w-10 h-10" />
        <span className="font-bold text-xl text-blue-600">CensorPro</span>
      </div>
      <nav className="hidden md:flex gap-6 text-blue-700 font-medium">
        <Link to="/" className="hover:underline">Home</Link>
        <a href="#" className="hover:underline">Features</a>
        <a href="#" className="hover:underline">Docs</a>
        <a href="#" className="hover:underline">Contact</a>
      </nav>
      <button
        onClick={async () => { try { localStorage.removeItem('token'); } catch {}; window.location.href = '/'; }}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Sign Out
      </button>
    </header>
  );

  const StatCard = ({ title, value, change, iconColor, statusColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex-1 min-w-[150px] md:min-w-[180px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-blue-600">{title}</h3>
      </div>
      <div>
        <div className="text-3xl font-bold text-blue-900 mb-1">{value}</div>
        <span className={`text-sm font-medium ${statusColor}`}>{change}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 text-blue-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Admin Dashboard</h1>
          <p className="text-blue-900 mt-1">Review user submissions and manage moderation decisions</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <StatCard title="Total" value={stats.total} change="All submissions" statusColor="text-blue-700" />
          <StatCard title="Pending" value={stats.pending} change="Awaiting review" statusColor="text-yellow-500" />
          <StatCard title="Under Review" value={stats.under_review} change="In progress" statusColor="text-orange-500" />
          <StatCard title="Approved" value={stats.approved} change="Accepted" statusColor="text-green-500" />
          <StatCard title="Rejected" value={stats.rejected} change="Declined" statusColor="text-red-500" />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Content Review Queue</h2>
          <button onClick={() => { fetchQueue(); fetchStats(); }} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Refresh</button>
        </div>

        {message && <div className="mb-4 text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-2">{message}</div>}
        {error && <div className="mb-4 text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2">{error}</div>}
        {loading && <div className="mb-4">Loading...</div>}

        {queue.length === 0 && !loading ? (
          <div className="text-blue-700">No pending items.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queue.map(item => (
              <div key={itemId(item)} className="bg-white border border-blue-100 rounded-xl p-4">
                <div className="text-sm text-blue-700 mb-2">{item.user_email || item.email}</div>
                <div className="mb-3">
                  {isImage(item) ? (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-md">
                      <div className="text-sm text-blue-900">Image content</div>
                      <button
                        onClick={() => { setPreviewUrl(`${API_BASE_URL}${item.image_path}`); setViewed(prev => ({ ...prev, [itemId(item)]: true })); }}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                      >
                        View
                      </button>
                    </div>
                  ) : (
                    <p className="text-blue-900 whitespace-pre-wrap break-words">{item.text_content}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Expert Response (safe/unsafe)"
                    value={responses[itemId(item)]?.expert_response || ''}
                    onChange={(e) => updateResponse(itemId(item), 'expert_response', e.target.value)}
                    disabled={isImage(item) && !viewed[itemId(item)]}
                    className="w-full p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  />
                  <select
                    value={responses[itemId(item)]?.decision || 'Approved'}
                    onChange={(e) => updateResponse(itemId(item), 'decision', e.target.value)}
                    disabled={isImage(item) && !viewed[itemId(item)]}
                    className="w-full p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button
                    onClick={() => submitReview(itemId(item))}
                    disabled={isImage(item) && !viewed[itemId(item)]}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-60"
                  >
                    Send Response
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl max-w-4xl w-[90%]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-blue-900 font-semibold">Preview</h3>
              <button onClick={() => setPreviewUrl(null)} className="text-blue-600 hover:underline">Close</button>
            </div>
            <img src={previewUrl} alt="preview" className="w-full max-h-[80vh] object-contain rounded-md" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


