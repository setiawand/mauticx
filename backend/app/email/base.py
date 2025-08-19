from abc import ABC, abstractmethod

class EmailProvider(ABC):
    @abstractmethod
    def send(self, to_email: str, subject: str, html: str, text: str | None = None) -> str: ...