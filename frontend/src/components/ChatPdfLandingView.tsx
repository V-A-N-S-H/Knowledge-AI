'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  MessageSquare,
  FileText,
  Sparkles,
  ShieldCheck,
  PenTool,
  BookOpen,
  Presentation,
  Search,
  ArrowDownLeft,
  Link as LinkIcon,
} from 'lucide-react';
import { uploadDocument, UploadedDocument } from '@/lib/api';

interface ChatPdfLandingViewProps {
  onDocumentUploaded: (doc: UploadedDocument) => void;
  theme?: 'dark' | 'light';
}

export function ChatPdfLandingView({ onDocumentUploaded, theme = 'light' }: ChatPdfLandingViewProps) {
  const [activeTab, setActiveTab] = useState('Chat');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLight = theme === 'light';

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const uploaded = await uploadDocument(file);
      onDocumentUploaded(uploaded);
    } catch (err: any) {
      setError(err.message || 'Failed to process document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 overflow-y-auto max-w-5xl mx-auto w-full">
      <div className="w-full flex flex-col items-center text-center space-y-6 pt-6 sm:pt-10">
        {/* Main Hero Header */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl">
          <span className="text-purple-600 dark:text-purple-400">✨ Best-in-class AI tools</span> for
          students and researchers
        </h1>

        {/* Central Tool Card Container */}
        <div
          className={`w-full rounded-3xl border p-6 sm:p-8 shadow-xl transition-all ${
            isLight
              ? 'bg-white/95 border-slate-200/90 shadow-purple-500/5'
              : 'bg-[#121624] border-slate-800 shadow-purple-950/20'
          }`}
        >
          {/* Tool Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6">
            {[
              { id: 'Chat', icon: MessageSquare },
              { id: 'Summary', icon: FileText },
              { id: 'AI Detector', icon: ShieldCheck },
              { id: 'AI Writer', icon: PenTool },
              { id: 'Flashcards', icon: BookOpen },
              { id: 'Slides', icon: Presentation },
              { id: 'Research', icon: Search },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : isLight
                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.id}</span>
                </button>
              );
            })}
          </div>

          {/* Subheading */}
          <h2 className="text-lg sm:text-xl font-bold mb-6 text-slate-800 dark:text-slate-200">
            Chat with any <span className="inline-block">📄 file,</span>{' '}
            <span className="inline-block">📺 video</span> or{' '}
            <span className="inline-block">🔗 website</span>
          </h2>

          {/* Main Dual Box: Left Upload Dropzone + Right Text/Link Paste */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Hand-drawn arrow callout */}
            <div className="hidden lg:flex absolute -left-28 top-12 flex-col items-center text-purple-600 dark:text-purple-400 font-handwriting select-none transform -rotate-12">
              <span className="text-xs font-black tracking-wider uppercase mb-1">
                DROP YOUR PDF FILE HERE
              </span>
              <ArrowDownLeft className="h-8 w-8 animate-bounce" />
            </div>

            {/* Left Upload Card */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all min-h-[160px] ${
                isLight
                  ? 'border-purple-300 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-500'
                  : 'border-purple-800/60 bg-purple-950/20 hover:bg-purple-950/40 hover:border-purple-500'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                {isUploading ? 'Ingesting PDF file...' : 'Drop a file or'}
              </p>
              <button
                type="button"
                disabled={isUploading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all active:scale-95"
              >
                <Upload className="h-4 w-4" />
                <span>upload</span>
              </button>
            </div>

            {/* Right Link / Text Box */}
            <div
              className={`flex flex-col justify-between p-6 rounded-2xl border min-h-[160px] ${
                isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-mono text-base font-semibold">|</span>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ask to start a chat, or paste text or links..."
                  className="w-full bg-transparent text-sm resize-none focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-bold pt-2 border-t border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Paste URL or text</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">
                    CTRL
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">
                    V
                  </span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer University Logos */}
      <div className="w-full py-8 text-center space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Trusted by millions of students and researchers worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all">
          <span className="font-serif font-bold text-sm tracking-wider">HARVARD UNIVERSITY</span>
          <span className="font-serif font-bold text-sm tracking-wider">UNIVERSITY OF CAMBRIDGE</span>
          <span className="font-serif font-bold text-sm tracking-wider">UNIVERSITY OF OXFORD</span>
          <span className="font-serif font-bold text-sm tracking-wider">STANFORD UNIVERSITY</span>
        </div>
      </div>
    </div>
  );
}
