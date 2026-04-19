import re
import os

INVALID_CHARS = r'[<>:"/\\|?*]'


def sanitize_filename(name: str) -> str:
    """Remove invalid characters from filename for Windows."""
    sanitized = re.sub(INVALID_CHARS, "_", name)
    sanitized = sanitized.strip(". ")
    if not sanitized:
        sanitized = "video"
    if len(sanitized) > 100:
        sanitized = sanitized[:100]
    return sanitized


def sanitize_url(url: str) -> str:
    """Basic URL sanitization - just strip whitespace."""
    return url.strip()


def is_youtube_url(url: str) -> bool:
    youtube_patterns = [
        "youtube.com/watch",
        "youtu.be/",
        "youtube.com/shorts",
        "youtube.com/live",
    ]
    return any(pattern in url for pattern in youtube_patterns)


def is_instagram_url(url: str) -> bool:
    ig_patterns = ["instagram.com/reel/", "instagram.com/reels/", "instagram.com/p/"]
    return any(pattern in url for pattern in ig_patterns)


def is_valid_url(url: str) -> bool:
    return is_youtube_url(url) or is_instagram_url(url)
