'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Sun,
  Moon,
  Crown,
  ChevronDown,
  ArrowLeft,
  FileText,
  LogOut,
} from 'lucide-react';
import { User } from '@/lib/api';

interface StudyMateHeaderProps {
  user: User | null;
  activeDocName?: string | null;
  onBackToHome?: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function StudyMateHeader({
  user,
  activeDocName,
  onBackToHome,
  onOpenAuth,
  onLogout,
  theme = 'dark',
  onToggleTheme,
}: StudyMateHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isLight = theme === 'light';

  return (
    <header
      className={`h-16 border-b flex items-center justify-between px-6 sticky top-0 z-30 transition-colors ${
        isLight
          ? 'bg-white border-slate-200/80 text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)]'
          : 'bg-[#060911] border-[#1e293b] text-slate-100 shadow-[0_4px_16px_0_rgba(0,0,0,0.7)]'
      }`}
    >
      {/* Left: Document Back Selector */}
      <div className="flex items-center gap-3">
        {activeDocName && (
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className={`p-2 rounded-xl border transition-colors ${
                isLight
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                  : 'border-[#1e293b] bg-[#0f172a] hover:bg-slate-800 text-slate-300'
              }`}
              title="Back to Home"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Document Title Dropdown Pill */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-bold shadow-sm cursor-pointer transition-colors ${
                isLight
                  ? 'border-slate-200 bg-white text-slate-900 hover:border-blue-400'
                  : 'border-[#1e293b] bg-[#0f172a] text-slate-100 hover:border-[#38bdf8]'
              }`}
            >
              <FileText className="h-4 w-4 text-purple-400" />
              <span className="max-w-xs truncate">{activeDocName}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        )}
      </div>

      {/* Right Actions: Theme Toggle, User Avatar */}
      <div className="flex items-center gap-3">
        {/* Dual Segmented Theme Switcher */}
        <div
          className={`p-1 rounded-full border flex items-center gap-1 transition-colors ${
            isLight
              ? 'bg-slate-100/90 border-slate-200/90'
              : 'bg-[#0f172a] border-[#1e293b]'
          }`}
        >
          {/* Light Option Button */}
          <button
            type="button"
            onClick={() => {
              if (!isLight) onToggleTheme();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? 'bg-white text-[#173e76] shadow-sm font-bold border border-slate-200/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Switch to Light Theme"
          >
            <Sun className={`h-3.5 w-3.5 ${isLight ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>Light</span>
          </button>

          {/* Dark Option Button */}
          <button
            type="button"
            onClick={() => {
              if (isLight) onToggleTheme();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              !isLight
                ? 'bg-[#1e293b] text-[#5a8cd8] shadow-sm font-bold border border-[#334155]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Switch to Dark Theme"
          >
            <Moon className={`h-3.5 w-3.5 ${!isLight ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>Dark</span>
          </button>
        </div>

        {/* User Profile Circle */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="h-9 w-9 rounded-full bg-[#334155] text-white font-bold text-xs flex items-center justify-center shadow-md hover:ring-2 hover:ring-blue-500 transition-all uppercase"
            >
              {user.name.charAt(0)}
            </button>

            {showProfileMenu && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-2xl border shadow-xl p-2 z-50 animate-in fade-in ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f172a] border-[#1e293b] text-slate-100'
                }`}
              >
                <div className="px-3 py-2 border-b border-slate-700/50 mb-1">
                  <p className="text-xs font-bold truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth('signup')}
            className="h-9 w-9 rounded-full bg-[#334155] text-white font-bold text-xs flex items-center justify-center shadow-md hover:bg-slate-700 transition-all uppercase"
          >
            V
          </button>
        )}
      </div>
    </header>
  );
}
