from extensions.otp_ext import db

class Topic(db.Model):
    __tablename__ = 'topic'
    topic_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    popularity_score = db.Column(db.Integer, default=0)

    snippets = db.relationship('Snippet', secondary='snippet_topic', back_populates='topics')

    def to_dict(self):
        return {
            "topic_id": self.topic_id,
            "name": self.name,
            "description": self.description,
            "popularity_score": self.popularity_score
        }