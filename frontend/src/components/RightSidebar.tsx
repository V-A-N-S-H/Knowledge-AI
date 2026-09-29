'use client';

import React from 'react';
import { FileText, Video, Image as ImageIcon, FileCode, Trash2, ExternalLink, Globe, CheckCircle2 } from 'lucide-react';
import { UploadedDocument, SourceCitation } from '@/lib/api';

interface RightSidebarProps {
  documents: UploadedDocument[];
  sources: SourceCitation[];
  mode?: 'document' | 'fallback' | null;
  onRemoveDocument: (docId: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  documents,
  sources,
  mode,
  onRemoveDocument,
}) => {
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="h-4 w-4 text-rose-400" />;
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) return <Video className="h-4 w-4 text-purple-400" />;
    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext || '')) return <ImageIcon className="h-4 w-4 text-emerald-400" />;
    return <FileCode className="h-4 w-4 text-blue-400" />;
  };

  const getFileBadgeBg = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'bg-rose-950/70 border-rose-500/30';
    if (['mp4', 'mov'].includes(ext || '')) return 'bg-purple-950/70 border-purple-500/30';
    if (['png', 'jpg'].includes(ext || '')) return 'bg-emerald-950/70 border-emerald-500/30';
    return 'bg-blue-950/70 border-blue-500/30';
  };

  return (
    <aside className="w-80 shrink-0 flex flex-col gap-5 border-l border-[#1a1d2d] bg-[#090b10] p-4 h-screen sticky top-0 overflow-y-auto">
      {/* Uploaded Files Card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1e2336] bg-[#0d0f17] p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-200">
            Uploaded Files
          </h3>
          <span className="text-[11px] font-semibold text-indigo-400 cursor-pointer hover:underline">
            View All ({documents.length})
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {documents.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No files uploaded yet
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.document_id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#1e2336] bg-[#131622] p-2.5 transition-all hover:border-slate-700"
              >
                <div className="flex items-center gap-3 truncate flex-1 min-w-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${getFileBadgeBg(doc.filename)}`}>
                    {getFileIcon(doc.filename)}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-slate-200 truncate" title={doc.filename}>
                      {doc.filename}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      PDF · {doc.chunk_count} Chunks
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveDocument(doc.document_id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/40 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sources Used Card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1e2336] bg-[#0d0f17] p-4 shadow-xl flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-200">
            Sources Used
          </h3>
          <span className="text-[11px] font-semibold text-indigo-400 cursor-pointer hover:underline">
            View All
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {sources.length > 0 ? (
            sources.map((src, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#1e2336] bg-[#131622] p-2.5"
              >
                <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    {idx + 1}
                  </span>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${getFileBadgeBg(src.filename)}`}>
                    {getFileIcon(src.filename)}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-slate-200 truncate" title={src.filename}>
                      {src.filename}
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-400">
                      Page {src.page}
                    </span>
                  </div>
                </div>

                <ExternalLink className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              </div>
            ))
          ) : mode === 'fallback' ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/30 p-2.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-900/60 text-[10px] font-bold text-amber-300">
                  1
                </span>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-900/50 border border-amber-500/40 text-amber-400">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-amber-200">
                    AI General Knowledge
                  </span>
                  <span className="text-[10px] text-amber-400/80">
                    Fallback Response
                  </span>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No sources referenced yet
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
