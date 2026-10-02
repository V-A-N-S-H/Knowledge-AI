'use client';

import React from 'react';
import { BookOpen, FileText, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  isHealthy: boolean;
  documentCount: number;
  selectedCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isHealthy,
  documentCount,
  selectedCount,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between border-b px-6 py-4 backdrop-blur-xl transition-colors duration-200 ${
        isLight
          ? 'border-slate-200 bg-white/95 text-slate-900 shadow-xs'
          : 'border-[#181d2e] bg-[#08090d]/90 text-white'
      }`}
    >
      {/* Brand & Logo */}
      <div className="flex items-center gap-3.5">
        <div
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm p-1 transition-all ${
            isLight
              ? 'border-[#173e76]/30 bg-[#173e76]/10'
              : 'border-[#173e76]/40 bg-[#173e76]/25'
          }`}
        >
          <img
            src={isLight ? '/logo-k.png' : '/logo-k-dark.png'}
            alt="KnowledgeAI Logo"
            className="h-6 w-6 object-contain"
          />
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#08090d]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-lg font-extrabold tracking-tight leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Knowledge<span className="text-[#173e76] dark:text-[#5a8cd8] font-extrabold">AI</span>
            </h1>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider ${
                isLight
                  ? 'border-[#173e76]/30 bg-[#173e76]/10 text-[#173e76]'
                  : 'border-[#263150] bg-[#161c2e] text-indigo-300'
              }`}
            >
              PRO RAG 3.5
            </span>
          </div>
          <p className={`text-xs font-semibold mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Answers You Can Trust. Sources You Can See.
          </p>
        </div>
      </div>

      {/* Stats, Health & Theme Toggle */}
      <div className="flex items-center gap-3.5">
        {/* Document Selection Stats Pill */}
        <div
          className={`hidden sm:flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold ${
            isLight
              ? 'border-slate-200 bg-slate-100/80 text-slate-700'
              : 'border-slate-800 bg-[#0d0f17] text-slate-300'
          }`}
        >
          <FileText className="h-4 w-4 text-[#173e76] dark:text-[#5a8cd8]" />
          <span>
            <strong className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>
              {selectedCount}
            </strong>{' '}
            / {documentCount} Files Active
          </span>
        </div>

        {/* Backend API Health Pill */}
        <div
          className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-bold ${
            isLight
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-800 bg-[#0d0f17]'
          }`}
        >
          <span className="relative flex h-3 w-3">
            {isHealthy && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${
                isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <span className={isHealthy ? (isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold') : 'text-rose-500 font-bold'}>
            {isHealthy ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
            isLight
              ? 'border-slate-300 bg-white text-amber-500 shadow-sm hover:bg-slate-100 hover:border-slate-400'
              : 'border-[#263150] bg-[#161c2e] text-indigo-400 hover:bg-[#1f2740]'
          }`}
          title={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
        >
          {isLight ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
};
