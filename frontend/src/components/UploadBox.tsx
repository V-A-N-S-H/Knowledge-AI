'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Video, BookOpen, FileCode } from 'lucide-react';
import { UploadedDocument, uploadDocument } from '@/lib/api';
import { UploadModal } from './UploadModal';

interface UploadBoxProps {
  onDocumentUploaded: (doc: UploadedDocument) => void;
  theme?: 'dark' | 'light';
}

export const UploadBox: React.FC<UploadBoxProps> = ({ onDocumentUploaded, theme = 'light' }) => {
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
    { label: 'PDF', icon: FileText, color: isLight ? 'text-[#d9534f] bg-[#e8a3a3]/30 border-[#f5c6cb]' : 'text-rose-400 bg-rose-950/40 border-rose-500/30', accept: '.pdf' },
    { label: 'Images', icon: ImageIcon, color: isLight ? 'text-[#2e8b57] bg-[#86c59d]/30 border-[#a3e4be]' : 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30', accept: 'image/*' },
    { label: 'Videos', icon: Video, color: isLight ? 'text-[#8a2be2] bg-[#b195d9]/30 border-[#d6c7f2]' : 'text-purple-400 bg-purple-950/40 border-purple-500/30', accept: 'video/*' },
    { label: 'Notes', icon: BookOpen, color: isLight ? 'text-[#2b6cb0] bg-[#8cb7e4]/30 border-[#b2d3f5]' : 'text-blue-400 bg-blue-950/40 border-blue-500/30', accept: '.docx,.doc,.txt' },
    { label: 'Others', icon: FileCode, color: isLight ? 'text-white bg-[#151928] border-slate-800' : 'text-slate-300 bg-slate-900 border-slate-700', accept: '*' },
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
        className={`relative flex flex-col rounded-3xl border p-5 shadow-lg transition-all duration-200 ${
          isLight
            ? 'border-slate-200/90 bg-white text-slate-900 shadow-slate-200/40'
            : 'border-[#1a2034] bg-[#0c0e17] text-white'
        }`}
      >
        <div className="p-1">
          {/* Dashed Dropzone matching user screenshot */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => openPickerWithAccept('.pdf,image/*,video/*,.txt,.docx')}
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed py-10 px-5 text-center transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/80 text-indigo-900 shadow-md'
                : isLight
                ? 'border-[#ccd5e6] bg-[#f8fafc] hover:border-indigo-400 hover:bg-indigo-50/40'
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

            {/* Top Cloud Icon Badge */}
            <div
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-sm transition-transform hover:scale-105 ${
                isLight
                  ? 'border-indigo-200/80 bg-indigo-50/90 text-indigo-600'
                  : 'border-[#263150] bg-[#151a2d] text-[#6366f1]'
              }`}
            >
              <UploadCloud className="h-8 w-8 text-indigo-600" />
            </div>

            <h3 className={`text-base font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Upload Your File
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-5 max-w-xs leading-relaxed">
              Drag & drop your files here, or click to browse
            </p>

            {/* Format Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-xs mb-4">
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
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all hover:scale-105 shadow-2xs ${media.color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{media.label}</span>
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-xs">
              Supports PDF, Images, Videos, Audio, Text, and more
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
