import json
from pathlib import Path
from typing import Any, Dict


class ChatSessionRegistry:
    def __init__(self, registry_file: str = "data/chat_sessions.json"):
        self.file_path = Path(registry_file)

    def _load(self) -> Dict[str, Any]:
        try:
            if self.file_path.exists():
                content = self.file_path.read_text(encoding="utf-8")
                return json.loads(content)
        except Exception:
            pass
        return {}

    def _save(self, data: Dict[str, Any]) -> None:
        try:
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
            self.file_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
        except Exception:
            pass

    def get_all_sessions(self) -> Dict[str, Any]:
        data = self._load()
        # If data is un-scoped dict, return flat dict
        return data

    def get_user_sessions(self, user_id: str) -> Dict[str, Any]:
        data = self._load()
        if user_id in data and isinstance(data[user_id], dict):
            return data[user_id]
        # Fallback for un-scoped format
        return {k: v for k, v in data.items() if not isinstance(v, dict) or "messages" in v}

    def get_session(self, user_id: str, doc_id: str) -> Dict[str, Any] | None:
        user_sessions = self.get_user_sessions(user_id)
        return user_sessions.get(doc_id)

    def save_session(self, user_id: str, doc_id: str, session_data: Dict[str, Any]) -> None:
        data = self._load()
        if user_id not in data or not isinstance(data[user_id], dict):
            data[user_id] = {}
        data[user_id][doc_id] = session_data
        self._save(data)

    def delete_session(self, user_id: str, doc_id: str) -> bool:
        data = self._load()
        if user_id in data and isinstance(data[user_id], dict) and doc_id in data[user_id]:
            del data[user_id][doc_id]
            self._save(data)
            return True
        if doc_id in data:
            del data[doc_id]
            self._save(data)
            return True
        return False

    def clear_all(self) -> None:
        self._save({})
