import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatedHeroBackground } from '../components/ui/AnimatedHeroBackground';
import { Box, Lock, Mail, User } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (isRegister) {
        await axios.post('http://localhost:5000/api/auth/register', { 
            name, email, password, role: 'customer' 
        });
        
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('token', loginRes.data.token);
        localStorage.setItem('user', JSON.stringify(loginRes.data.user));
        
        navigate('/');
        window.location.reload();
      } else {
        const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        const role = response.data.user.role;
        if (role === 'admin') navigate('/admin-dashboard');
        else if (role === 'shop_owner') navigate('/shop-dashboard');
        else navigate('/');
        
        window.location.reload(); 
      }
    } catch (err) {
      setError(err.response?.data?.message || (isRegister ? 'Registration failed' : 'Login failed'));
    } finally {
        setLoading(false);
    }
  };

  return (
    <AnimatedHeroBackground>
      {/* Title block matching the structural request block */}
      <div className="flex flex-col items-center justify-center text-center px-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-6 ring-1 ring-black/5 overflow-hidden">
             <Box className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-2">
            ABC Mall Smart Management.
          </h1>
          <p className="text-lg font-medium text-gray-600 max-w-xl">
            Streamline your shopping or retail experience across thousands of brands worldwide.
          </p>
      </div>

      <div className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-sm border border-black/5 ring-1 ring-black/5 mx-4 transition-all z-20">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-4 text-center">{error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3 rounded-md text-sm mb-4 text-center">{success}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400 shadow-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isRegister}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="email" 
              placeholder="name@email.com"
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400 shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400 shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0112 20c-3.042 0-5.824-1.135-7.938-3l2.647-3z"></path>
               </svg>
            ) : isRegister ? 'Join Waitlist' : 'Enter Mall'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
            <button 
                type="button" 
                onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
            >
                {isRegister ? 'Already registered? Sign In' : "Don't have an account? Sign Up"}
            </button>
            
            <button 
                type="button" 
                onClick={() => navigate('/')}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-6 py-2 rounded-xl transition"
            >
                Browse Store as Guest
            </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-center text-gray-500">
          <p>Demo accounts:</p>
          <div className="mt-2 text-[11px] grid gap-1 uppercase tracking-wider font-semibold">
            <span className="text-gray-400">cust@mail.com / pass</span>
            <span className="text-gray-400">shop@mail.com / pass</span>
            <span className="text-gray-400">admin@mail.com / pass</span>
          </div>
        </div>
      </div>
    </AnimatedHeroBackground>
  );
};

export default Login;
