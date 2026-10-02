'use client';

import React from 'react';
import { FileText, CheckSquare, Square, Trash2, CheckCircle2, Image as ImageIcon, Video, FileSpreadsheet } from 'lucide-react';
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
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`rounded-3xl border p-5 shadow-lg flex flex-col gap-4 transition-all duration-200 ${
        isLight
          ? 'border-slate-200/90 bg-white text-slate-900 shadow-slate-200/40'
          : 'border-[#1a2034] bg-[#0c0e17] text-white'
      }`}
    >
      {/* Header Bar matching screenshot */}
      <div className="flex items-center justify-between px-1">
        <h3 className={`text-lg font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Uploaded Files
        </h3>
        <span className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
          View all ({documents.length})
        </span>
      </div>

      {/* Files List Container */}
      {documents.length === 0 ? (
        <div
          className={`rounded-2xl border border-dashed p-6 text-center ${
            isLight
              ? 'border-slate-300 bg-slate-50/60'
              : 'border-[#1d243a] bg-[#090b12]'
          }`}
        >
          <p className="text-xs text-slate-500 font-semibold">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
          {documents.map((doc) => {
            const isSelected = selectedDocIds.includes(doc.document_id);
            const isPdf = doc.filename.toLowerCase().endsWith('.pdf');
            const isImage = /\.(png|jpe?g|webp|svg)$/i.test(doc.filename);
            const isVideo = /\.(mp4|webm|mov)$/i.test(doc.filename);

            return (
              <div
                key={doc.document_id}
                className={`group flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all shadow-2xs ${
                  isSelected
                    ? isLight
                      ? 'border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-white to-[#173e76]/10 text-slate-900 shadow-sm'
                      : 'border-indigo-500/50 bg-[#14192b] text-white shadow-sm'
                    : isLight
                    ? 'border-slate-200/80 bg-slate-50/80 text-slate-800 hover:border-indigo-200 hover:bg-white'
                    : 'border-[#1f273e] bg-[#121626] text-slate-400 hover:border-[#2d3859]'
                }`}
              >
                {/* Left Side: Checkbox + File Tile + Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleDocSelection(doc.document_id)}
                    className="shrink-0 text-indigo-600 hover:text-indigo-500 transition-colors p-0.5"
                    title={isSelected ? 'Deselect context' : 'Include context'}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-400" />
                    )}
                  </button>

                  {/* Icon Tile matching user screenshot */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      isPdf
                        ? isLight
                          ? 'border-rose-200/80 bg-rose-50 text-rose-500'
                          : 'border-rose-500/30 bg-rose-500/20 text-rose-400'
                        : isImage
                        ? isLight
                          ? 'border-emerald-200/80 bg-emerald-50 text-emerald-600'
                          : 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                        : isVideo
                        ? isLight
                          ? 'border-purple-200/80 bg-purple-50 text-purple-600'
                          : 'border-purple-500/30 bg-purple-500/20 text-purple-400'
                        : isLight
                        ? 'border-[#173e76]/30 bg-[#173e76]/10 text-[#173e76]'
                        : 'border-[#173e76]/40 bg-[#173e76]/20 text-[#173e76]'
                    }`}
                  >
                    {isPdf ? (
                      <FileText className="h-5 w-5" />
                    ) : isImage ? (
                      <ImageIcon className="h-5 w-5" />
                    ) : isVideo ? (
                      <Video className="h-5 w-5" />
                    ) : (
                      <FileSpreadsheet className="h-5 w-5" />
                    )}
                  </div>

                  {/* Filename & Details */}
                  <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                    <span
                      className={`font-extrabold truncate text-sm leading-tight block w-full ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                      title={doc.filename}
                    >
                      {doc.filename}
                    </span>
                    <div className="text-xs flex items-center gap-1.5 mt-1 font-medium text-slate-500">
                      <span className="font-bold text-slate-600">
                        {isPdf ? 'PDF' : isImage ? 'Image' : isVideo ? 'Video' : 'Doc'}
                      </span>
                      <span>•</span>
                      <span>{doc.chunk_count} chunks</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Active Badge & Delete Button */}
                <div className="flex items-center gap-2 shrink-0">
                  {isSelected && (
                    <span
                      className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                        isLight
                          ? 'border-emerald-300/80 bg-emerald-50 text-emerald-600'
                          : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Active
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveDocument(doc.document_id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
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
