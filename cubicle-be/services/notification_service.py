from extensions.otp_ext import db
from models.notification import Notification
from models.user import User
from models.snippet import Snippet
import services.sse_manager as sse_manager


class NotificationService:

    @staticmethod
    def create_and_push(actor: User, snippet: Snippet) -> None:
        """
        Create a DB notification row for each follower of actor and push
        the event to any connected SSE clients via Redis Pub/Sub.
        Only works for public snippets.
        """
        if not snippet.is_public:
            return

        followers = actor.followers.all()
        if not followers:
            return

        message = f'{actor.username} posted a new snippet: {snippet.title}'

        for follower in followers:
            try:
                notif = Notification(
                    recipient_id=follower.user_id,
                    actor_id=actor.user_id,
                    snippet_id=snippet.snippet_id,
                    message=message,
                )
                db.session.add(notif)
                db.session.flush()  # get notification_id before commit

                payload = notif.to_dict()

                # Publish to Redis
                try:
                    sse_manager.publish(follower.user_id, payload)
                except Exception as e:
                    print(f'[SSE] Redis publish failed for user {follower.user_id}: {e}')

            except Exception as e:
                print(f'[Notification] Failed to create notification for user {follower.user_id}: {e}')

        db.session.commit()

    @staticmethod
    def get_for_user(user_id: int) -> list:
        notifications = (
            Notification.query
            .filter_by(recipient_id=user_id)
            .order_by(Notification.created_at.desc())
            .limit(30)
            .all()
        )
        return [n.to_dict() for n in notifications]

    @staticmethod
    def mark_all_read(user_id: int) -> None:
        Notification.query.filter_by(
            recipient_id=user_id, is_read=False
        ).update({'is_read': True})
        db.session.commit()
