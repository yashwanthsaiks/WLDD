'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '../../types';
import { api } from '../../services/api';
import { RoleSelector } from '../../components/auth/RoleSelector';
import { ShieldCheck } from 'lucide-react';
import { AuthFormFields } from '../../components/auth/AuthFormField';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('creator');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [brandMotive, setBrandMotive] = useState('');
  const [marketValue, setMarketValue] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login Request
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('name', res.data.name);

        // Redirect based on role
        if (res.data.role === 'brand') {
          router.push('/brand');
        } else {
          router.push('/creator');
        }
      } else {
        // Signup Request
        const payload: any = { role, email, password, name };
        if (role === 'creator') payload.contactDetails = contactDetails;
        if (role === 'brand') {
          payload.brandMotive = brandMotive;
          payload.marketValue = marketValue;
        }

        await api.post('/auth/signup', payload);
        alert('Account created successfully! Please log in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-3 shadow-lg shadow-indigo-600/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Meme’d Campaign Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isLogin ? 'Sign in to access your dashboard' : 'Join the premier creator marketplace'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-4 text-xs font-medium animate-shake">
            {error}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <RoleSelector selectedRole={role} onSelectRole={setRole} />
          )}

          <AuthFormFields
            isLogin={isLogin}
            role={role}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            contactDetails={contactDetails}
            setContactDetails={setContactDetails}
            brandMotive={brandMotive}
            setBrandMotive={setBrandMotive}
            marketValue={marketValue}
            setMarketValue={setMarketValue}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 disabled:opacity-50 mt-4 text-sm"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle between Login and Signup */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </main>
  );
}