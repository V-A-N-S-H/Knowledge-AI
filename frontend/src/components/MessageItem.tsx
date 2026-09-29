'use client';

import React, { useState } from 'react';
import { User, Bot, AlertTriangle, CheckCircle2, Globe, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '@/lib/api';
import { SourceCitationBadge } from './SourceCitationBadge';

interface MessageItemProps {
  message: ChatMessage;
  theme?: 'dark' | 'light';
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const isUser = message.sender === 'user';
  const meta = message.responseMeta;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 text-sm ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
            isLight
              ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
              : 'border-[#263150] bg-[#181f33] text-indigo-400'
          }`}
        >
          <Bot className="h-5 w-5" />
        </div>
      )}

      <div
        className={`group relative flex max-w-[88%] flex-col gap-3.5 rounded-2xl p-5 shadow-md transition-all ${
          isUser
            ? 'bg-[#4f6ef7] text-white rounded-tr-xs'
            : isLight
            ? 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-xs'
            : 'bg-[#0e1019] border border-[#1a2034] text-slate-100 rounded-tl-xs'
        }`}
      >
        {/* Assistant Response Header (Mode Badges & Copy Button) */}
        {!isUser && (
          <div className={`flex items-center justify-between gap-3 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
            {meta && (
              <div className="flex flex-wrap items-center gap-2">
                {meta.mode === 'document' ? (
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold shadow-sm ${
                      isLight
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-emerald-500/40 bg-emerald-950/80 text-emerald-400'
                    }`}
                  >
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                    <span>Grounded Document Answer</span>
                  </div>
                ) : (
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold shadow-sm ${
                      isLight
                        ? 'border-amber-300 bg-amber-50 text-amber-800'
                        : 'border-amber-500/40 bg-amber-950/80 text-amber-400'
                    }`}
                  >
                    <Globe className={`h-3.5 w-3.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                    <span>Fallback General Knowledge</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ml-auto ${
                isLight
                  ? 'border-slate-300 bg-white text-slate-700 hover:text-indigo-600 hover:border-indigo-300'
                  : 'border-slate-800 bg-[#08090e] text-slate-400 hover:text-indigo-300'
              }`}
              title="Copy response text"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Fallback Notice Banner */}
        {!isUser && meta?.mode === 'fallback' && meta.notice && (
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs shadow-inner ${
              isLight
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-200/90'
            }`}
          >
            <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
            <span className="leading-normal">{meta.notice}</span>
          </div>
        )}

        {/* Message Content */}
        {isUser ? (
          <div className="whitespace-pre-wrap leading-relaxed font-medium text-white">
            {message.content}
          </div>
        ) : (
          <div className={`prose max-w-none text-sm leading-relaxed ${isLight ? 'prose-slate text-slate-800' : 'prose-invert text-slate-200'}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Source Citations Badges */}
        {!isUser && meta?.sources && meta.sources.length > 0 && (
          <div className={`flex flex-col gap-2 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Verified Evidence Sources ({meta.sources.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {meta.sources.map((src, idx) => (
                <SourceCitationBadge key={idx} source={src} theme={theme} />
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300 shadow-md">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};
