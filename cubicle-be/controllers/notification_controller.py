import json
import time
from flask import Blueprint, Response, stream_with_context, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import services.sse_manager as sse_manager
from services.notification_service import NotificationService

notification_bp = Blueprint('notifications', __name__)


def _sse_format(data: dict) -> str:
    return f'data: {json.dumps(data)}\n\n'


@notification_bp.route('/stream')
@jwt_required()
def stream():
    """
    SSE endpoint. The client opens this as an EventSource.
    The connection is held open; each Redis Pub/Sub message is forwarded
    as an SSE 'data:' event.
    """
    user_id = int(get_jwt_identity())

    @stream_with_context
    def generate():
        pubsub = sse_manager.subscribe(user_id)
        try:
            # Send a heartbeat comment every 20 s to keep proxies alive
            last_heartbeat = time.time()
            while True:
                message = pubsub.get_message(timeout=1.0)
                if message and message.get('type') == 'message':
                    yield _sse_format(json.loads(message['data']))

                if time.time() - last_heartbeat > 20:
                    yield ': heartbeat\n\n'
                    last_heartbeat = time.time()
        except GeneratorExit:
            pass
        finally:
            pubsub.unsubscribe()
            pubsub.close()

    return Response(
        generate(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
        }
    )


@notification_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifications = NotificationService.get_for_user(user_id)
    return jsonify(notifications), 200


@notification_bp.route('/read', methods=['PATCH'])
@jwt_required()
def mark_read():
    user_id = int(get_jwt_identity())
    NotificationService.mark_all_read(user_id)
    return jsonify({'message': 'All notifications marked as read'}), 200
