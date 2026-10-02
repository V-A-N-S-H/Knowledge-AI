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

  // Dynamic user data keys
  const userId = user?.user_id || 'guest_user';
  const docsStorageKey = `studymate_docs_${userId}`;
  const sessionsStorageKey = `studymate_sessions_${userId}`;
  const activeDocStorageKey = `studymate_active_doc_${userId}`;

  // Load theme on initial mount
  useEffect(() => {
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

    try {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    }
  }, []);

  // Sync / Load user-scoped data when user account changes
  useEffect(() => {
    const activeUserId = user?.user_id || 'guest_user';

    // 1. Load Chat Sessions from localStorage first
    let localSessions: { [docId: string]: ChatSession } = {};
    try {
      const savedSessions = localStorage.getItem(`studymate_sessions_${activeUserId}`);
      if (savedSessions) {
        localSessions = JSON.parse(savedSessions);
      }
    } catch (e) {
      console.error('Failed to load local sessions', e);
    }
    setSessions(localSessions);

    // Fetch Chat Sessions from backend & merge
    fetchChatSessionsApi(activeUserId).then((backendSessions) => {
      if (Object.keys(backendSessions).length > 0) {
        const mergedSessions = { ...localSessions, ...backendSessions };
        setSessions(mergedSessions);
        try {
          localStorage.setItem(`studymate_sessions_${activeUserId}`, JSON.stringify(mergedSessions));
        } catch (e) {}
      }
    });

    // 2. Fetch documents from backend & merge with localStorage
    fetchUploadedDocuments(activeUserId).then((backendDocs) => {
      let merged: UploadedDocument[] = backendDocs.map((d) => ({
        ...d,
        fileUrl: d.fileUrl || getDocumentFileUrl(d.document_id),
      }));

      try {
        const savedDocs = localStorage.getItem(`studymate_docs_${activeUserId}`);
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

      // Restore active document for this specific user if available
      try {
        const savedActiveDocId = localStorage.getItem(`studymate_active_doc_${activeUserId}`);
        if (savedActiveDocId) {
          const active = merged.find((d) => d.document_id === savedActiveDocId);
          if (active) {
            setActiveDocument(active);
          } else {
            setActiveDocument(null);
          }
        } else {
          setActiveDocument(null);
        }
      } catch (e) {
        setActiveDocument(null);
      }
    });
  }, [user?.user_id]);

  // Sync documents to localStorage for active user
  useEffect(() => {
    if (documents.length >= 0) {
      try {
        localStorage.setItem(docsStorageKey, JSON.stringify(documents));
      } catch (e) {
        console.error('Failed to save documents', e);
      }
    }
  }, [documents, docsStorageKey]);

  // Sync sessions to localStorage for active user
  useEffect(() => {
    if (Object.keys(sessions).length >= 0) {
      try {
        localStorage.setItem(sessionsStorageKey, JSON.stringify(sessions));
      } catch (e) {
        console.error('Failed to save sessions', e);
      }
    }
  }, [sessions, sessionsStorageKey]);

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
    setActiveDocument(null);
    setIsGeneralChatOpen(false);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(loggedUser));
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveDocument(null);
    setIsGeneralChatOpen(false);
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
      await deleteUploadedDocumentApi(docId, userId);
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
        localStorage.removeItem(activeDocStorageKey);
      } catch (e) {}
    }
  };

  const handleNewChat = () => {
    setActiveDocument(null);
    setIsGeneralChatOpen(false);
    try {
      localStorage.removeItem(activeDocStorageKey);
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
      saveChatSessionApi(currentDocId, updatedSession, userId);
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
              userId={userId}
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
              userId={userId}
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
