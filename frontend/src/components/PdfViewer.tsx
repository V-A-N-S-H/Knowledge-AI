'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getDocumentFileUrl } from '@/lib/api';

interface PdfViewerProps {
  documentId: string;
  filename: string;
  docFileUrl?: string;
  theme?: 'dark' | 'light';
}

export function PdfViewer({ documentId, filename, docFileUrl, theme = 'dark' }: PdfViewerProps) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fileUrl = docFileUrl || getDocumentFileUrl(documentId);

  // Load PDF as blob for 100% reliable iframe rendering in browser
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadPdfBlob = async () => {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) {
          throw new Error(`Failed to load PDF (HTTP ${res.status})`);
        }
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        if (isMounted) {
          setPdfBlobUrl(objectUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error('Blob fetch error, using direct URL:', err);
        if (isMounted) {
          setPdfBlobUrl(fileUrl);
          setLoading(false);
        }
      }
    };

    loadPdfBlob();

    return () => {
      isMounted = false;
      if (pdfBlobUrl && pdfBlobUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(pdfBlobUrl);
        } catch (e) {}
      }
    };
  }, [fileUrl, documentId]);

  const activeStreamUrl = pdfBlobUrl || fileUrl;

  return (
    <div className="w-full h-full flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#060911]">
      {loading ? (
        <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-12 text-slate-400 space-y-3 bg-[#0b0f19]">
          <Loader2 className="h-8 w-8 animate-spin text-[#173e76]" />
          <p className="text-xs font-bold text-slate-300">Loading {filename}...</p>
        </div>
      ) : (
        <iframe
          src={activeStreamUrl}
          title={filename}
          className="w-full h-full flex-1 border-0 rounded-2xl"
        />
      )}
    </div>
  );
}
