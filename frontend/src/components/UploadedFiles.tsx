'use client';

import React from 'react';
import { FileText, CheckSquare, Square, Trash2, CheckCircle2, HardDrive, Image as ImageIcon, Video, FileSpreadsheet } from 'lucide-react';
import { UploadedDocument } from '@/lib/api';

interface UploadedFilesProps {
  documents: UploadedDocument[];
  selectedDocIds: string[];
  onToggleDocSelection: (docId: string) => void;
  onRemoveDocument: (docId: string) => void;
  theme?: 'dark' | 'light';
}

export const UploadedFiles: React.FC<UploadedFilesProps> = ({
  documents,
  selectedDocIds,
  onToggleDocSelection,
  onRemoveDocument,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`rounded-2xl border p-4.5 shadow-xl flex flex-col gap-3.5 transition-colors duration-200 ${
        isLight
          ? 'border-slate-200 bg-white text-slate-800'
          : 'border-[#1a2034] bg-[#0c0e17] text-white'
      }`}
    >
      {/* Card Header Bar */}
      <div className={`flex items-center justify-between border-b pb-3.5 ${isLight ? 'border-slate-200' : 'border-[#181d2e]'}`}>
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
              isLight
                ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                : 'border-[#263150] bg-[#181f33] text-indigo-400'
            }`}
          >
            <HardDrive className="h-4 w-4" />
          </div>
          <h3 className={`text-base font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Uploaded Files
          </h3>
        </div>
        <span className="text-sm text-indigo-500 font-bold cursor-pointer hover:underline">
          View all ({documents.length})
        </span>
      </div>

      {/* Files List Container */}
      {documents.length === 0 ? (
        <div
          className={`rounded-xl border border-dashed p-4.5 text-center ${
            isLight
              ? 'border-slate-300 bg-slate-50'
              : 'border-[#1d243a] bg-[#090b12]'
          }`}
        >
          <p className="text-sm text-slate-500 font-medium">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
          {documents.map((doc) => {
            const isSelected = selectedDocIds.includes(doc.document_id);
            const isPdf = doc.filename.toLowerCase().endsWith('.pdf');
            const isImage = /\.(png|jpe?g|webp|svg)$/i.test(doc.filename);
            const isVideo = /\.(mp4|webm|mov)$/i.test(doc.filename);

            return (
              <div
                key={doc.document_id}
                className={`group flex items-center justify-between gap-2.5 rounded-xl border p-3 text-sm transition-all ${
                  isSelected
                    ? isLight
                      ? 'border-indigo-300 bg-indigo-50/80 text-slate-900 shadow-sm'
                      : 'border-indigo-500/50 bg-[#14192b] text-white shadow-sm'
                    : isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    : 'border-[#1f273e] bg-[#121626] text-slate-400 hover:border-[#2d3859]'
                }`}
              >
                {/* Left Side: Checkbox + Icon Badge + Filename */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleDocSelection(doc.document_id)}
                    className="shrink-0 text-indigo-500 hover:text-indigo-400 transition-colors"
                    title={isSelected ? 'Deselect context' : 'Include context'}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-indigo-500" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-400" />
                    )}
                  </button>

                  {/* Icon Badge */}
                  <div
                    className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border ${
                      isPdf
                        ? isLight
                          ? 'border-rose-200 bg-rose-50 text-rose-600'
                          : 'border-rose-500/30 bg-rose-500/20 text-rose-500'
                        : isImage
                        ? isLight
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                          : 'border-emerald-500/30 bg-emerald-500/20 text-emerald-500'
                        : isVideo
                        ? isLight
                          ? 'border-purple-200 bg-purple-50 text-purple-600'
                          : 'border-purple-500/30 bg-purple-500/20 text-purple-500'
                        : isLight
                        ? 'border-blue-200 bg-blue-50 text-blue-600'
                        : 'border-blue-500/30 bg-blue-500/20 text-blue-500'
                    }`}
                  >
                    {isPdf ? (
                      <FileText className="h-4 w-4" />
                    ) : isImage ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : isVideo ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}
                  </div>

                  {/* Filename & Details */}
                  <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                    <span
                      className={`font-bold truncate text-sm leading-tight block w-full ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                      title={doc.filename}
                    >
                      {doc.filename}
                    </span>
                    <div className="text-xs flex items-center gap-1.5 mt-0.5 font-medium">
                      <span className={`font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isPdf ? 'PDF' : isImage ? 'Image' : isVideo ? 'Video' : 'Doc'}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{doc.chunk_count} chunks</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Active Badge & Delete Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isSelected && (
                    <span
                      className={`flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                        isLight
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      Active
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveDocument(doc.document_id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40"
                    title="Delete uploaded file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
