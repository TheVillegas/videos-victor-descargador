import subprocess
import sys
import threading
import os
import re
import time
from config import DOWNLOADS_DIR, YOUTUBE_FORMATS, INSTAGRAM_FORMATS
from utils.cookies_instagram import (
    load_cookies_json,
    validate_cookies,
    save_cookies_for_ytdlp,
)


class DownloadState:
    def __init__(self):
        self.status = "idle"
        self.progress = 0
        self.message = ""
        self.output_file = ""
        self.error_code = None


state = DownloadState()
process = None
output_thread = None


def parse_progress(line):
    """Parse progress from yt-dlp output line."""
    patterns = [
        r"(\d+\.?\d*)%",
        r"(\d+)/(\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, line)
        if match:
            if "%" in pattern:
                return int(float(match.group(1)))
    return None


def download_youtube(url: str, progress_callback=None) -> tuple:
    global state, process, output_thread

    if state.status == "downloading":
        return False, "proceso_ya_en_curso"

    state.status = "idle"
    state.progress = 0
    state.message = "Preparando descarga..."
    state.error_code = None

    output_template = os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s")

    cmd = [
        sys.executable,
        "-m",
        "yt_dlp",
        "--no-warnings",
        "--no-playlist",
        "-f",
        YOUTUBE_FORMATS,
        "--output",
        output_template,
        "-o",
        "%(title)s.%(ext)s",
        "--embed-thumbnail",
        "--embed-subs",
        "--postprocessor-args",
        "ffmpeg:-acodec aac -ar 48000",
        url,
    ]

    process = subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
    )

    state.status = "downloading"
    state.message = "Bajando video de YouTube..."

    def read_output():
        global process, state
        try:
            for line in process.stdout:
                if line:
                    if progress_callback:
                        progress_callback(line.strip())
                    progress = parse_progress(line)
                    if progress is not None and progress <= 100:
                        state.progress = progress
                    if "has already been downloaded" in line.lower():
                        state.status = "done"
                        state.progress = 100
                        state.message = "Descarga completada!"
                    elif "error" in line.lower() or "fail" in line.lower():
                        state.error_code = "youtube_error"
        except Exception as e:
            state.error_code = "youtube_error"
            state.message = str(e)
        finally:
            if process:
                process.wait()
                if state.status == "downloading":
                    if process.returncode == 0:
                        state.status = "done"
                        state.progress = 100
                        state.message = "Descarga completada!"
                    else:
                        state.status = "error"
                        state.error_code = "youtube_error"

    output_thread = threading.Thread(target=read_output, daemon=True)
    output_thread.start()
    time.sleep(0.1)
    return True, ""


def download_instagram(url: str, progress_callback=None) -> tuple:
    global state, process, output_thread

    if state.status == "downloading":
        return False, "proceso_ya_en_curso"

    cookies = load_cookies_json()
    if not cookies:
        state.status = "error"
        state.error_code = "instagram_no_cookies"
        return False, "instagram_no_cookies"

    if not validate_cookies(cookies):
        state.status = "error"
        state.error_code = "instagram_cookies_invalidas"
        return False, "instagram_cookies_invalidas"

    cookies_path = save_cookies_for_ytdlp(cookies)

    state.status = "downloading"
    state.progress = 0
    state.message = "Bajando Reel de Instagram..."
    state.error_code = None

    output_template = os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s")

    cmd = [
        sys.executable,
        "-m",
        "yt_dlp",
        "--no-warnings",
        "--no-playlist",
        "--cookies",
        cookies_path,
        "-f",
        INSTAGRAM_FORMATS,
        "--output",
        output_template,
        "--postprocessor-args",
        "ffmpeg:-acodec aac -ar 48000",
        url,
    ]

    process = subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
    )

    def read_output():
        global process, state
        try:
            for line in process.stdout:
                if line:
                    if progress_callback:
                        progress_callback(line.strip())
                    progress = parse_progress(line)
                    if progress is not None and progress <= 100:
                        state.progress = progress
        except Exception as e:
            state.error_code = "instagram_error"
        finally:
            if process:
                process.wait()
                try:
                    os.remove(cookies_path)
                except:
                    pass
                if state.status == "downloading":
                    if process.returncode == 0:
                        state.status = "done"
                        state.progress = 100
                        state.message = "Descarga completada!"
                    else:
                        state.status = "error"
                        state.error_code = "instagram_error"

    output_thread = threading.Thread(target=read_output, daemon=True)
    output_thread.start()
    time.sleep(0.1)
    return True, ""


def get_state():
    return state


def reset_state():
    global state
    state = DownloadState()
