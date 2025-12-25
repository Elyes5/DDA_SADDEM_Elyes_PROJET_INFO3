from extensions import db

class Topic(db.Model):
    __tablename__ = 'topic'
    topic_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    popularity_score = db.Column(db.Integer, default=0)

    snippets = db.relationship('Snippet', secondary='snippet_topic', back_populates='topics')