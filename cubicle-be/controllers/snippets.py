from flask import request, jsonify, Blueprint
from models.snippet import Snippet

snippets_bp = Blueprint('snippets', __name__)

@snippets_bp.route('/', methods=['GET'])
def get_snippet():
    data = request.get_json()
    snippet_id = data.get('snippet_id')

    snippet = Snippet.get_by_id(snippet_id)
    if snippet:
        return jsonify(snippet.to_dict()), 200
    else:
        return jsonify({'error': 'Snippet not found'}), 404

