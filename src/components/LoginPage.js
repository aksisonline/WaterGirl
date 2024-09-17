import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Query the custom table for login credentials
      const { data, error } = await supabase
        .from('admin_login')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        // Set authentication state
        localStorage.setItem('isAuthenticated', 'true');
        onLogin(); // Immediately update isAuthenticated state
        navigate('/admin'); // Navigate to admin panel
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="bg-white shadow rounded-lg p-6 w-full max-w-sm dark:bg-gray-800 dark:text-white flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Login</h1>
        <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
          <div className="mb-4 w-full">
            <label className="block text-gray-700 dark:text-gray-300">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 w-full border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div className="mb-4 w-full">
            <label className="block text-gray-700 dark:text-gray-300">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div> <br />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg dark:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
