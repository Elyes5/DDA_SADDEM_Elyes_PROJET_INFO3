import json
import os
import redis


def get_redis() -> redis.Redis:
    """Return a Redis connection, picking DEV or PROD URL based on FLASK_ENV."""
    env = os.getenv('FLASK_ENV', 'development')
    if env == 'production':
        url = os.getenv('PROD_REDIS_URL', 'redis://localhost:6379/0')
    else:
        url = os.getenv('DEV_REDIS_URL', 'redis://localhost:6379/0')
    return redis.Redis.from_url(url, decode_responses=True)


def _channel(user_id: int) -> str:
    return f'notifications:{user_id}'


def publish(user_id: int, data: dict) -> None:
    """Publish a notification payload to a user's Redis channel."""
    r = get_redis()
    r.publish(_channel(user_id), json.dumps(data))


def subscribe(user_id: int) -> redis.client.PubSub:
    """Return a PubSub object subscribed to the user's notification channel."""
    r = get_redis()
    pubsub = r.pubsub(ignore_subscribe_messages=True)
    pubsub.subscribe(_channel(user_id))
    return pubsub
