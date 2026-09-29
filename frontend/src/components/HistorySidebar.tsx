'use client';

import React from 'react';
import { Plus, MessageSquare, Trash2, Clock, BookOpen, Sun, Moon } from 'lucide-react';
import { ChatSession } from '@/lib/api';
import { QuickActions } from './QuickActions';

interface HistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  onSelectQuickAction: (promptText: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isHealthy?: boolean;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onSelectQuickAction,
  theme = 'dark',
  onToggleTheme,
  isHealthy = true,
}) => {
  const isLight = theme === 'light';

  return (
    <aside
      className={`w-72 shrink-0 flex flex-col justify-between border-r p-5 h-screen sticky top-0 overflow-y-auto transition-colors duration-200 ${
        isLight
          ? 'border-slate-200 bg-slate-50 text-slate-900'
          : 'border-[#181d2e] bg-[#090b12] text-white'
      }`}
    >
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        {/* App Branding */}
        <div className={`flex items-center justify-between pb-3.5 border-b ${isLight ? 'border-slate-200' : 'border-[#181d2e]'}`}>
          <div className="flex items-center gap-3">
            <div
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm ${
                isLight
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                  : 'border-[#2c375c] bg-[#1a2138] text-indigo-400'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span
                className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ${
                  isHealthy
                    ? 'bg-emerald-500 ring-white dark:ring-[#090b12]'
                    : 'bg-rose-500 ring-white dark:ring-[#090b12]'
                }`}
                title={isHealthy ? 'Backend Connected' : 'Backend Disconnected'}
              />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight leading-none">
                StudyMate<span className="text-indigo-500 font-extrabold">AI</span>
              </h1>
              <p className={`text-xs font-semibold mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                AI Teaching Assistant
              </p>
            </div>
          </div>

          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                isLight
                  ? 'border-slate-300 bg-white text-amber-500 shadow-sm hover:bg-slate-100'
                  : 'border-[#263150] bg-[#161c2e] text-indigo-400 hover:bg-[#1f2740]'
              }`}
              title={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            >
              {isLight ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-indigo-400" />}
            </button>
          )}
        </div>

        {/* Primary New Chat Button */}
        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#4f6ef7] hover:bg-[#4360e6] px-4 py-3 text-sm font-extrabold text-white transition-all shadow-md w-full"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>

        {/* Chat History Header */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className={`flex items-center gap-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <Clock className="h-4 w-4 text-indigo-500" />
            <span className={`text-xs font-bold tracking-wider uppercase ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Recent Chats ({sessions.length})
            </span>
          </div>
        </div>

        {/* Chat Sessions Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-56 scrollbar-thin">
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2 font-medium">
              <MessageSquare className="h-6 w-6 text-slate-400" />
              <span>No saved chats</span>
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-sm transition-all ${
                    isActive
                      ? isLight
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-950 font-bold shadow-sm'
                        : 'border-[#29324e] bg-[#181f33] text-white font-bold shadow-sm'
                      : isLight
                      ? 'border-transparent text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 font-medium'
                      : 'border-transparent text-slate-300 hover:bg-[#121626] hover:text-white font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                    <MessageSquare
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'
                      }`}
                    />
                    <span className="truncate text-sm font-medium" title={session.title}>
                      {session.title || 'Untitled Chat'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-slate-400 group-hover:hidden font-medium">
                      {session.createdAt}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="hidden group-hover:flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-950/60"
                      title="Delete chat history"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions Block (Bottom Left of Page) */}
        <div className={`pt-3 border-t mt-auto ${isLight ? 'border-slate-200' : 'border-[#181d2e]'}`}>
          <QuickActions onSelectAction={onSelectQuickAction} theme={theme} />
        </div>
      </div>
    </aside>
  );
};
