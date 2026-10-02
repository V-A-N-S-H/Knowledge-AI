'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { loginApi, signupApi, User } from '@/lib/api';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: User) => void;
  theme?: 'dark' | 'light';
}

export function AuthModal({
  isOpen,
  initialMode = 'signup',
  onClose,
  onSuccess,
  theme = 'light',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please fill in all required fields');
        }
        const user = await signupApi(name, email, password);
        onSuccess(user);
        onClose();
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter your email and password');
        }
        const user = await loginApi(email, password);
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const demoEmail = 'student@example.com';
      const demoPass = 'demo123';
      const user = await loginApi(demoEmail, demoPass);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#121624] border-slate-800 text-slate-100'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 rounded-full p-2 transition-colors ${
            isLight
              ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 text-white p-2 rounded-xl shadow-md shadow-purple-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tight">ChatPDF</span>
          </div>
          <h3 className="text-xl font-bold">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h3>
          <p className="text-xs text-slate-500">
            {mode === 'signup'
              ? 'Save your document chat history and access it from any device'
              : 'Log in to access your saved files and chat history'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          className={`flex rounded-xl p-1 mb-6 border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-purple-600 text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Log In
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 p-3 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-500">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900'
                      : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-500">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-500">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account' : 'Log In'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className={`h-px flex-1 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            or try instantly
          </span>
          <div className={`h-px flex-1 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all ${
            isLight
              ? 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
              : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Instant Demo Account Login</span>
        </button>
      </div>
    </div>
  );
}
