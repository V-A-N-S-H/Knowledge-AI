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
        return self._load()

    def get_session(self, doc_id: str) -> Dict[str, Any] | None:
        data = self._load()
        return data.get(doc_id)

    def save_session(self, doc_id: str, session_data: Dict[str, Any]) -> None:
        data = self._load()
        data[doc_id] = session_data
        self._save(data)

    def delete_session(self, doc_id: str) -> bool:
        data = self._load()
        if doc_id in data:
            del data[doc_id]
            self._save(data)
            return True
        return False

    def clear_all(self) -> None:
        self._save({})
