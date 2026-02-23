from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.snippet_service import SnippetService

snippets_bp = Blueprint('snippets', __name__)

@snippets_bp.route('/', methods=['GET'])
@jwt_required()
def get_public_snippets():
    current_user_id = get_jwt_identity()
    snippets, error = SnippetService.get_all_public_snippets(current_user_id)
    if error:
        return jsonify({"error": "Failed to fetch snippets", "details": error}), 500
    return jsonify(snippets), 200

@snippets_bp.route('/<int:snippet_id>', methods=['GET'])
@jwt_required()
def get_snippet(snippet_id):
    current_user_id = get_jwt_identity()
    snippet, error = SnippetService.get_snippet_by_id(snippet_id, current_user_id)
    if error:
        if "not found" in error.lower():
            return jsonify({"error": error}), 404
        if "Unauthorized" in error:
            return jsonify({"error": error}), 403
        return jsonify({"error": error}), 400
    return jsonify(snippet), 200

@snippets_bp.route('/topic/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_topic_snippets(topic_id):
    snippets, error = SnippetService.get_snippets_by_topic(topic_id)
    if error:
        status = 404 if error == "Topic not found" else 500
        return jsonify({'error': error}), status
    return jsonify(snippets), 200

@snippets_bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_snippets(user_id):
    snippets, error = SnippetService.get_user_snippets(user_id, get_jwt_identity())
    if error:
        return jsonify({'error': error}), 404
    return jsonify(snippets), 200

@snippets_bp.route('/', methods=['POST'])
@jwt_required()
def create_snippet():
    # Vérifie si la requête contient des fichiers (multipart/form-data)
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        data = request.form.to_dict()
        images = request.files.getlist('images')
    else:
        # Sinon, récupère le payload JSON classique
        data = request.get_json() or {}
        images = []

    snippet, error = SnippetService.create_snippet(data, images, get_jwt_identity())

    if error:
        status = 400 if ("required" in error or "topic" in error) else 500
        return jsonify({'error': error}), status

    return jsonify(snippet), 201

@snippets_bp.route('/<int:snippet_id>', methods=['PUT'])
@jwt_required()
def update_snippet(snippet_id):
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        data = request.form.to_dict()
        images = request.files.getlist('images')
    else:
        data = request.get_json() or {}
        images = []

    snippet, error = SnippetService.update_snippet(snippet_id, data, images, get_jwt_identity())

    if error:
        if error == "Snippet not found":
            status = 404
        elif error == "Unauthorized":
            status = 403
        elif "topic" in error:
            status = 400
        else:
            status = 500
        return jsonify({'error': error}), status

    return jsonify(snippet), 200

@snippets_bp.route('/<int:snippet_id>', methods=['DELETE'])
@jwt_required()
def delete_snippet(snippet_id):
    success, error = SnippetService.delete_snippet(snippet_id, get_jwt_identity())
    if error:
        status = 404 if error == "Snippet not found" else 403 if error == "Unauthorized" else 500
        return jsonify({'error': error}), status
    return jsonify({'message': 'Snippet deleted successfully'}), 200

@snippets_bp.route('/<int:snippet_id>/like', methods=['POST'])
@jwt_required()
def like_snippet(snippet_id):
    result, error = SnippetService.like_snippet(snippet_id, get_jwt_identity())
    if error:
        status = 404 if error == "Snippet not found" else 400
        return jsonify({'error': error}), status
    return jsonify(result), 200

@snippets_bp.route('/<int:snippet_id>/unlike', methods=['POST'])
@jwt_required()
def unlike_snippet(snippet_id):
    result, error = SnippetService.unlike_snippet(snippet_id, get_jwt_identity())
    if error:
        status = 404 if error == "Snippet not found" else 400
        return jsonify({'error': error}), status
    return jsonify(result), 200