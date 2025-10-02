import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = useMemo(() => (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  ), []);

  const saveTokenAndRedirect = (token) => {
    try {
      localStorage.setItem('token', token);
    } catch {}
    // Basic role check if token is JWT with payload containing role
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      const isAdmin = payload?.role === 'admin' || payload?.isAdmin === true;
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    } catch {
      navigate('/dashboard', { replace: true });
    }
  };

  // Parse token from URL hash after Google redirect (#?token=...)
  useEffect(() => {
    if (location.hash) {
      const hash = new URLSearchParams(location.hash.replace(/^#\??/, ''));
      const token = hash.get('token');
      if (token) {
        saveTokenAndRedirect(token);
      }
    }
  }, [location.hash]);

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Login failed');
      setMessage('Login successful');
      if (data.token) saveTokenAndRedirect(data.token);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex flex-col">
      {/* Navbar */}
 <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center rounded-b-lg">
  <div className="text-blue-600 font-bold text-xl">CensorPro</div>
  <ul className="flex gap-6 items-center text-sm text-blue-700 font-medium">
    <li>
      <Link to="/" className="hover:underline">
        Home
      </Link>
    </li>
    <li>
      <Link to="/contact" className="hover:underline">
        Contact
      </Link>
    </li>
    <li>
      {localStorage.getItem('token') ? (
        <button
          onClick={async () => {
            try { localStorage.removeItem('token'); } catch {}
            try {
              await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
            } catch {}
            navigate('/', { replace: true });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Sign Out
        </button>
      ) : (
        <Link
          to="/login"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Sign In
        </Link>
      )}
    </li>
  </ul>
</nav>


      {/* Login Form */}
      <div className="flex flex-1 justify-center items-center">
        <div className="bg-transparent w-full max-w-md text-center p-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Login</h1>
          <p className="text-sm text-blue-700 mb-6">
            Sign in to manage and moderate your content safely.
          </p>

          {message && (
            <div className="text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-2 mb-2">{message}</div>
          )}
          {error && (
            <div className="text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2 mb-2">{error}</div>
          )}
          <form className="flex flex-col gap-4" onSubmit={handleManualLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 border border-white-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 border border-white-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-blue-900 border border-blue-300 py-3 rounded-md hover:bg-blue-50 font-medium flex items-center justify-center gap-2"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>

          <p className="text-sm mt-4 text-blue-800">
            Don’t have an account?{' '}
            <Link to="/register" className="underline cursor-pointer text-blue-900 hover:text-blue-700">
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
