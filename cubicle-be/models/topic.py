from sqlalchemy import func, select, distinct, cast, Integer
from sqlalchemy.ext.hybrid import hybrid_property
from extensions.otp_ext import db
from models.snippet import Snippet

class Topic(db.Model):
    __tablename__ = 'topic'
    topic_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    snippets = db.relationship('Snippet', back_populates='topic')

    @hybrid_property
    def popularity_score(self):
        if not self.snippets:
            return 0
        total_snippets = len(self.snippets)
        distinct_authors = len({s.author_id for s in self.snippets})
        return total_snippets * distinct_authors

    @popularity_score.expression
    def popularity_score(cls):
        count_snippets = (
            select(func.count(Snippet.snippet_id))
            .where(Snippet.topic_id == cls.topic_id)
            .scalar_subquery()
        )

        count_authors = (
            select(func.count(distinct(Snippet.author_id)))
            .where(Snippet.topic_id == cls.topic_id)
            .scalar_subquery()
        )

        return cast(count_snippets, Integer) * cast(count_authors, Integer)

    def to_dict(self):
        return {
            "topic_id": self.topic_id,
            "name": self.name,
            "description": self.description,
            "popularity_score": self.popularity_score
        }