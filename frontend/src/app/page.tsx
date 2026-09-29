'use client';

import React, { useState, useEffect } from 'react';
import { UploadBox } from '@/components/UploadBox';
import { UploadedFiles } from '@/components/UploadedFiles';
import { ChatWindow } from '@/components/ChatWindow';
import { HistorySidebar } from '@/components/HistorySidebar';
import { TypewriterText } from '@/components/TypewriterText';
import {
  UploadedDocument,
  ChatSession,
  ChatMessage,
  checkBackendHealth,
  fetchUploadedDocuments,
  deleteUploadedDocumentApi,
} from '@/lib/api';
import { Layers, FileCheck, ShieldCheck, Sun, Moon } from 'lucide-react';

const LOCAL_STORAGE_SESSIONS_KEY = 'knowledgeai_chat_sessions';
const LOCAL_STORAGE_DOCS_KEY = 'knowledgeai_uploaded_documents';
const LOCAL_STORAGE_THEME_KEY = 'knowledgeai_theme';

export default function Home() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Load saved theme, documents & chat sessions on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as 'dark' | 'light';
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } catch (e) {
      console.error('Failed to load theme from localStorage', e);
    }

    checkBackendHealth().then((healthy) => setIsHealthy(healthy));
    const interval = setInterval(() => {
      checkBackendHealth().then((healthy) => setIsHealthy(healthy));
    }, 15000);

    // Fetch documents from backend registry with localStorage fallback
    fetchUploadedDocuments().then((backendDocs) => {
      if (backendDocs && backendDocs.length > 0) {
        setDocuments(backendDocs);
        setSelectedDocIds(backendDocs.map((d) => d.document_id));
      } else {
        try {
          const savedDocs = localStorage.getItem(LOCAL_STORAGE_DOCS_KEY);
          if (savedDocs) {
            const parsedDocs: UploadedDocument[] = JSON.parse(savedDocs);
            setDocuments(parsedDocs);
            setSelectedDocIds(parsedDocs.map((d) => d.document_id));
          }
        } catch (e) {
          console.error('Failed to load documents from localStorage', e);
        }
      }
    });

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return () => clearInterval(interval);
        }
      }
    } catch (e) {
      console.error('Failed to load sessions from localStorage', e);
    }

    const initialSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      createdAt: 'Just now',
      messages: [],
    };
    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);

    return () => clearInterval(interval);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, nextTheme);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
  };

  // Sync sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
      } catch (e) {
        console.error('Failed to save sessions to localStorage', e);
      }
    }
  }, [sessions]);

  // Sync documents to localStorage
  useEffect(() => {
    if (documents.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(documents));
      } catch (e) {
        console.error('Failed to save documents to localStorage', e);
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_DOCS_KEY);
    }
  }, [documents]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);

    if (updated.length === 0) {
      const freshSession: ChatSession = {
        id: Date.now().toString(),
        title: 'New Conversation',
        createdAt: 'Just now',
        messages: [],
      };
      setSessions([freshSession]);
      setActiveSessionId(freshSession.id);
    } else if (activeSessionId === sessionId) {
      setActiveSessionId(updated[0].id);
    }
  };

  const handleMessagesChange = (newMessages: ChatMessage[]) => {
    if (!activeSessionId) return;

    let title = activeSession?.title || 'New Conversation';
    if (title === 'New Conversation' && newMessages.length > 0) {
      const firstUserMsg = newMessages.find((m) => m.sender === 'user');
      if (firstUserMsg) {
        title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
      }
    }

    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? { ...session, title, messages: newMessages }
          : session
      )
    );
  };

  const handleClearCurrentChat = () => {
    handleMessagesChange([]);
  };

  const handleDocumentUploaded = (doc: UploadedDocument) => {
    setDocuments((prev) => [...prev, doc]);
    setSelectedDocIds((prev) => [...prev, doc.document_id]);
  };

  const handleToggleDocSelection = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleRemoveDocument = async (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
    setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
    await deleteUploadedDocumentApi(docId);
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`flex h-screen w-full selection:bg-indigo-500 selection:text-white overflow-hidden transition-colors duration-200 ${
        isLight
          ? 'bg-slate-50 text-slate-900'
          : 'bg-[#08090d] text-slate-100 bg-grid-pattern'
      }`}
    >
      {/* Column 1: Dedicated Left Side Chat History & Quick Actions Column */}
      <HistorySidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onSelectQuickAction={(prompt) => setPendingPrompt(prompt)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isHealthy={isHealthy}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Hero Branding Bar */}
        <section className="px-6 pt-4 pb-2 w-full">
          <div className={`flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b pb-4 ${isLight ? 'border-slate-200' : 'border-[#181d2e]'}`}>
            {/* Left Column: Headlines */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Where Every Word{' '}
                <TypewriterText
                  words={[
                    'Speaks Accurately',
                    'Reveals Pure Truth',
                    'Unlocks Insights',
                    'Proves Its Sources',
                  ]}
                  className="text-indigo-500 font-extrabold"
                />
              </h2>
              <p className={`text-sm sm:text-base font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-indigo-300/90'}`}>
                <span>Answers You Can Trust.</span>{' '}
                <TypewriterText
                  words={[
                    'Sources You Can See.',
                    'Evidence You Can Verify.',
                    'Learning Made Effortless.',
                  ]}
                  typingSpeed={70}
                  deletingSpeed={35}
                  className="text-emerald-500 font-bold"
                />
              </p>
            </div>

            {/* Right Column: Feature Badges & Theme Controls Flexbox Row */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Feature Pill Badges */}
              <div
                className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-800'
                    : 'border-[#1d253b] bg-[#121624] text-slate-200'
                }`}
              >
                <Layers className="h-4 w-4 text-indigo-500 shrink-0" />
                <span className="whitespace-nowrap">Unlimited Pages</span>
              </div>
              <div
                className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-800'
                    : 'border-[#1d253b] bg-[#121624] text-slate-200'
                }`}
              >
                <FileCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="whitespace-nowrap">Unlimited Files</span>
              </div>
              <div
                className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-800'
                    : 'border-[#1d253b] bg-[#121624] text-slate-200'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-purple-500 shrink-0" />
                <span className="whitespace-nowrap">Provenanced Sources</span>
              </div>

              {/* Health Status Badge */}
              <div
                className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all ${
                  isLight
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-[#1d253b] bg-[#121624] text-slate-200'
                }`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  {isHealthy && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  )}
                  <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  {isHealthy ? 'Connected' : 'Offline'}
                </span>
              </div>

              {/* Premium Unique Segmented Dark/Light Theme Switcher Widget */}
              <div
                onClick={handleToggleTheme}
                className={`flex items-center cursor-pointer rounded-full border-2 p-1.5 shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${
                  isLight
                    ? 'border-indigo-200 bg-slate-100/90 text-slate-800 ring-2 ring-indigo-50 shadow-slate-200'
                    : 'border-indigo-500/40 bg-[#0e121e] text-white ring-2 ring-indigo-500/10 shadow-indigo-950/50'
                }`}
                title={`Switch to ${isLight ? 'Dark' : 'Light'} Theme`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (theme !== 'dark') handleToggleTheme();
                  }}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black tracking-wider uppercase transition-all duration-200 ${
                    !isLight
                      ? 'bg-[#4f6ef7] text-white shadow-md shadow-indigo-500/30 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-900 font-bold'
                  }`}
                >
                  <Moon className="h-4 w-4 text-white" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (theme !== 'light') handleToggleTheme();
                  }}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black tracking-wider uppercase transition-all duration-200 ${
                    isLight
                      ? 'bg-white text-indigo-700 shadow-md shadow-slate-300/60 border border-slate-200 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 font-bold'
                  }`}
                >
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span>Light</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Workspace Content */}
        <main className="flex flex-1 flex-col lg:flex-row gap-6 p-6 w-full overflow-hidden">
          {/* Interactive Chat Window */}
          <section className="flex-1 flex flex-col min-w-0">
            <ChatWindow
              messages={activeSession?.messages || []}
              selectedDocIds={selectedDocIds}
              onMessagesChange={handleMessagesChange}
              onClearCurrentChat={handleClearCurrentChat}
              pendingPrompt={pendingPrompt}
              onClearPendingPrompt={() => setPendingPrompt(null)}
              theme={theme}
            />
          </section>

          {/* Right Side Column: File Upload + Uploaded Files */}
          <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-10rem)] pr-0.5">
            <UploadBox onDocumentUploaded={handleDocumentUploaded} theme={theme} />
            <UploadedFiles
              documents={documents}
              selectedDocIds={selectedDocIds}
              onToggleDocSelection={handleToggleDocSelection}
              onRemoveDocument={handleRemoveDocument}
              theme={theme}
            />
          </aside>
        </main>
      </div>
    </div>
  );
}
