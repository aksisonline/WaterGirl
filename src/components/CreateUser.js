// SignUp.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

const [darkMode, setDarkMode] = useState(false);

return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="absolute top-4 right-4">
            <label className="inline-flex items-center cursor-pointer mb-4">
              <input   
                    type="checkbox" 
                    value="" 
                    className="sr-only peer" 
                    checked={darkMode} 
                    onChange={() => setDarkMode(!darkMode)}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Dark Mode</span>
            </label>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">Sign-up successful! Check your email to confirm.</p>}
        <form onSubmit={handleSignUp} className={`bg-gray-400 dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-sm`}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded w-full bg-white dark:bg-gray-700"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded w-full bg-white dark:bg-gray-700"
            />
            <button type="submit" className="bg-black text-white py-2 px-4 rounded hover:bg-blue-600 w-full">
                Sign Up
            </button>
        </form>
    </div>
);
};

export default SignUp;
