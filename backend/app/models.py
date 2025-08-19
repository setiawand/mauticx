from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Integer, BigInteger, String, Text, JSON, TIMESTAMP, ForeignKey, func
from typing import Optional

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user_account"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(320), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(128))
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

class Contact(Base):
    __tablename__ = "contact"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(320), unique=True)
    attributes: Mapped[dict] = mapped_column(JSON, default=dict)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(32), default="subscribed")
    created_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

class List(Base):
    __tablename__ = "list"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), unique=True)

class ContactList(Base):
    __tablename__ = "contact_list"
    contact_id: Mapped[int] = mapped_column(ForeignKey("contact.id", ondelete="CASCADE"), primary_key=True)
    list_id: Mapped[int] = mapped_column(ForeignKey("list.id", ondelete="CASCADE"), primary_key=True)

class Segment(Base):
    __tablename__ = "segment"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128))
    definition: Mapped[dict] = mapped_column(JSON) # JSON filter tree
    materialized_at: Mapped[Optional[str]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

class EmailTemplate(Base):
    __tablename__ = "email_template"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128))
    mjml: Mapped[str] = mapped_column(Text)

class Campaign(Base):
    __tablename__ = "campaign"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128))
    template_id: Mapped[int] = mapped_column(ForeignKey("email_template.id"))
    segment_id: Mapped[int] = mapped_column(ForeignKey("segment.id"))
    send_at: Mapped[Optional[str]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="draft")

class CampaignRecipient(Base):
    __tablename__ = "campaign_recipient"
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaign.id", ondelete="CASCADE"), primary_key=True)
    contact_id: Mapped[int] = mapped_column(ForeignKey("contact.id", ondelete="CASCADE"), primary_key=True)
    token: Mapped[str] = mapped_column(String(36))

class EmailSend(Base):
    __tablename__ = "email_send"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaign.id"))
    contact_id: Mapped[int] = mapped_column(ForeignKey("contact.id"))
    provider: Mapped[str] = mapped_column(String(32))
    message_id: Mapped[str] = mapped_column(String(256), nullable=True)
    status: Mapped[str] = mapped_column(String(32))
    error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

class Event(Base):
    __tablename__ = "event"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email_send_id: Mapped[int] = mapped_column(ForeignKey("email_send.id"))
    type: Mapped[str] = mapped_column(String(16)) # open|click|bounce|complaint|unsubscribe
    ts: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    meta: Mapped[dict] = mapped_column(JSON, default=dict)

class Suppression(Base):
    __tablename__ = "suppression"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(320), unique=True)
    reason: Mapped[str] = mapped_column(String(64))