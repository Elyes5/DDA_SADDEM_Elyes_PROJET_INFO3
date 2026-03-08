import json
import services.sse_manager as sse_manager

# TTLs (seconds)
_PUBLIC_TTL = 120   # public feed pages — short, likes change sort order fast
_PRIVATE_TTL = 300  # private snippet list — changes less often


def _r():
    """Return a Redis connection (reuses sse_manager's factory)."""
    return sse_manager.get_redis()


# ---------------------------------------------------------------------------
# Key builders
# ---------------------------------------------------------------------------

def _public_key(topic: str, language: str, sort_by: str) -> str:
    """Page-agnostic key: the full public list for a given filter+sort combo."""
    topic = (topic or "all").lower()
    language = (language or "all").lower()
    sort_by = (sort_by or "newest").lower()
    return f"snippets:feed:public:{topic}:{language}:{sort_by}"


def _private_key(user_id: int) -> str:
    return f"snippets:private:{user_id}"


# ---------------------------------------------------------------------------
# Public feed page cache
# ---------------------------------------------------------------------------

def get_public_snippets(topic: str, language: str, sort_by: str):
    """Return the full cached public snippet list for this filter combo, or None on miss."""
    raw = _r().get(_public_key(topic, language, sort_by))
    return json.loads(raw) if raw else None


def set_public_snippets(topic: str, language: str, sort_by: str, data: list) -> None:
    """Store the full public snippet list for this filter combo in the cache."""
    _r().setex(_public_key(topic, language, sort_by), _PUBLIC_TTL, json.dumps(data))


# ---------------------------------------------------------------------------
# Private snippets cache (per user, full list)
# ---------------------------------------------------------------------------

def get_private_snippets(user_id: int):
    """Return the cached private snippet list for a user, or None on miss."""
    raw = _r().get(_private_key(user_id))
    return json.loads(raw) if raw else None


def set_private_snippets(user_id: int, data: list) -> None:
    """Store a user's full private snippet list in the cache."""
    _r().setex(_private_key(user_id), _PRIVATE_TTL, json.dumps(data))


# ---------------------------------------------------------------------------
# Invalidation
# ---------------------------------------------------------------------------

def invalidate_public_feed() -> None:
    """Delete every public feed page from the cache."""
    r = _r()
    for key in r.scan_iter("snippets:feed:public:*"):
        r.delete(key)


def invalidate_private(user_id: int) -> None:
    """Delete a user's private snippet cache entry."""
    _r().delete(_private_key(user_id))
