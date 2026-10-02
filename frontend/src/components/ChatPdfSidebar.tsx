'use client';

import React from 'react';
import {
  FolderPlus,
  PenTool,
  ShieldCheck,
  Video,
  Search,
  Monitor,
  Smartphone,
  Trash2,
  FileText,
  User as UserIcon,
  Plus,
} from 'lucide-react';
import { UploadedDocument, User } from '@/lib/api';

interface ChatPdfSidebarProps {
  documents: UploadedDocument[];
  activeDocumentId: string | null;
  onSelectDocument: (doc: UploadedDocument) => void;
  onDeleteDocument: (docId: string, e: React.MouseEvent) => void;
  onNewChat: () => void;
  user: User | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isOpen: boolean;
  theme: 'dark' | 'light';
}

export function ChatPdfSidebar({
  documents,
  activeDocumentId,
  onSelectDocument,
  onDeleteDocument,
  onNewChat,
  user,
  onOpenAuth,
  isOpen,
  theme,
}: ChatPdfSidebarProps) {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <aside
      className={`w-64 h-[calc(100vh-3.5rem)] flex flex-col border-r shrink-0 select-none transition-all duration-200 ${
        isLight
          ? 'bg-[#f8f9fa] border-slate-200 text-slate-800'
          : 'bg-[#0d101a] border-slate-800 text-slate-200'
      }`}
    >
      <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
        {/* Chats Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Chats
            </span>
            <button
              onClick={onNewChat}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-purple-600"
              title="Upload / New Chat"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {documents.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 italic font-medium">
                No documents uploaded yet
              </div>
            ) : (
              documents.map((doc) => {
                const isActive = doc.document_id === activeDocumentId;
                return (
                  <div
                    key={doc.document_id}
                    onClick={() => onSelectDocument(doc)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                      isActive
                        ? isLight
                          ? 'bg-white text-purple-700 shadow-sm border border-purple-200 ring-1 ring-purple-100'
                          : 'bg-purple-950/70 text-purple-300 border border-purple-800/60'
                        : isLight
                        ? 'hover:bg-slate-200/70 text-slate-700'
                        : 'hover:bg-slate-800/70 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className={`h-4 w-4 shrink-0 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                      <span className="truncate">{doc.filename}</span>
                    </div>

                    <button
                      onClick={(e) => onDeleteDocument(doc.document_id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 rounded transition-opacity"
                      title="Delete Document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Folders Section */}
        <div>
          <div className="px-2 mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Folders
          </div>
          <button
            onClick={onNewChat}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-dashed ${
              isLight
                ? 'border-slate-300 hover:bg-slate-100 text-slate-600'
                : 'border-slate-800 hover:bg-slate-800/50 text-slate-400'
            }`}
          >
            <FolderPlus className="h-4 w-4 text-purple-600" />
            <span>+ New folder</span>
          </button>
        </div>

        {/* Tools Section */}
        <div>
          <div className="px-2 mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Tools
          </div>
          <div className="space-y-0.5 text-xs font-semibold">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 cursor-pointer text-slate-600 dark:text-slate-400">
              <PenTool className="h-4 w-4 text-purple-600" />
              <span>AI Writer</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 cursor-pointer text-slate-600 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>AI Detector</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 cursor-pointer text-slate-600 dark:text-slate-400">
              <Video className="h-4 w-4 text-rose-500" />
              <span>YouTube Chat</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 cursor-pointer text-slate-600 dark:text-slate-400">
              <Search className="h-4 w-4 text-amber-500" />
              <span>Research</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 cursor-pointer text-slate-600 dark:text-slate-400">
              <Monitor className="h-4 w-4 text-blue-500" />
              <span>Windows app</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 cursor-pointer text-slate-600 dark:text-slate-400">
              <Smartphone className="h-4 w-4 text-purple-500" />
              <span>Mobile app</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Auth Card Container */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {!user ? (
          <div
            className={`p-3.5 rounded-2xl border text-center space-y-2.5 ${
              isLight
                ? 'bg-purple-50/70 border-purple-100 shadow-sm'
                : 'bg-purple-950/40 border-purple-900/40'
            }`}
          >
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug">
              Sign up for free to save your chat history
            </p>
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 text-xs shadow-md shadow-purple-600/30 transition-all active:scale-95"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Sign up</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40">
            <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">
                {user.name}
              </p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
                Free Plan Account
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
