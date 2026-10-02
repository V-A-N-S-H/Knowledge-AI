'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Sparkles,
  Loader2,
  Trash2,
  HelpCircle,
  Mic,
  MicOff,
  Volume2,
  Plus,
  BookOpen,
  Presentation,
  Check,
} from 'lucide-react';
import { ChatMessage, sendChatMessage } from '@/lib/api';
import { MessageItem } from './MessageItem';

interface ChatWindowProps {
  messages: ChatMessage[];
  selectedDocIds: string[];
  docName?: string;
  onMessagesChange: (newMessages: ChatMessage[]) => void;
  onClearCurrentChat: () => void;
  pendingPrompt?: string | null;
  onClearPendingPrompt?: () => void;
  theme?: 'dark' | 'light';
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  selectedDocIds,
  docName = 'this document',
  onMessagesChange,
  onClearCurrentChat,
  pendingPrompt,
  onClearPendingPrompt,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [mode, setMode] = useState<'fast' | 'quality'>('fast');
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
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
    if (pendingPrompt && !isGenerating) {
      handleSend(pendingPrompt);
      if (onClearPendingPrompt) {
        onClearPendingPrompt();
      }
    }
  }, [pendingPrompt, isGenerating]);

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
      const response = await sendChatMessage(query, selectedDocIds);

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
        responseMeta: {
          mode: 'fallback',
          notice: 'Error',
          sources: [],
        },
      };
      onMessagesChange([...updatedWithUser, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const promptSuggestions = [
    `✨ Summarize ${docName}`,
    `How does ${docName} handle key concepts?`,
    `What are the most useful methods or findings mentioned in ${docName}?`,
  ];

  return (
    <div
      className={`flex flex-col h-full w-full overflow-hidden transition-colors ${
        isLight ? 'bg-white text-slate-900' : 'bg-[#0f121d] text-slate-100'
      }`}
    >
      {/* Top Controls Header */}
      <div
        className={`flex items-center justify-between border-b px-4 py-2.5 text-xs font-semibold ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#151928] border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="font-bold">AI Chat</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
              autoSpeak
                ? 'border-purple-500 bg-purple-50 text-purple-600'
                : 'border-slate-200 dark:border-slate-800 hover:border-purple-300'
            }`}
          >
            <Volume2 className="h-3.5 w-3.5 text-purple-600" />
            <span>Voice: {autoSpeak ? 'ON' : 'OFF'}</span>
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={onClearCurrentChat}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            {/* ChatPDF Initial Welcome Message Bubble */}
            <div className="flex items-start gap-3">
              <div
                className={`p-4 rounded-2xl max-w-xl text-sm font-medium leading-relaxed border shadow-sm ${
                  isLight
                    ? 'bg-slate-50 border-slate-200/90 text-slate-800'
                    : 'bg-[#181d2e] border-slate-800 text-slate-200'
                }`}
              >
                <p className="font-bold text-base mb-1">
                  Hey there, ready to chat about {docName}?
                </p>
                <p className="text-slate-500 dark:text-slate-400 mb-3">
                  I've indexed your file completely. Ask any questions, summarize key pages, or extract citations instantly!
                </p>
              </div>
            </div>

            {/* Quick Prompt Pills (ChatPDF Image 2 Style) */}
            <div className="pl-11 space-y-2.5 max-w-xl">
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="px-3.5 py-2 rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-all shadow-sm text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Action Buttons: Flashcards & Slides */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-slate-400 font-bold">Create:</span>
                <button
                  onClick={() => handleSend(`Create study flashcards from ${docName}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-purple-400 text-xs font-bold transition-all"
                >
                  <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Flashcards</span>
                </button>
                <button
                  onClick={() => handleSend(`Generate presentation slides summary from ${docName}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-purple-400 text-xs font-bold transition-all"
                >
                  <Presentation className="h-3.5 w-3.5 text-rose-500" />
                  <span>Slides</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageItem
              key={msg.id}
              message={msg}
              theme={theme}
              autoSpeak={autoSpeak && idx === messages.length - 1}
            />
          ))
        )}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 w-fit">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>ChatPDF AI is reading and analyzing your PDF...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Container */}
      <div
        className={`border-t p-3 sm:p-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#151928] border-slate-800'
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className={`flex flex-col gap-2 p-2.5 rounded-2xl border transition-all ${
            isLight
              ? 'bg-slate-50 border-slate-200 focus-within:border-purple-400 focus-within:bg-white'
              : 'bg-slate-900 border-slate-800 focus-within:border-purple-500'
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any question..."
            disabled={isGenerating}
            className="w-full bg-transparent px-2 py-1 text-sm focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />

          <div className="flex items-center justify-between pt-1">
            {/* Mode Switches: Fast / Quality */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setMode('fast')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    mode === 'fast'
                      ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Fast
                </button>
                <button
                  type="button"
                  onClick={() => setMode('quality')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    mode === 'quality'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Quality
                </button>
              </div>

              <button
                type="button"
                onClick={toggleListening}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isListening
                    ? 'border-rose-500 bg-rose-600 text-white animate-pulse'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-purple-600'
                }`}
                title="Voice input"
              >
                {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 transition-all shadow-md shadow-purple-600/30"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
