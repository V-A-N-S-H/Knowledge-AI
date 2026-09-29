'use client';

import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2, Loader2, Sparkles, X, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  filename: string;
  filesize?: number;
  isUploading: boolean;
  errorMsg: string | null;
  chunkCount?: number;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  filename,
  filesize,
  isUploading,
  errorMsg,
  chunkCount,
  onClose,
}) => {
  const [step, setStep] = useState<number>(1);
  const [progress, setProgress] = useState<number>(15);

  useEffect(() => {
    if (isUploading) {
      setStep(1);
      setProgress(25);
      const timer1 = setTimeout(() => {
        setStep(2);
        setProgress(65);
      }, 900);
      const timer2 = setTimeout(() => {
        setStep(3);
        setProgress(90);
      }, 1800);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else if (!errorMsg && chunkCount !== undefined) {
      setStep(4);
      setProgress(100);
    }
  }, [isUploading, errorMsg, chunkCount]);

  if (!isOpen) return null;

  const formattedSize = filesize
    ? filesize > 1024 * 1024
      ? `${(filesize / (1024 * 1024)).toFixed(2)} MB`
      : `${(filesize / 1024).toFixed(0)} KB`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0e1017] p-6 shadow-2xl shadow-indigo-500/10">
        {/* Mac Window Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/90 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/90 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/90 inline-block" />
            <span className="text-xs font-mono font-medium text-slate-400 ml-2">
              File Processing & Vector Indexing
            </span>
          </div>

          {!isUploading && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* File Details Card */}
        <div className="my-5 flex items-center gap-3.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-950 border border-indigo-500/30 text-indigo-400">
            <FileText className="h-6 w-6" />
          </div>
          <div className="flex-1 truncate">
            <h4 className="text-sm font-semibold text-white truncate" title={filename}>
              {filename}
            </h4>
            {formattedSize && <p className="text-xs text-slate-400 mt-0.5">{formattedSize}</p>}
          </div>
          {step === 4 && (
            <span className="rounded-full bg-emerald-950 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
              {chunkCount} Chunks
            </span>
          )}
        </div>

        {/* Error State */}
        {errorMsg ? (
          <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300 my-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <div className="flex-1">
              <strong className="block font-semibold text-rose-200">Processing Error</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        ) : (
          <>
            {/* Animated Progress Bar */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{step === 4 ? 'Processing Complete' : 'Indexing Document...'}</span>
                <span className="font-mono text-indigo-400">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stepper Status Indicators */}
            <div className="space-y-3 text-xs">
              {/* Step 1 */}
              <div className="flex items-center gap-3">
                {step > 1 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
                )}
                <span className={step >= 1 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                  1. Extracting PDF text & page structures (PyMuPDF)
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3">
                {step > 2 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : step === 2 ? (
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className={step >= 2 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                  2. Generating 3072-dim embeddings (Google Gemini API)
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3">
                {step > 3 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : step === 3 ? (
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className={step >= 3 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                  3. Indexing vector chunks into Qdrant Vector DB
                </span>
              </div>
            </div>
          </>
        )}

        {/* Modal Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end">
          {step === 4 || errorMsg ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>{errorMsg ? 'Close' : 'Start Querying Data'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              <span>Please wait while indexing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
