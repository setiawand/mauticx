from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "20250819_0001_initial"
down_revision = None

def upgrade():
    op.create_table("contact",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("email", sa.String(320), unique=True, nullable=False),
        sa.Column("attributes", JSONB, server_default=sa.text("'{}'::jsonb")),
        sa.Column("tags", JSONB, server_default=sa.text("'[]'::jsonb")),
        sa.Column("status", sa.String(32), server_default="subscribed")
    )

    op.create_table("list",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("name", sa.String(128), unique=True, nullable=False)
    )

    op.create_table("contact_list",
        sa.Column("contact_id", sa.BigInteger, sa.ForeignKey("contact.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("list_id", sa.BigInteger, sa.ForeignKey("list.id", ondelete="CASCADE"), primary_key=True)
    )

    op.create_table("segment",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("definition", JSONB, nullable=False),
        sa.Column("materialized_at", sa.TIMESTAMP(timezone=True))
    )

    op.create_table("email_template",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("mjml", sa.Text, nullable=False)
    )

    op.create_table("campaign",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("template_id", sa.BigInteger, sa.ForeignKey("email_template.id"), nullable=False),
        sa.Column("segment_id", sa.BigInteger, sa.ForeignKey("segment.id"), nullable=False),
        sa.Column("send_at", sa.TIMESTAMP(timezone=True)),
        sa.Column("status", sa.String(32), server_default="draft")
    )

    op.create_table("campaign_recipient",
        sa.Column("campaign_id", sa.BigInteger, sa.ForeignKey("campaign.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("contact_id", sa.BigInteger, sa.ForeignKey("contact.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("token", sa.String(36), nullable=False)
    )

    op.create_table("email_send",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("campaign_id", sa.BigInteger, sa.ForeignKey("campaign.id")),
        sa.Column("contact_id", sa.BigInteger, sa.ForeignKey("contact.id")),
        sa.Column("provider", sa.String(32), nullable=False),
        sa.Column("message_id", sa.String(256)),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("error", sa.Text),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"))
    )

    op.create_table("event",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("email_send_id", sa.BigInteger, sa.ForeignKey("email_send.id")),
        sa.Column("type", sa.String(16), nullable=False),
        sa.Column("ts", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
        sa.Column("meta", JSONB, server_default=sa.text("'{}'::jsonb"))
    )

    op.create_table("suppression",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("email", sa.String(320), unique=True, nullable=False),
        sa.Column("reason", sa.String(64), nullable=False)
    )


def downgrade():
    for t in ["suppression","event","email_send","campaign_recipient","campaign","email_template","segment","contact_list","list","contact","user_account"]:
        op.drop_table(t)