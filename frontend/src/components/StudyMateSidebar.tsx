'use client';

import React from 'react';
import {
  BookOpen,
  Plus,
  FileText,
  Trash2,
  MessageSquare,
  FileCheck,
  HelpCircle,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { UploadedDocument } from '@/lib/api';

interface StudyMateSidebarProps {
  documents: UploadedDocument[];
  activeDocumentId: string | null;
  onSelectDocument: (doc: UploadedDocument) => void;
  onDeleteDocument?: (docId: string, e: React.MouseEvent) => void;
  onNewChat: () => void;
  onQuickAction?: (prompt: string) => void;
  theme?: 'dark' | 'light';
}

export function StudyMateSidebar({
  documents,
  activeDocumentId,
  onSelectDocument,
  onDeleteDocument,
  onNewChat,
  onQuickAction,
  theme = 'dark',
}: StudyMateSidebarProps) {
  const isLight = theme === 'light';

  const quickOptions = [
    {
      label: 'Summarize',
      icon: FileCheck,
      prompt: 'Summarize this document into clear bullet points with key takeaways.',
    },
    {
      label: 'Flashcards',
      icon: BookOpen,
      prompt: 'Generate 5 study flashcards (Question & Answer format) from this document.',
    },
    {
      label: 'Quiz Generator',
      icon: HelpCircle,
      prompt: 'Create a 5-question practice quiz based on this document with an answer key.',
    },
    {
      label: 'Explain Concepts',
      icon: Sparkles,
      prompt: 'Explain the main concepts in this document in simple terms with examples.',
    },
    {
      label: 'Mind Map',
      icon: GitBranch,
      prompt: 'Create a structured bulleted mind map outline summarizing this document.',
    },
  ];

  return (
    <aside
      className={`w-60 h-screen flex flex-col shrink-0 select-none transition-colors ${
        isLight
          ? 'bg-[#fafaf9] text-slate-700'
          : 'bg-[#0b0f19] text-slate-200'
      }`}
    >
      {/* Top Branding Section (64px / h-16 with horizontal drop shadow below KnowledgeAI) */}
      <div
        className={`h-16 px-4 flex items-center border-b shrink-0 relative z-20 ${
          isLight
            ? 'border-slate-200/80 bg-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]'
            : 'border-[#1e293b] bg-[#060911] shadow-[0_4px_16px_0_rgba(0,0,0,0.7)]'
        }`}
      >
        <div onClick={onNewChat} className="flex items-center gap-3 cursor-pointer group">
          <div
            className={`h-11 w-11 rounded-2xl border flex items-center justify-center shadow-sm transition-all group-hover:scale-105 ${
              isLight
                ? 'bg-[#173e76]/10 border-[#173e76]/20 text-[#173e76]'
                : 'bg-[#173e76]/25 border-[#173e76]/40 text-[#5a8cd8]'
            }`}
          >
            {/* <BookOpen className="h-6 w-6 stroke-[2.3]" /> */}
          </div>
          <span
            className={`font-black text-xl tracking-tight font-sans ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Knowledge<span className="text-[#173e76] dark:text-[#5a8cd8]">AI</span>
          </span>
        </div>
      </div>

      {/* Sidebar Content Area (Vertical right border starts below top header line) */}
      <div
        className={`flex-1 overflow-y-auto p-3.5 space-y-4 border-r scrollbar-thin flex flex-col justify-between ${
          isLight ? 'border-slate-200/80 bg-[#fafaf9]' : 'border-[#1e293b] bg-[#0b0f19]'
        }`}
      >
        <div className="space-y-4">
          {/* + New Chat Blue Button */}
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#173e76] hover:bg-[#12315e] text-white font-bold text-xs shadow-md shadow-[#173e76]/30 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>New Chat</span>
          </button>

          {/* Recent Chats Section */}
          <div>
            <div className="px-3.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Recent Chats</span>
            </div>

            {documents.length > 0 ? (
              <div className="space-y-1 pt-1">
                  {documents.map((doc) => {
                    const isActive = doc.document_id === activeDocumentId;
                    return (
                      <div
                        key={doc.document_id}
                        onClick={() => onSelectDocument(doc)}
                        className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                          isActive
                            ? isLight
                              ? 'bg-[#173e76]/10 text-[#173e76] font-bold border border-[#173e76]/30 shadow-sm'
                              : 'bg-[#173e76]/30 text-[#60a5fa] border border-[#173e76]/60 font-bold'
                            : isLight
                            ? 'text-slate-700 hover:bg-slate-200/60'
                            : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? (isLight ? 'text-[#173e76]' : 'text-[#60a5fa]') : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{doc.filename}</span>
                        </div>

                        {onDeleteDocument && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDocument(doc.document_id, e);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete chat & document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="px-3.5 py-4 text-center text-xs text-slate-400 space-y-1">
                <MessageSquare className="h-5 w-5 mx-auto text-slate-500 opacity-60" />
                <p className="font-medium text-slate-400">No recent chats</p>
                <p className="text-[11px] text-slate-500">Upload a PDF to start</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Options (Bottom Left Section) */}
        <div className={`pt-3 border-t ${isLight ? 'border-slate-200/60' : 'border-[#1e293b]'}`}>
          <div className="px-3.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Options
          </div>
          <div className="space-y-1">
            {quickOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => onQuickAction?.(opt.prompt)}
                disabled={!activeDocumentId && documents.length === 0}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all group ${
                  !activeDocumentId && documents.length === 0
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-200/60 hover:text-blue-600'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-[#38bdf8]'
                }`}
                title={opt.prompt}
              >
                <opt.icon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#38bdf8] transition-colors" />
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
