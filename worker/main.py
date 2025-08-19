import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import boto3, requests

DATABASE_URL = os.getenv("DATABASE_URL")
EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "ses")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# Minimal sending task used by app.tasks.snapshot_recipients

def send_one(campaign_id: int, contact_id: int):
    s = Session()
    try:
        # Join template + contact
        tpl = s.execute(text("""
            SELECT t.mjml, c.email
            FROM campaign AS ca
            JOIN email_template t ON t.id = ca.template_id
            JOIN contact c ON c.id = :cid
            WHERE ca.id = :caid
        """), {"cid": contact_id, "caid": campaign_id}).fetchone()
        if not tpl:
            return
        mjml, email = tpl
        # Render via backend service (optional) or inline fallback
        # Here we call backend (assuming api at http://api:8000) – you can switch to direct mjml render
        r = requests.post("http://api:8000/render", json={"mjml": mjml, "vars": {"email": email}})
        html = r.json()["html"] if r.ok else mjml

        if EMAIL_PROVIDER == "ses":
            ses = boto3.client("ses", region_name=AWS_REGION)
            ses.send_email(Source="No Reply <no-reply@example.com>",
                            Destination={"ToAddresses": [email]},
                            Message={"Subject": {"Data": "Hello"},
                                    "Body": {"Html": {"Data": html}}})
        # Insert email_send row
        s.execute(text("INSERT INTO email_send(campaign_id,contact_id,provider,status) VALUES(:ca,:co,:pr,:st)"),
        {"ca": campaign_id, "co": contact_id, "pr": EMAIL_PROVIDER, "st": "sent"})
        s.commit()
    finally:
        s.close()