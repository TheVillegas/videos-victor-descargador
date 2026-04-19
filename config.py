import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOADS_DIR = os.path.join(BASE_DIR, "Videos Victor")
INSTAGRAM_COOKIES_JSON = os.path.join(BASE_DIR, "instagram_cookies.json")

os.makedirs(DOWNLOADS_DIR, exist_ok=True)

YOUTUBE_FORMATS = "bestvideo[ext=mp4]/best[ext=mp4]/best"
INSTAGRAM_FORMATS = "bestvideo[ext=mp4]/best[ext=mp4]/best"

POLLING_INTERVAL_MS = 2000
