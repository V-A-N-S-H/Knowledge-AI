'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Trash2, HelpCircle } from 'lucide-react';
import { ChatMessage, sendChatMessage } from '@/lib/api';
import { MessageItem } from './MessageItem';

interface ChatWindowProps {
  messages: ChatMessage[];
  selectedDocIds: string[];
  onMessagesChange: (newMessages: ChatMessage[]) => void;
  onClearCurrentChat: () => void;
  pendingPrompt?: string | null;
  onClearPendingPrompt?: () => void;
  theme?: 'dark' | 'light';
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  selectedDocIds,
  onMessagesChange,
  onClearCurrentChat,
  pendingPrompt,
  onClearPendingPrompt,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        content: `Error: ${err.message || 'Failed to get answer from server.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responseMeta: {
          mode: 'fallback',
          notice: 'System Error',
          sources: [],
        },
      };
      onMessagesChange([...updatedWithUser, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestions = [
    'What key facts or metrics are mentioned in the uploaded document?',
    'Summarize the main points in 3 bullet points.',
    'Explain this concept in simple terms.',
  ];

  return (
    <div
      className={`flex flex-1 flex-col rounded-2xl border backdrop-blur-md overflow-hidden h-full min-h-[500px] shadow-2xl transition-colors duration-200 ${
        isLight
          ? 'border-slate-200 bg-white text-slate-900'
          : 'border-[#1a2034] bg-[#090a0f] text-white'
      }`}
    >
      {/* Top Bar */}
      <div
        className={`flex items-center justify-between border-b px-6 py-4 ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-[#181d2e] bg-[#0d0e14]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h2 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            AI Query Assistant
          </h2>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClearCurrentChat}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-colors ${
              isLight
                ? 'border-slate-300 bg-white text-slate-700 hover:text-rose-600 hover:border-rose-300'
                : 'border-[#263150] bg-[#08090d] text-slate-300 hover:text-rose-400 hover:border-rose-500/30'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            Clear Current Chat
          </button>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl border mb-4 shadow-md ${
                isLight
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                  : 'border-[#263150] bg-[#151a2d] text-indigo-400'
              }`}
            >
              <HelpCircle className="h-7 w-7" />
            </div>
            <h3 className={`text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Ask any question about your data
            </h3>
            <p className="text-sm text-slate-500 max-w-lg mt-1.5 mb-6 font-medium leading-relaxed">
              KnowledgeAI first searches your uploaded PDFs. If answered, it returns document evidence with page numbers. If not, it safely falls back to general LLM knowledge.
            </p>

            {/* Suggestions */}
            <div className="flex flex-col gap-2.5 w-full max-w-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Try asking:
              </span>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className={`rounded-xl border p-3.5 text-left text-sm font-medium transition-all shadow-sm ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/60'
                      : 'border-[#1f273e] bg-[#0e1017] text-slate-200 hover:border-indigo-500/40 hover:bg-[#14192b]'
                  }`}
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => <MessageItem key={msg.id} message={msg} theme={theme} />)
        )}

        {isGenerating && (
          <div
            className={`flex items-center gap-3 text-sm font-semibold p-3.5 rounded-xl w-fit shadow-md border ${
              isLight
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
            }`}
          >
            <Loader2 className="h-4.5 w-4.5 animate-spin text-indigo-500" />
            <span>Analyzing documents & generating grounded response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div
        className={`border-t p-4 ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-[#181d2e] bg-[#0d0e14]'
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedDocIds.length > 0
                ? "Ask a question about selected documents..."
                : "Ask anything (no documents selected)..."
            }
            disabled={isGenerating}
            className={`flex-1 rounded-xl border px-4 py-3.5 text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${
              isLight
                ? 'border-slate-300 bg-white text-slate-900'
                : 'border-[#1e243a] bg-[#0c0e18] text-white'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4f6ef7] text-white hover:bg-[#4360e6] disabled:opacity-40 transition-all shadow-md"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
