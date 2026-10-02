'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  X,
  ArrowRight,
  Paperclip,
  Mic,
  Search,
  Send,
  Loader2,
  Trash2,
  FileText,
  Lightbulb,
  Code,
  MessageSquare,
  Sparkles,
  ListOrdered,
  Presentation,
} from 'lucide-react';
import { ChatMessage, sendChatMessage } from '@/lib/api';
import { PdfViewer } from './PdfViewer';
import { MessageItem } from './MessageItem';

interface StudyMateDocumentWorkspaceProps {
  documentId: string;
  filename: string;
  docFileUrl?: string;
  messages: ChatMessage[];
  onMessagesChange: (newMessages: ChatMessage[]) => void;
  onClearChat: () => void;
  onClose: () => void;
  pendingQuickPrompt?: string | null;
  onClearQuickPrompt?: () => void;
  theme?: 'dark' | 'light';
  userId?: string;
}

export function StudyMateDocumentWorkspace({
  documentId,
  filename,
  docFileUrl,
  messages,
  onMessagesChange,
  onClearChat,
  onClose,
  pendingQuickPrompt,
  onClearQuickPrompt,
  theme = 'dark',
  userId,
}: StudyMateDocumentWorkspaceProps) {
  const isLight = theme === 'light';
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  useEffect(() => {
    if (pendingQuickPrompt && !isGenerating) {
      handleSend(pendingQuickPrompt);
      onClearQuickPrompt?.();
    }
  }, [pendingQuickPrompt]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedWithUser = [...messages, userMessage];
    onMessagesChange(updatedWithUser);
    if (!textToSend) setInput('');
    setIsGenerating(true);

    try {
      const docIds = (documentId === 'global' || !docFileUrl) ? [] : [documentId];
      const response = await sendChatMessage(query, docIds, userId);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responseMeta: {
          mode: response.mode,
          notice: response.notice,
          sources: response.sources,
        },
      };

      onMessagesChange([...updatedWithUser, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: `Error: ${err.message || 'Failed to get response.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onMessagesChange([...updatedWithUser, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const promptCards = [
    {
      text: 'Summarize this document in 3 bullet points.',
      icon: FileText,
      iconBg: isLight ? 'bg-purple-50 text-purple-600' : 'bg-[#3b0764] text-purple-400',
    },
    {
      text: `Explain what ${filename.replace('.pdf', '')} is and why it is used.`,
      icon: Lightbulb,
      iconBg: isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-[#052e16] text-emerald-400',
    },
    {
      text: `What are the key features of ${filename.replace('.pdf', '')} mentioned in this document?`,
      icon: FileText,
      iconBg: isLight ? 'bg-[#173e76]/10 text-[#173e76]' : 'bg-[#173e76]/30 text-[#173e76]',
    },
    {
      text: 'Give examples of NumPy vs Python list performance.',
      icon: Code,
      iconBg: isLight ? 'bg-amber-50 text-amber-600' : 'bg-[#451a03] text-amber-400',
    },
    {
      text: 'Explain vectorized operations in simple terms.',
      icon: MessageSquare,
      iconBg: isLight ? 'bg-rose-50 text-rose-600' : 'bg-[#450a0a] text-rose-400',
    },
  ];

  return (
    <div
      className={`flex-1 overflow-hidden w-full h-full p-4 transition-colors ${
        isLight ? 'bg-white' : 'bg-[#060911]'
      } ${docFileUrl ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'flex flex-col items-center justify-center'}`}
    >
      {/* Left Column: Document Viewer (Rendered only when docFileUrl is provided) */}
      {docFileUrl && (
        <div
          className={`rounded-2xl border overflow-hidden shadow-sm flex flex-col h-full ${
            isLight ? 'bg-white border-slate-200/80' : 'bg-[#0f172a] border-[#1e293b]'
          }`}
        >
          <PdfViewer key={documentId} documentId={documentId} filename={filename} docFileUrl={docFileUrl} theme={theme} />
        </div>
      )}

      {/* Right Column: AI Teaching Assistant Panel (Full width when no PDF) */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-sm flex flex-col h-full p-4 transition-colors ${
          docFileUrl ? 'w-full' : 'max-w-4xl mx-auto w-full'
        } ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#0f172a] border-[#1e293b]'}`}
      >
        {/* Messages Stream Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="space-y-5 text-xs font-medium leading-relaxed max-w-xl">
              {/* Header Avatar & Intro Text matching Image 1 */}
              <div className="flex items-start gap-3">
                <div
                  className={`h-7 w-7 rounded-xl border flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                    isLight
                      ? 'bg-purple-100 border-purple-200 text-purple-600'
                      : 'bg-purple-950/60 border-purple-700/60 text-purple-300'
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </div>

                <div className="space-y-3">
                  <p className={isLight ? 'text-slate-800' : 'text-slate-200'}>
                    {docFileUrl ? (
                      <>
                        Hey there! Looks like you've got some solid content inside <span className="font-bold">{filename}</span>. I've processed the key sections, topics, and technical data in your document.
                      </>
                    ) : (
                      <>
                        Hey there! I'm <span className="font-bold">KnowledgeAI</span>, your general AI assistant. Ask me anything, request code, math solutions, explanations, summaries, or creative ideas!
                      </>
                    )}
                  </p>

                  <p className="font-bold text-slate-400">Here's a quick peek:</p>

                  <ul className="space-y-2 pl-4 list-disc marker:text-slate-500">
                    <li>Parsed and indexed all pages of <span className="font-semibold">{filename}</span> into vector database chunks.</li>
                    <li>Extracted key concepts, methodology, technical findings, and structure.</li>
                    <li>Ready to generate summaries, answer specific questions, or create flashcards and slides.</li>
                  </ul>

                  <p className="font-bold text-slate-400 pt-2">What would you like to do next?</p>

                  {/* Action Section Pills matching Image 1 */}
                  <div className="space-y-2.5 pt-1">
                    {/* Summarize Outline Pill Button */}
                    <button
                      onClick={() => handleSend(`Summarize ${filename} in detail with bullet points.`)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        isLight
                          ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                          : 'border-purple-600/80 bg-purple-950/50 text-purple-300 hover:bg-purple-900/60'
                      }`}
                    >
                      <ListOrdered className="h-4 w-4 text-purple-400" />
                      <span>Summarize this document</span>
                    </button>

                    {/* Follow-up Question Cards matching Image 1 */}
                    <button
                      onClick={() => handleSend(`What are the key technical concepts and takeaways from ${filename}?`)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all shadow-xs cursor-pointer ${
                        isLight
                          ? 'border-slate-200 bg-white text-slate-800 hover:border-purple-400 hover:bg-slate-50'
                          : 'border-slate-800 bg-[#0d1322] text-slate-200 hover:border-purple-500/60 hover:bg-[#111827]'
                      }`}
                    >
                      What are the main technical concepts and takeaways from this document?
                    </button>

                    <button
                      onClick={() => handleSend(`What specific techniques and findings are described in ${filename}?`)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all shadow-xs cursor-pointer ${
                        isLight
                          ? 'border-slate-200 bg-white text-slate-800 hover:border-purple-400 hover:bg-slate-50'
                          : 'border-slate-800 bg-[#0d1322] text-slate-200 hover:border-purple-500/60 hover:bg-[#111827]'
                      }`}
                    >
                      What specific techniques and findings are described in this file?
                    </button>

                    {/* Create Row: Flashcards, Slides matching Image 1 */}
                    <div className="flex items-center gap-2 pt-2 text-xs text-slate-400 font-semibold">
                      <span>Create</span>
                      <button
                        onClick={() => handleSend(`Generate study flashcards for ${filename}.`)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                          isLight
                            ? 'border-slate-200 bg-white text-slate-700 hover:border-[#173e76]'
                            : 'border-slate-700 bg-[#0d1322] text-slate-200 hover:border-[#173e76]'
                        }`}
                      >
                        <BookOpen className="h-3.5 w-3.5 text-[#173e76]" />
                        <span>Flashcards</span>
                      </button>

                      <button
                        onClick={() => handleSend(`Create a slide presentation outline from ${filename}.`)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                          isLight
                            ? 'border-slate-200 bg-white text-slate-700 hover:border-[#173e76]'
                            : 'border-slate-700 bg-[#0d1322] text-slate-200 hover:border-[#173e76]'
                        }`}
                      >
                        <Presentation className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Slides</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} theme={theme} />
            ))
          )}

          {isGenerating && (
            <div
              className={`flex items-center gap-2 text-xs font-bold p-3 rounded-xl w-fit ${
                isLight ? 'bg-[#173e76]/10 text-[#173e76]' : 'bg-[#173e76]/30 text-slate-200'
              }`}
            >
              <Loader2 className="h-4 w-4 animate-spin text-[#173e76]" />
              <span>Analyzing document and generating answer...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Chat Input Area (Image 1 Dark Theme Style) */}
        <div className={`pt-3 mt-2 border-t ${isLight ? 'border-slate-100' : 'border-[#1e293b]'}`}>
          <div
            className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all ${
              isLight
                ? 'bg-slate-50/70 border-slate-200 focus-within:border-[#173e76] focus-within:bg-white'
                : 'bg-[#090e17] border-[#1e293b] focus-within:border-[#173e76]'
            }`}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question about this document..."
              disabled={isGenerating}
              className={`w-full bg-transparent px-1 text-xs font-medium focus:outline-none resize-none ${
                isLight
                  ? 'text-slate-800 placeholder:text-slate-400'
                  : 'text-slate-200 placeholder:text-slate-500'
              }`}
              rows={2}
            />

            <div className="flex items-center justify-between pt-1">
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
                type="button"
                disabled={!input.trim() || isGenerating}
                onClick={() => handleSend()}
                className="h-9 w-9 rounded-xl bg-[#173e76] hover:bg-[#12315e] text-white flex items-center justify-center disabled:opacity-40 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
