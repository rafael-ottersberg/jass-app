"""add rematch_game_id to games

Revision ID: b7e3f1a9c2d4
Revises: 9d41c7a2e5b8
Create Date: 2026-11-13 17:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b7e3f1a9c2d4'
down_revision = '9d41c7a2e5b8'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('games', schema=None) as batch_op:
        batch_op.add_column(sa.Column('rematch_game_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_games_rematch_game_id', 'games', ['rematch_game_id'], ['id'])


def downgrade():
    with op.batch_alter_table('games', schema=None) as batch_op:
        batch_op.drop_constraint('fk_games_rematch_game_id', type_='foreignkey')
        batch_op.drop_column('rematch_game_id')
