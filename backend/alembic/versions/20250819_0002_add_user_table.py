"""add user table

Revision ID: 20250819_0002_add_user_table
Revises: 20250819_0001_initial
Create Date: 2025-01-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "20250819_0002_add_user_table"
down_revision = "20250819_0001_initial"

def upgrade():
    # Create user_account table
    op.create_table("user_account",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("email", sa.String(320), unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(128), nullable=False),
        sa.Column("is_active", sa.Boolean, server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False)
    )

def downgrade():
    op.drop_table("user_account")