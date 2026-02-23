from extensions.otp_ext import db


class SnippetImage(db.Model):
    __tablename__ = 'snippet_image'
    image_id = db.Column(db.Integer, primary_key=True)
    snippet_id = db.Column(db.Integer, db.ForeignKey('snippet.snippet_id'), nullable=False)

    # Store the URL, Azure key or uploads depending on my environment
    image_url = db.Column(db.String(500), nullable=False)

    snippet = db.relationship('Snippet', back_populates='images')

    def to_dict(self):
        return {
            "id": self.image_id,
            "url": self.image_url
        }