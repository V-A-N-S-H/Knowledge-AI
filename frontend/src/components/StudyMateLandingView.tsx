'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  MessageSquare,
  FileText,
  BookOpen,
  HelpCircle,
  Lightbulb,
  GitBranch,
  Paperclip,
  Mic,
  Search,
  Send,
  MoreVertical,
  ArrowRight,
  Trash2,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Volume2,
  Image as ImageIcon,
  Film,
  File,
} from 'lucide-react';
import { uploadDocument, UploadedDocument } from '@/lib/api';

interface StudyMateLandingViewProps {
  onDocumentUploaded: (doc: UploadedDocument) => void;
  onSelectDocument: (doc: UploadedDocument) => void;
  onDeleteDocument?: (docId: string, e: React.MouseEvent) => void;
  onStartChat?: (initialPrompt: string) => void;
  documents: UploadedDocument[];
  theme?: 'dark' | 'light';
  userId?: string;
}

export function StudyMateLandingView({
  onDocumentUploaded,
  onSelectDocument,
  onDeleteDocument,
  onStartChat,
  documents,
  theme = 'dark',
  userId,
}: StudyMateLandingViewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Typewriter Effect
  const phrases = [
    'with Your Own Content',
    'with PDFs & Documents',
    'with Class Notes & Slides',
    'with Research Papers',
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayText !== currentPhrase) {
      timer = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
      }, 75);
    } else if (!isDeleting && displayText === currentPhrase) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2200);
    } else if (isDeleting && displayText !== '') {
      timer = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length - 1));
      }, 45);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex]);

  const isLight = theme === 'light';

  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTextInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const uploaded = await uploadDocument(file, userId);
      const localBlobUrl = URL.createObjectURL(file);
      onDocumentUploaded({
        ...uploaded,
        fileUrl: localBlobUrl,
      });
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

  const handleSendPrompt = () => {
    const trimmed = textInput.trim();
    if (trimmed) {
      if (onStartChat) {
        onStartChat(trimmed);
      } else if (documents.length > 0) {
        onSelectDocument(documents[0]);
      }
      setTextInput('');
    } else if (documents.length > 0) {
      onSelectDocument(documents[0]);
    }
  };

  return (
    <div
      className={`w-full max-w-5xl mx-auto p-6 lg:p-10 space-y-12 transition-colors ${
        isLight ? 'bg-white text-slate-900' : 'bg-[#060911] text-slate-100'
      }`}
    >
      {/* 1. Hero Headline Banner (OpenAI Style Minimalist Typography) */}
      <div className="text-center space-y-3 pt-4 sm:pt-6 max-w-4xl mx-auto px-2">
        <h1
          className={`text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-semibold tracking-tight font-sans leading-tight min-h-[3.5rem] whitespace-nowrap overflow-hidden text-ellipsis ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          <span>Learn faster </span>
          <span className="text-[#173e76] dark:text-[#5a8cd8] font-bold">{displayText}</span>
          <span className="animate-pulse text-[#173e76] dark:text-[#5a8cd8] font-light">|</span>
        </h1>
        <p className="text-sm sm:text-base font-normal text-slate-400 max-w-xl mx-auto leading-relaxed">
          Transform your PDFs, notes, slides, and research into intelligent, interactive conversations with verifiable citations.
        </p>
      </div>

      {/* 2. Central Action Card Container */}
      <div
        className={`rounded-2xl border p-6 shadow-xl transition-all ${
          isLight
            ? 'bg-white border-slate-200/80 shadow-sm'
            : 'bg-[#0f172a] border-[#1e293b] shadow-black/60'
        }`}
      >
        {/* Dual Inner Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Left Upload Drop Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[200px] ${
              isLight
                ? 'border-[#cbd5e1] bg-[#f8fafc] hover:bg-blue-50/50 hover:border-[#173e76]'
                : 'border-[#1e3a8a] bg-[#0c1322] hover:border-[#173e76] hover:bg-[#111a2e]'
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

            {/* Cloud Icon Circle */}
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 shadow-xs ${
                isLight ? 'bg-[#eff6ff] text-[#173e76]' : 'bg-[#1e293b] text-[#38bdf8]'
              }`}
            >
              <Upload className="h-5 w-5" />
            </div>

            <h3
              className={`font-bold text-sm mb-0.5 ${isLight ? 'text-slate-800' : 'text-white'}`}
            >
              {isUploading ? 'Processing File...' : 'Upload Your Study Material'}
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-3">
              Drag and drop files here or click to browse
            </p>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <span
                className={`text-[11px] font-medium px-3 py-1 rounded-full border flex items-center gap-1.5 transition-all ${
                  isLight
                    ? 'bg-rose-50 text-rose-600 border-rose-200/80'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                <span>PDF</span>
              </span>
              <span
                className={`text-[11px] font-medium px-3 py-1 rounded-full border flex items-center gap-1.5 transition-all ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Images</span>
              </span>
              <span
                className={`text-[11px] font-medium px-3 py-1 rounded-full border flex items-center gap-1.5 transition-all ${
                  isLight
                    ? 'bg-purple-50 text-purple-600 border-purple-200/80'
                    : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                }`}
              >
                <Film className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                <span>Videos</span>
              </span>
              <span
                className={`text-[11px] font-medium px-3 py-1 rounded-full border flex items-center gap-1.5 transition-all ${
                  isLight
                    ? 'bg-sky-50 text-sky-600 border-sky-200/80'
                    : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
                <span>Notes</span>
              </span>
              <span
                className={`text-[11px] font-medium px-3 py-1 rounded-full border flex items-center gap-1.5 transition-all ${
                  isLight
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                }`}
              >
                <File className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>Others</span>
              </span>
            </div>

            <p className="text-[10px] text-slate-400 font-medium">
              Supports PDF, Images, Videos, Audio, Text and more
            </p>
          </div>

          {/* Right Input Box */}
          <div
            className={`border rounded-2xl p-4 flex flex-col justify-between min-h-[200px] ${
              isLight ? 'border-slate-200 bg-white' : 'border-[#1e293b] bg-[#090e17]'
            }`}
          >
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              placeholder="Ask anything or type a prompt (like Gemini or Copilot)..."
              className={`w-full bg-transparent text-xs font-medium focus:outline-none resize-none ${
                isLight
                  ? 'text-slate-800 placeholder:text-slate-400'
                  : 'text-slate-200 placeholder:text-slate-500'
              }`}
              rows={4}
            />

            <div
              className={`flex items-center justify-between pt-3 border-t ${
                isLight ? 'border-slate-100' : 'border-[#1e293b]'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Mic Voice Dictation Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                    isListening
                      ? 'border-rose-500 bg-rose-500/10 text-rose-500 animate-pulse'
                      : isLight
                      ? 'border-slate-200 text-slate-400 hover:text-[#173e76] hover:border-[#173e76]/40'
                      : 'border-[#1e293b] bg-[#0f172a] text-slate-400 hover:text-[#173e76] hover:border-[#173e76]'
                  }`}
                  title={isListening ? 'Listening...' : 'Dictate with voice'}
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>

              <button
                disabled={!textInput.trim() && documents.length === 0}
                onClick={handleSendPrompt}
                className="h-9 w-9 rounded-xl bg-[#173e76] hover:bg-[#12315e] text-white flex items-center justify-center shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}
      </div>

      {/* 3. Recently Uploaded Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`font-semibold text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Recently Uploaded
          </h2>
          {documents.length > 3 && (
            <button
              onClick={() => setShowAllFiles((prev) => !prev)}
              className={`flex items-center gap-1.5 text-xs font-medium hover:underline cursor-pointer ${
                isLight ? 'text-[#173e76]' : 'text-[#5a8cd8]'
              }`}
            >
              <span>{showAllFiles ? 'Show less' : 'View all files'}</span>
              <ArrowRight className={`h-3.5 w-3.5 transition-transform ${showAllFiles ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.length > 0 ? (
            (showAllFiles ? documents : documents.slice(0, 3)).map((doc) => (
              <div
                key={doc.document_id}
                onClick={() => onSelectDocument(doc)}
                className={`rounded-2xl border p-4 flex items-center justify-between transition-all cursor-pointer group ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-[#173e76] hover:shadow-md'
                    : 'bg-[#0a0d16] border-white/10 hover:border-white/25 hover:bg-[#0e121f]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-mono font-bold text-[10px] shrink-0 border ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white/10 text-white border-white/15'
                  }`}>
                    PDF
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {doc.filename}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5 truncate">
                      PDF • {doc.chunk_count || 1} pages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {onDeleteDocument && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc.document_id, e);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <MoreVertical className="h-4 w-4 text-slate-500 shrink-0" />
                </div>
              </div>
            ))
          ) : (
            <div className={`col-span-full rounded-2xl border p-8 text-center text-xs text-slate-400 ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0a0d16] border-white/10'
            }`}>
              <p className="text-slate-300 font-medium">No uploaded files yet</p>
              <p className="text-[11px] text-slate-500 mt-1">Upload a PDF document above to begin asking questions.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. What is KnowledgeAI? (OpenAI Minimalist Column Layout) */}
      <div className="pt-10 space-y-8 border-t border-white/10">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-mono tracking-wider uppercase text-slate-400">Overview</span>
          <h2 className={`text-2xl sm:text-3xl font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Built for students, researchers, and teams.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
            KnowledgeAI synthesizes your documents into structured intelligence. Whether preparing for exams, analyzing scientific literature, or reviewing contracts, get instant verifiable answers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-3xl border p-6 space-y-4 transition-all ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0a0d16] border-white/10 hover:border-white/20'
          }`}>
            <div className="h-10 w-10 rounded-2xl bg-[#173e76]/15 border border-[#173e76]/30 flex items-center justify-center text-[#173e76] dark:text-[#5a8cd8]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              For Students
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Study for exams, summarize long lecture slides, generate flashcards, and get step-by-step solutions for complex textbook exercises.
            </p>
          </div>

          <div className={`rounded-3xl border p-6 space-y-4 transition-all ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0a0d16] border-white/10 hover:border-white/20'
          }`}>
            <div className="h-10 w-10 rounded-2xl bg-[#173e76]/15 border border-[#173e76]/30 flex items-center justify-center text-[#173e76] dark:text-[#5a8cd8]">
              <Search className="h-5 w-5" />
            </div>
            <h3 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              For Researchers
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Cross-examine research papers, extract methodologies, synthesize literature, and verify citations with exact page numbers.
            </p>
          </div>

          <div className={`rounded-3xl border p-6 space-y-4 transition-all ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0a0d16] border-white/10 hover:border-white/20'
          }`}>
            <div className="h-10 w-10 rounded-2xl bg-[#173e76]/15 border border-[#173e76]/30 flex items-center justify-center text-[#173e76] dark:text-[#5a8cd8]">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              For Professionals
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Extract insights from legal contracts, financial audits, technical specifications, and user manuals without reading cover-to-cover.
            </p>
          </div>
        </div>
      </div>

      {/* 5. How It Works (OpenAI Step Flow Layout) */}
      <div className="pt-10 space-y-8 border-t border-white/10">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-mono tracking-wider uppercase text-slate-400">Workflow</span>
          <h2 className={`text-2xl sm:text-3xl font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            How KnowledgeAI works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-3xl border p-6 space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0a0d16] border-white/10'
          }`}>
            <span className="text-xs font-mono text-[#173e76] dark:text-[#5a8cd8] font-bold">01</span>
            <h3 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Upload Documents</h3>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Drag & drop PDFs, class notes, or study materials into the secure workspace.
            </p>
          </div>

          <div className={`rounded-3xl border p-6 space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0a0d16] border-white/10'
          }`}>
            <span className="text-xs font-mono text-[#173e76] dark:text-[#5a8cd8] font-bold">02</span>
            <h3 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Vector RAG Indexing</h3>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              KnowledgeAI indexes pages into vector embeddings with page attribution.
            </p>
          </div>

          <div className={`rounded-3xl border p-6 space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0a0d16] border-white/10'
          }`}>
            <span className="text-xs font-mono text-[#173e76] dark:text-[#5a8cd8] font-bold">03</span>
            <h3 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Ask & Synthesize</h3>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Get answers with citations, generate flashcards, slide presentations, or voice audio.
            </p>
          </div>
        </div>
      </div>

      {/* 6. System Capabilities Grid */}
      <div className="pt-10 space-y-8 border-t border-white/10">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-mono tracking-wider uppercase text-slate-400">Capabilities</span>
          <h2 className={`text-2xl sm:text-3xl font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Key features & technology
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className={`rounded-3xl border p-6 space-y-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0a0d16] border-white/10'
          }`}>
            <div className="flex items-center gap-2.5 mb-1">
              <Sparkles className="h-4 w-4 text-[#173e76] dark:text-[#5a8cd8]" />
              <h4 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Dual AI Engine</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Chat directly with your uploaded documents or use KnowledgeAI as a general AI assistant (like Gemini or Copilot).
            </p>
          </div>

          <div className={`rounded-3xl border p-6 space-y-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0a0d16] border-white/10'
          }`}>
            <div className="flex items-center gap-2.5 mb-1">
              <CheckCircle2 className="h-4 w-4 text-[#173e76] dark:text-[#5a8cd8]" />
              <h4 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Verifiable Citations</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Every document answer comes with page-level citations so you can inspect exact quotes from source files.
            </p>
          </div>

          <div className={`rounded-3xl border p-6 space-y-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0a0d16] border-white/10'
          }`}>
            <div className="flex items-center gap-2.5 mb-1">
              <Volume2 className="h-4 w-4 text-[#173e76] dark:text-[#5a8cd8]" />
              <h4 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Voice Dictation & Speech</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Dictate questions hands-free with your microphone and listen to generated AI answers using text-to-speech audio.
            </p>
          </div>

          <div className={`rounded-3xl border p-6 space-y-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0a0d16] border-white/10'
          }`}>
            <div className="flex items-center gap-2.5 mb-1">
              <ShieldCheck className="h-4 w-4 text-[#173e76] dark:text-[#5a8cd8]" />
              <h4 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Privacy & Security</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Your files and chats remain strictly private to your session, protected and never shared externally.
            </p>
          </div>
        </div>
      </div>

      {/* 7. FAQ (OpenAI Minimalist List Dividers) */}
      <div className="pt-10 pb-12 space-y-8 border-t border-white/10">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-mono tracking-wider uppercase text-slate-400">FAQ</span>
          <h2 className={`text-2xl sm:text-3xl font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4 max-w-3xl">
          <div className={`border-b pb-5 space-y-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
            <h4 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              What is KnowledgeAI?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              KnowledgeAI is an AI teaching assistant that indexes your PDF documents and allows you to chat, ask questions, extract citations, and generate study flashcards.
            </p>
          </div>

          <div className={`border-b pb-5 space-y-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
            <h4 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Can I ask general questions without uploading a file?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Yes. When no document is attached, KnowledgeAI works as a general AI assistant (like Gemini or Copilot), answering questions on coding, math, writing, and science.
            </p>
          </div>

          <div className={`border-b pb-5 space-y-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
            <h4 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              How are citations generated?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              KnowledgeAI processes PDFs into vector page chunks and returns the exact page numbers from which information was retrieved.
            </p>
          </div>

          <div className={`border-b pb-5 space-y-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
            <h4 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              What file formats are supported?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              KnowledgeAI currently supports PDF documents for vector indexing and page citation tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
