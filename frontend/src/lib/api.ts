const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UploadedDocument {
  document_id: string;
  filename: string;
  chunk_count: number;
  status: string;
}

export interface SourceCitation {
  filename: string;
  page: number;
  chunk_id: string;
}

export interface ChatResponse {
  mode: 'document' | 'fallback';
  notice: string | null;
  answer: string;
  sources: SourceCitation[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  responseMeta?: {
    mode: 'document' | 'fallback';
    notice: string | null;
    sources: SourceCitation[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'healthy';
  } catch (_error) {
    return false;
  }
}

export async function fetchUploadedDocuments(): Promise<UploadedDocument[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/documents`, { method: 'GET' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch documents from server:', error);
    return [];
  }
}

export async function deleteUploadedDocumentApi(documentId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to delete document from server:', error);
    return false;
  }
}

export async function uploadDocument(file: File): Promise<UploadedDocument> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ public_message: 'Upload failed' }));
    throw new Error(errorData.public_message || `Upload failed with status ${res.status}`);
  }

  return res.json();
}

export async function sendChatMessage(
  message: string,
  documentIds: string[] = []
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      document_ids: documentIds,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ public_message: 'Failed to complete chat request' }));
    throw new Error(errorData.public_message || `Chat request failed with status ${res.status}`);
  }

  return res.json();
}
