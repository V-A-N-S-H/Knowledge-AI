'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Sparkles, FileText, Image as ImageIcon, Video, BookOpen, FileCode } from 'lucide-react';
import { UploadedDocument, uploadDocument } from '@/lib/api';
import { UploadModal } from './UploadModal';

interface UploadBoxProps {
  onDocumentUploaded: (doc: UploadedDocument) => void;
  theme?: 'dark' | 'light';
}

export const UploadBox: React.FC<UploadBoxProps> = ({ onDocumentUploaded, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeFile, setActiveFile] = useState<{ name: string; size?: number } | null>(null);
  const [lastUploadedChunkCount, setLastUploadedChunkCount] = useState<number | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [acceptType, setAcceptType] = useState<string>('.pdf,application/pdf,image/*,video/*,.txt,.md,.docx');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const fileNameLower = file.name.toLowerCase();

    if (!fileNameLower.endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMsg('Currently, PDF documents are optimized for full vector indexing & page citations.');
      setActiveFile({ name: file.name, size: file.size });
      setModalOpen(true);
      return;
    }

    setErrorMsg(null);
    setActiveFile({ name: file.name, size: file.size });
    setLastUploadedChunkCount(undefined);
    setIsUploading(true);
    setModalOpen(true);

    try {
      const uploaded = await uploadDocument(file);
      setLastUploadedChunkCount(uploaded.chunk_count);
      onDocumentUploaded(uploaded);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openPickerWithAccept = (accept: string) => {
    setAcceptType(accept);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const mediaTypes = [
    { label: 'PDF', icon: FileText, color: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-500/30 dark:text-rose-400', accept: '.pdf' },
    { label: 'Images', icon: ImageIcon, color: 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-500/30 dark:text-emerald-400', accept: 'image/*' },
    { label: 'Videos', icon: Video, color: 'text-purple-500 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-500/30 dark:text-purple-400', accept: 'video/*' },
    { label: 'Notes', icon: BookOpen, color: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-500/30 dark:text-blue-400', accept: '.docx,.doc,.txt' },
    { label: 'Others', icon: FileCode, color: 'text-slate-500 bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-700/50 dark:text-slate-400', accept: '*' },
  ];

  return (
    <>
      <UploadModal
        isOpen={modalOpen}
        filename={activeFile?.name || ''}
        filesize={activeFile?.size}
        isUploading={isUploading}
        errorMsg={errorMsg}
        chunkCount={lastUploadedChunkCount}
        onClose={() => setModalOpen(false)}
      />

      <div
        className={`relative flex flex-col rounded-2xl border p-4 shadow-xl transition-colors duration-200 ${
          isLight
            ? 'border-slate-200 bg-white text-slate-800'
            : 'border-[#1a2034] bg-[#0c0e17] text-white'
        }`}
      >
        <div className={`flex items-center justify-between border-b pb-3 mb-3 ${isLight ? 'border-slate-200' : 'border-[#181d2e]'}`}>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/90 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/90 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/90 inline-block" />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span className={isLight ? 'text-slate-900' : 'text-white'}>Upload Study Material</span>
          </div>

          <span
            className={`rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold ${
              isLight
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-indigo-500/30 bg-indigo-950 text-indigo-300'
            }`}
          >
            AI Ready
          </span>
        </div>

        <div className="p-1">
          {/* Dashed Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => openPickerWithAccept('.pdf,image/*,video/*,.txt,.docx')}
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-8 px-4 text-center transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-md'
                : isLight
                ? 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'
                : 'border-[#232a42] bg-[#0d0f19] hover:border-indigo-500/60 hover:bg-[#111422]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptType}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={isUploading}
            />

            {/* Cloud Icon Circle */}
            <div
              className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-md transition-transform group-hover:scale-105 ${
                isLight
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                  : 'border-[#263150] bg-[#151a2d] text-[#6366f1]'
              }`}
            >
              <UploadCloud className="h-7 w-7" />
            </div>

            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Upload Your File
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Drag & drop your files here, or click to browse
            </p>

            {/* Format Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs">
              {mediaTypes.map((media, idx) => {
                const Icon = media.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPickerWithAccept(media.accept);
                    }}
                    className={`flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-semibold transition-all hover:scale-105 ${media.color}`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{media.label}</span>
                  </button>
                );
              })}
            </div>

            <span className="text-[10px] text-slate-500 mt-3 font-medium">
              Supports PDF, Images, Videos, Audio, Text, and more
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
