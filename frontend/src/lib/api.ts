const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'http://127.0.0.1:8000');

export interface UploadedDocument {
  document_id: string;
  filename: string;
  chunk_count: number;
  status: string;
  fileUrl?: string;
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

export function getDocumentFileUrl(documentId: string): string {
  return `${API_BASE_URL}/documents/${documentId}/file`;
}

export async function fetchUploadedDocuments(): Promise<UploadedDocument[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/documents`, { method: 'GET' });
    if (!res.ok) return [];
    const docs: UploadedDocument[] = await res.json();
    return docs.map((d) => ({
      ...d,
      fileUrl: d.fileUrl || getDocumentFileUrl(d.document_id),
    }));
  } catch (error) {
    console.error('Failed to fetch documents from server:', error);
    return [];
  }
}

export async function fetchChatSessionsApi(): Promise<{ [docId: string]: ChatSession }> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/sessions`, { method: 'GET' });
    if (!res.ok) return {};
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch chat sessions from server:', error);
    return {};
  }
}

export async function saveChatSessionApi(docId: string, session: ChatSession): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/sessions/${docId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to save chat session to server:', error);
    return false;
  }
}

export async function deleteChatSessionApi(docId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/sessions/${docId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to delete chat session from server:', error);
    return false;
  }
}

export async function deleteUploadedDocumentApi(documentId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
    });
    deleteChatSessionApi(documentId);
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

export interface User {
  user_id: string;
  name: string;
  email: string;
  token: string;
}

export async function signupApi(name: string, email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Sign up failed' }));
    throw new Error(errorData.detail || 'Sign up failed');
  }
  return res.json();
}

export async function loginApi(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(errorData.detail || 'Login failed');
  }
  return res.json();
}

export async function requestTTS(text: string, textLanguage: string = 'auto'): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      text_language: textLanguage,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ public_message: 'TTS synthesis failed' }));
    throw new Error(errorData.public_message || `TTS request failed with status ${res.status}`);
  }

  return res.blob();
}
