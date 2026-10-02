'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Bot, Globe, Copy, Check, Volume2, Square, Loader2, Sparkles, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, requestTTS } from '@/lib/api';
import { SourceCitationBadge } from './SourceCitationBadge';

interface MessageItemProps {
  message: ChatMessage;
  theme?: 'dark' | 'light';
  autoSpeak?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, theme = 'light', autoSpeak = false }) => {
  const isLight = theme === 'light';
  const isUser = message.sender === 'user';
  const meta = message.responseMeta;
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (autoSpeak && !isUser && message.content) {
      handleSpeak();
    }
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
  };

  const handleSpeak = async () => {
    if (isPlaying || isLoadingAudio) {
      stopAudio();
      return;
    }

    setIsLoadingAudio(true);

    try {
      const blob = await requestTTS(message.content);
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setIsLoadingAudio(false);
      };
      audio.onerror = () => {
        fallbackToBrowserSpeech();
      };

      await audio.play();
      setIsPlaying(true);
      setIsLoadingAudio(false);
    } catch (_err) {
      fallbackToBrowserSpeech();
    }
  };

  const fallbackToBrowserSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsLoadingAudio(false);
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/#{1,6}\s*/g, '')
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      setIsPlaying(false);
      setIsLoadingAudio(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsLoadingAudio(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsLoadingAudio(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFromDocument = meta?.mode === 'document' || (meta?.sources && meta.sources.length > 0);

  return (
    <div className={`flex gap-3 text-sm ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`group relative flex max-w-[85%] flex-col gap-3 rounded-2xl p-4 sm:p-5 shadow-sm transition-all ${
          isUser
            ? 'bg-[#173e76] text-white rounded-tr-xs shadow-sm'
            : isLight
            ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-slate-100'
            : 'bg-[#151928] border border-slate-800 text-slate-100 rounded-tl-xs'
        }`}
      >
        {/* File Origin Badge for AI Answers */}
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            {isFromDocument ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                Answered from uploaded file
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Not in uploaded file • General AI Answer
              </span>
            )}
          </div>
        )}
        {/* Message Content */}
        {isUser ? (
          <div className="whitespace-pre-wrap leading-relaxed font-semibold text-white text-sm">
            {message.content}
          </div>
        ) : (
          <div className={`prose max-w-none text-sm leading-relaxed ${isLight ? 'prose-slate text-slate-800' : 'prose-invert text-slate-200'}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Source Citations Badges */}
        {!isUser && meta?.sources && meta.sources.length > 0 && (
          <div className={`flex flex-col gap-2 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Citations ({meta.sources.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {meta.sources.map((src, idx) => (
                <SourceCitationBadge key={idx} source={src} theme={theme} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar (Speak, Copy) */}
        {!isUser && (
          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={handleSpeak}
              disabled={isLoadingAudio}
              className={`p-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isPlaying
                  ? 'border-purple-500 bg-purple-50 text-purple-600 animate-pulse'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-400 hover:text-slate-700'
              }`}
              title="Speak response"
            >
              {isLoadingAudio ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
              ) : isPlaying ? (
                <Square className="h-3.5 w-3.5 text-purple-600 fill-current" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
              title="Copy message"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
