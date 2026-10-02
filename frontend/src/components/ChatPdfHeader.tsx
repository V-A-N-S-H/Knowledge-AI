'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  PanelLeft,
  Globe,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  FileText,
} from 'lucide-react';
import { User } from '@/lib/api';

interface ChatPdfHeaderProps {
  user: User | null;
  activeDocName?: string | null;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function ChatPdfHeader({
  user,
  activeDocName,
  onNewChat,
  onToggleSidebar,
  onOpenAuth,
  onLogout,
  theme,
  onToggleTheme,
}: ChatPdfHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isLight = theme === 'light';

  return (
    <header
      className={`h-14 border-b flex items-center justify-between px-4 sticky top-0 z-30 transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur'
          : 'bg-[#0b0e17]/95 border-slate-800 text-slate-100 backdrop-blur'
      }`}
    >
      {/* Left Section: Logo + Sidebar Toggle + New Chat Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-lg border transition-colors ${
            isLight
              ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
              : 'border-slate-800 hover:bg-slate-800 text-slate-300'
          }`}
          title="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        {/* ChatPDF Brand Logo */}
        <div
          onClick={onNewChat}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="bg-purple-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight font-sans">
            Chat<span className="text-purple-600">PDF</span>
          </span>
        </div>

        {/* + New Button */}
        <button
          onClick={onNewChat}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
            isLight
              ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
              : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200'
          }`}
        >
          <Plus className="h-3.5 w-3.5 text-purple-600" />
          <span>New</span>
        </button>
      </div>

      {/* Center Section: Active Document Title Badge */}
      {activeDocName && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold max-w-xs truncate">
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{activeDocName}</span>
        </div>
      )}

      {/* Right Section: Language Selector, Plus Upgrade, Theme Toggle & Auth Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Dual Segmented Theme Switcher */}
        <div
          className={`p-1 rounded-full border flex items-center gap-1 transition-colors ${
            isLight
              ? 'bg-slate-100/90 border-slate-200/90'
              : 'bg-[#0f172a] border-slate-800'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              if (!isLight) onToggleTheme();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? 'bg-white text-purple-700 shadow-sm font-bold border border-slate-200/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Switch to Light Theme"
          >
            <Sun className={`h-3.5 w-3.5 ${isLight ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (isLight) onToggleTheme();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              !isLight
                ? 'bg-slate-800 text-purple-300 shadow-sm font-bold border border-slate-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Switch to Dark Theme"
          >
            <Moon className={`h-3.5 w-3.5 ${!isLight ? 'text-purple-400' : 'text-slate-400'}`} />
            <span>Dark</span>
          </button>
        </div>

        {/* Language Selector */}
        <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer px-2 py-1">
          <Globe className="h-3.5 w-3.5" />
          <span>EN</span>
          <ChevronDown className="h-3 w-3" />
        </div>

        {/* Plus Badge */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-purple-300/40 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-wider">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>Plus</span>
        </div>

        {/* User Auth Controls */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/50 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-purple-400 transition-all"
            >
              <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                {user.name.charAt(0)}
              </div>
              <span className="max-w-[100px] truncate">{user.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* User Dropdown Menu */}
            {showProfileMenu && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#151928] border-slate-800 text-slate-100'
                }`}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="hidden sm:block text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-2 py-1"
            >
              Log in
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-1.5 text-xs shadow-md shadow-purple-600/30 transition-all active:scale-95"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
