'use client';

import React from 'react';
import { FileText, Layers, HelpCircle, Sparkles } from 'lucide-react';

interface QuickActionsProps {
  onSelectAction: (promptText: string) => void;
  disabled?: boolean;
  theme?: 'dark' | 'light';
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectAction, disabled, theme = 'dark' }) => {
  const isLight = theme === 'light';

  const actions = [
    {
      title: 'Summarize this topic',
      prompt: 'Summarize the main topics and key insights from the uploaded documents.',
      icon: FileText,
    },
    {
      title: 'Create flashcards',
      prompt: 'Create flashcards with key concepts, definitions, and Q&As based on the material.',
      icon: Layers,
    },
    {
      title: 'Generate practice questions',
      prompt: 'Generate 5 practice exam questions with detailed answers based on the material.',
      icon: HelpCircle,
    },
    {
      title: 'Explain in simpler words',
      prompt: 'Explain the key ideas in simpler, easy-to-understand words with simple analogies.',
      icon: Sparkles,
    },
  ];

  return (
    <div
      className={`rounded-2xl border p-4 shadow-md backdrop-blur-md transition-colors duration-200 ${
        isLight
          ? 'border-slate-200 bg-white text-slate-800'
          : 'border-slate-800/90 bg-[#090a0f] text-white'
      }`}
    >
      <div className="flex items-center gap-2 mb-3.5 px-1">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
          Quick Actions
        </h3>
      </div>

      <div className="flex flex-col gap-2.5">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => onSelectAction(action.prompt)}
              className={`group flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold transition-all duration-200 hover:translate-x-0.5 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-sm ${
                isLight
                  ? 'border-slate-200 bg-slate-50 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-900'
                  : 'border-slate-800/80 bg-[#10131e] text-slate-100 hover:border-indigo-500/50 hover:bg-indigo-950/40 hover:text-indigo-200'
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  isLight
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                    : 'border-slate-800 bg-[#161a29] text-indigo-400 group-hover:border-indigo-500/40 group-hover:bg-indigo-900/50'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="truncate">{action.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
