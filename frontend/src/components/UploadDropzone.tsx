'use client';

import React, { useRef } from 'react';
import { FileText, UploadCloud, BookOpen, Brain, Globe, Search, Sun, FileCheck, Image as ImageIcon, Video, FileCode, Presentation, File } from 'lucide-react';

interface UploadDropzoneProps {
  onFileSelect: (files: FileList | null) => void;
  isUploading: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelect,
  isUploading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  const formatChips = [
    { label: 'PDF', icon: FileText, color: 'bg-rose-950/80 text-rose-400 border-rose-500/30' },
    { label: 'Images', icon: ImageIcon, color: 'bg-[#173e76]/20 text-[#173e76] border-[#173e76]/40' },
    { label: 'Videos', icon: Video, color: 'bg-purple-950/80 text-purple-400 border-purple-500/30' },
    { label: 'Docs', icon: FileCode, color: 'bg-indigo-950/80 text-indigo-400 border-indigo-500/30' },
    { label: 'PPT', icon: Presentation, color: 'bg-orange-950/80 text-orange-400 border-orange-500/30' },
    { label: 'Text', icon: File, color: 'bg-slate-900 text-slate-400 border-slate-700' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
      {/* Top Header Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search your files..."
            className="w-full rounded-xl border border-[#1e2336] bg-[#0d0f17] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1e2336] bg-[#0d0f17] text-slate-400 hover:text-white transition-colors">
          <Sun className="h-4 w-4" />
        </button>
      </div>

      {/* Hero Headline */}
      <div className="text-center my-2 space-y-1.5">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Upload <span className="text-indigo-400">Your Study Material</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Ask questions, get clear explanations, and learn smarter with AI.
        </p>
      </div>

      {/* Center Dashed Dropzone Card */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#282d45] bg-[#0d0f17]/90 py-12 px-8 text-center transition-all hover:border-indigo-500/60 hover:bg-[#111422] shadow-2xl"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => onFileSelect(e.target.files)}
          disabled={isUploading}
        />

        {/* Circular Glowing Icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-950 to-indigo-900 border border-indigo-500/40 text-indigo-400 shadow-xl shadow-indigo-500/20">
          <FileText className="h-8 w-8 text-indigo-400" />
        </div>

        <p className="text-base font-bold text-white tracking-tight">
          Drag & drop your files here
        </p>
        <p className="text-xs text-slate-500 my-2">or</p>

        {/* Primary Choose Files Button */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 my-2"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Choose Files</span>
        </button>

        <p className="text-[11px] text-slate-500 mt-2 mb-6">
          Supports PDF, Images, Videos, Docs, PPT, Text and more
        </p>

        {/* Format Chips Row */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {formatChips.map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${chip.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{chip.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Feature Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="flex items-start gap-3 rounded-2xl border border-[#1e2336] bg-[#0d0f17] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-950 border border-indigo-500/30 text-indigo-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Ask from your material</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Get accurate answers directly from your uploaded files.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-[#1e2336] bg-[#0d0f17] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-950 border border-purple-500/30 text-purple-400">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Deep understanding</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Clear explanations with page-level citations & examples.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-[#1e2336] bg-[#0d0f17] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#173e76]/20 border border-[#173e76]/40 text-[#173e76]">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Extended knowledge</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Uses AI's general knowledge when not found in your files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
