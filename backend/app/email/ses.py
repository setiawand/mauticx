import boto3
from .base import EmailProvider

class SESEmailProvider(EmailProvider):
    def __init__(self, region: str):
        self.client = boto3.client("ses", region_name=region)

    def send(self, to_email: str, subject: str, html: str, text: str | None = None) -> str:
        res = self.client.send_email(
            Source="No Reply <no-reply@example.com>",
            Destination={"ToAddresses": [to_email]},
            Message={
                "Subject": {"Data": subject},
                "Body": {"Html": {"Data": html}, "Text": {"Data": text or ""}},
            },
        )
        return res["MessageId"]
