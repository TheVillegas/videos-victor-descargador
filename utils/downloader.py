import subprocess
import sys
import threading
import os
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


def download_youtube(url: str, progress_callback=None) -> tuple:
    global state, process, output_thread

    if state.status == "downloading":
        return False, "proceso_ya_en_curso"

    state.status = "downloading"
    state.progress = 0
    state.message = "Descargando video de YouTube..."
    state.error_code = None

    output_template = os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s")

    cmd = [
        sys.executable,
        "-m",
        "yt_dlp",
        "-f",
        YOUTUBE_FORMATS,
        "--output",
        output_template,
        url,
    ]

    process = subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
    )

    def read_output():
        global process, state
        for line in process.stdout:
            line = line.strip()
            if progress_callback:
                progress_callback(line)
            if "[download]" in line and "%" in line:
                try:
                    pct = line.split("%")[0].split()[-1]
                    state.progress = int(float(pct))
                except:
                    pass
        if process:
            process.wait()
            if process.returncode != 0:
                state.status = "error"
                state.error_code = "youtube_error"
            else:
                state.status = "done"
                state.progress = 100
                state.message = "Descarga completada!"

    output_thread = threading.Thread(target=read_output)
    output_thread.start()
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
    state.message = "Descargando Reel de Instagram..."
    state.error_code = None

    output_template = os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s")

    cmd = [
        sys.executable,
        "-m",
        "yt_dlp",
        "--cookies",
        cookies_path,
        "-f",
        INSTAGRAM_FORMATS,
        "--output",
        output_template,
        url,
    ]

    process = subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
    )

    def read_output():
        global process, state
        for line in process.stdout:
            line = line.strip()
            if progress_callback:
                progress_callback(line)
            if "[download]" in line and "%" in line:
                try:
                    pct = line.split("%")[0].split()[-1]
                    state.progress = int(float(pct))
                except:
                    pass
        if process:
            process.wait()
            try:
                os.remove(cookies_path)
            except:
                pass
            if process.returncode != 0:
                state.status = "error"
                state.error_code = "instagram_error"
            else:
                state.status = "done"
                state.progress = 100
                state.message = "Descarga completada!"

    output_thread = threading.Thread(target=read_output)
    output_thread.start()
    return True, ""


def get_state():
    return state


def reset_state():
    global state
    state = DownloadState()
