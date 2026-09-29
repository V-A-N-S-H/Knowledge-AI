'use client';

import React from 'react';
import { FileText, Bookmark } from 'lucide-react';
import { SourceCitation } from '@/lib/api';

interface SourceCitationBadgeProps {
  source: SourceCitation;
  theme?: 'dark' | 'light';
}

export const SourceCitationBadge: React.FC<SourceCitationBadgeProps> = ({ source, theme = 'dark' }) => {
  const isLight = theme === 'light';
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
        isLight
          ? 'border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100/70 shadow-sm'
          : 'border-indigo-500/20 bg-indigo-950/40 text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-900/40'
      }`}
    >
      <FileText className={`h-3.5 w-3.5 shrink-0 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
      <span
        className={`font-semibold truncate max-w-[160px] ${isLight ? 'text-slate-900' : 'text-slate-200'}`}
        title={source.filename}
      >
        {source.filename}
      </span>
      <span
        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-bold ${
          isLight
            ? 'bg-indigo-100 text-indigo-800'
            : 'bg-indigo-900/60 text-indigo-200'
        }`}
      >
        <Bookmark className={`h-3 w-3 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
        Page {source.page}
      </span>
    </div>
  );
};
