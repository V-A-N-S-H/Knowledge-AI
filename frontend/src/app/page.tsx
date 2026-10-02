'use client';

import React, { useState, useEffect } from 'react';
import { StudyMateHeader } from '@/components/StudyMateHeader';
import { StudyMateSidebar } from '@/components/StudyMateSidebar';
import { StudyMateLandingView } from '@/components/StudyMateLandingView';
import { StudyMateDocumentWorkspace } from '@/components/StudyMateDocumentWorkspace';
import { AuthModal } from '@/components/AuthModal';
import {
  UploadedDocument,
  ChatSession,
  ChatMessage,
  User,
  fetchUploadedDocuments,
  deleteUploadedDocumentApi,
  fetchChatSessionsApi,
  saveChatSessionApi,
  getDocumentFileUrl,
} from '@/lib/api';

const LOCAL_STORAGE_USER_KEY = 'studymate_user_session';
const LOCAL_STORAGE_DOCS_KEY = 'studymate_uploaded_documents';
const LOCAL_STORAGE_SESSIONS_KEY = 'studymate_chat_sessions';
const LOCAL_STORAGE_THEME_KEY = 'studymate_theme';
const LOCAL_STORAGE_ACTIVE_DOC_KEY = 'studymate_active_doc_id';

export default function Home() {
  // Theme & Layout State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'signup',
  });

  // Documents & Active Workspace State
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [activeDocument, setActiveDocument] = useState<UploadedDocument | null>(null);
  const [isGeneralChatOpen, setIsGeneralChatOpen] = useState(false);
  const [sessions, setSessions] = useState<{ [docId: string]: ChatSession }>({});
  const [pendingQuickPrompt, setPendingQuickPrompt] = useState<string | null>(null);

  // Initial Mount
  useEffect(() => {
    // Theme
    try {
      const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as 'light' | 'dark';
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      } else {
        setTheme('dark');
      }
    } catch (e) {
      console.error('Failed to load theme', e);
    }

    // User Session
    try {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    }

    // Load Chat Sessions from localStorage first
    let localSessions: { [docId: string]: ChatSession } = {};
    try {
      const savedSessions = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
      if (savedSessions) {
        localSessions = JSON.parse(savedSessions);
        setSessions(localSessions);
      }
    } catch (e) {
      console.error('Failed to load local sessions', e);
    }

    // Fetch Chat Sessions from backend & merge
    fetchChatSessionsApi().then((backendSessions) => {
      if (Object.keys(backendSessions).length > 0) {
        const mergedSessions = { ...localSessions, ...backendSessions };
        setSessions(mergedSessions);
        try {
          localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(mergedSessions));
        } catch (e) {}
      }
    });

    // Fetch documents from backend & merge with localStorage
    fetchUploadedDocuments().then((backendDocs) => {
      let merged: UploadedDocument[] = backendDocs.map((d) => ({
        ...d,
        fileUrl: d.fileUrl || getDocumentFileUrl(d.document_id),
      }));

      try {
        const savedDocs = localStorage.getItem(LOCAL_STORAGE_DOCS_KEY);
        if (savedDocs) {
          const parsedLocal: UploadedDocument[] = JSON.parse(savedDocs);
          parsedLocal.forEach((localDoc) => {
            if (!merged.some((d) => d.document_id === localDoc.document_id)) {
              merged.push({
                ...localDoc,
                fileUrl: localDoc.fileUrl || getDocumentFileUrl(localDoc.document_id),
              });
            }
          });
        }
      } catch (e) {
        console.error('Failed to load local documents', e);
      }

      setDocuments(merged);

      // Restore active document after page refresh if available
      try {
        const savedActiveDocId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_DOC_KEY);
        if (savedActiveDocId) {
          const active = merged.find((d) => d.document_id === savedActiveDocId);
          if (active) {
            setActiveDocument(active);
          }
        }
      } catch (e) {}
    });
  }, []);

  // Sync documents to localStorage
  useEffect(() => {
    if (documents.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(documents));
      } catch (e) {
        console.error('Failed to save documents', e);
      }
    }
  }, [documents]);

  // Sync sessions to localStorage
  useEffect(() => {
    if (Object.keys(sessions).length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
      } catch (e) {
        console.error('Failed to save sessions', e);
      }
    }
  }, [sessions]);

  // Handlers
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, nextTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(loggedUser));
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const handleDocumentUploaded = (newDoc: UploadedDocument) => {
    const docWithUrl = {
      ...newDoc,
      fileUrl: newDoc.fileUrl || getDocumentFileUrl(newDoc.document_id),
    };
    setDocuments((prev) => [docWithUrl, ...prev.filter((d) => d.document_id !== newDoc.document_id)]);
    setActiveDocument(docWithUrl);
    setIsGeneralChatOpen(false);
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_DOC_KEY, docWithUrl.document_id);
    } catch (e) {}
  };

  const handleSelectDocument = (doc: UploadedDocument) => {
    const docWithUrl = {
      ...doc,
      fileUrl: doc.fileUrl || getDocumentFileUrl(doc.document_id),
    };
    setActiveDocument(docWithUrl);
    setIsGeneralChatOpen(false);
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_DOC_KEY, docWithUrl.document_id);
    } catch (e) {}
  };

  const handleDeleteDocument = async (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await deleteUploadedDocumentApi(docId);
    } catch (err) {
      console.error('Failed to delete document from backend', err);
    }

    setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
    setSessions((prev) => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });

    if (activeDocument?.document_id === docId) {
      setActiveDocument(null);
      setIsGeneralChatOpen(false);
      try {
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DOC_KEY);
      } catch (e) {}
    }
  };

  const handleNewChat = () => {
    setActiveDocument(null);
    setIsGeneralChatOpen(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DOC_KEY);
    } catch (e) {}
  };

  const handleStartGeneralChat = (initialPrompt: string) => {
    setPendingQuickPrompt(initialPrompt);
    if (!activeDocument) {
      setIsGeneralChatOpen(true);
    }
  };

  const handleQuickAction = (promptText: string) => {
    setPendingQuickPrompt(promptText);
    if (!activeDocument) {
      setIsGeneralChatOpen(true);
    }
  };

  const currentDocId = activeDocument?.document_id || 'global';
  const activeMessages = sessions[currentDocId]?.messages || [];

  const handleMessagesChange = (newMessages: ChatMessage[]) => {
    const updatedSession: ChatSession = {
      id: currentDocId,
      title: activeDocument?.filename || 'General AI Chat',
      createdAt: new Date().toLocaleTimeString(),
      messages: newMessages,
    };

    setSessions((prev) => ({
      ...prev,
      [currentDocId]: updatedSession,
    }));

    if (currentDocId !== 'global') {
      saveChatSessionApi(currentDocId, updatedSession);
    }
  };

  const handleClearCurrentChat = () => {
    handleMessagesChange([]);
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`h-screen w-screen flex overflow-hidden font-sans transition-colors duration-200 ${
        isLight ? 'bg-white text-slate-900' : 'bg-[#060911] text-slate-100'
      }`}
    >
      {/* 1. Dedicated Left Navigation Sidebar */}
      <StudyMateSidebar
        documents={documents}
        activeDocumentId={activeDocument?.document_id || null}
        onSelectDocument={handleSelectDocument}
        onDeleteDocument={handleDeleteDocument}
        onNewChat={handleNewChat}
        onQuickAction={handleQuickAction}
        theme={theme}
      />

      {/* 2. Main Right Area: Top Header + Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 scroll-smooth">
        {/* Top Header Bar (Right of Sidebar) */}
        <StudyMateHeader
          user={user}
          activeDocName={activeDocument?.filename || (isGeneralChatOpen ? 'General AI Chat' : null)}
          onBackToHome={handleNewChat}
          onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Workspace: Landing View OR Document Workspace */}
        <div className="flex-1 flex flex-col min-h-0">
          {!activeDocument && !isGeneralChatOpen ? (
            <StudyMateLandingView
              onDocumentUploaded={handleDocumentUploaded}
              onSelectDocument={handleSelectDocument}
              onDeleteDocument={handleDeleteDocument}
              onStartChat={handleStartGeneralChat}
              documents={documents}
              theme={theme}
            />
          ) : (
            <StudyMateDocumentWorkspace
              key={activeDocument?.document_id || 'global'}
              documentId={activeDocument?.document_id || 'global'}
              filename={activeDocument?.filename || 'General AI Assistant'}
              docFileUrl={activeDocument?.fileUrl}
              messages={activeMessages}
              onMessagesChange={handleMessagesChange}
              onClearChat={handleClearCurrentChat}
              onClose={handleNewChat}
              pendingQuickPrompt={pendingQuickPrompt}
              onClearQuickPrompt={() => setPendingQuickPrompt(null)}
              theme={theme}
            />
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onSuccess={handleAuthSuccess}
        theme={theme}
      />
    </div>
  );
}
