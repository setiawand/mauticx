import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from .base import EmailProvider

class SMTPEmailProvider(EmailProvider):
    def __init__(self, host: str, port: int, user: str, password: str, from_addr: str):
        self.host, self.port, self.user, self.password, self.from_addr = host, port, user, password, from_addr

    def send(self, to_email: str, subject: str, html: str, text: str | None = None) -> str:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.from_addr
        msg["To"] = to_email
        if text:
            msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(self.host, self.port) as s:
            if self.user:
                s.starttls()
                s.login(self.user, self.password)
            s.sendmail(self.from_addr, [to_email], msg.as_string())
        return "smtp-queued"
