'use client';

import React from 'react';
import { GraduationCap, MessageSquare, Folder, Database, Clock, ChevronUp } from 'lucide-react';

interface SidebarNavProps {
  activeTab: 'chat' | 'files' | 'knowledge' | 'history';
  onTabChange: (tab: 'chat' | 'files' | 'knowledge' | 'history') => void;
  userName?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  userName = 'Vansh',
}) => {
  const navItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'files', label: 'My Files', icon: Folder },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    { id: 'history', label: 'History', icon: Clock },
  ] as const;

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-[#1a1d2d] bg-[#090b10] p-4 h-screen sticky top-0">
      <div className="flex flex-col gap-6">
        {/* Top Logo Branding */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
              StudyMate
            </h1>
            <p className="text-[11px] font-medium text-slate-400 mt-1">
              AI Teaching Assistant
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-[#131622] hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Tile (Bottom) */}
      <div className="flex items-center justify-between rounded-xl border border-[#1e2336] bg-[#0d0f17] p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-white uppercase">
            {userName.charAt(0)}
          </div>
          <span className="text-sm font-semibold text-slate-200">{userName}</span>
        </div>
        <ChevronUp className="h-4 w-4 text-slate-400" />
      </div>
    </aside>
  );
};
