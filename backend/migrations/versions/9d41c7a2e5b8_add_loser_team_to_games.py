"""add loser_team to games

Revision ID: 9d41c7a2e5b8
Revises: 5c219b71d3a1
Create Date: 2026-10-18 23:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9d41c7a2e5b8'
down_revision = '5c219b71d3a1'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('games', schema=None) as batch_op:
        batch_op.add_column(sa.Column('loser_team', sa.String(length=64), nullable=True))


def downgrade():
    with op.batch_alter_table('games', schema=None) as batch_op:
        batch_op.drop_column('loser_team')
