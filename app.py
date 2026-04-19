from flask import Flask, render_template, request, jsonify
from config import DOWNLOADS_DIR, INSTAGRAM_COOKIES_JSON
from errors import get_error
from utils.sanitizers import (
    sanitize_url,
    is_youtube_url,
    is_instagram_url,
    is_valid_url,
)
from utils.downloader import (
    download_youtube,
    download_instagram,
    get_state,
    reset_state,
)
from utils.cookies_instagram import save_cookies, get_cookies_status
import os
import json

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/descargar", methods=["POST"])
def descargar():
    data = request.get_json()
    url = data.get("url", "").strip()

    if not url:
        return jsonify({"success": False, "error": get_error("url_invalida")}), 400

    url = sanitize_url(url)

    if is_youtube_url(url):
        success, error_key = download_youtube(url)
    elif is_instagram_url(url):
        success, error_key = download_instagram(url)
    else:
        return jsonify({"success": False, "error": get_error("url_invalida")}), 400

    if not success:
        return jsonify({"success": False, "error": get_error(error_key)}), 400

    return jsonify({"success": True, "message": "Descarga iniciada"})


@app.route("/estado", methods=["GET"])
def estado():
    state = get_state()
    return jsonify(
        {
            "status": state.status,
            "progress": state.progress,
            "message": state.message,
            "error": get_error(state.error_code) if state.error_code else None,
        }
    )


@app.route("/cookies-status", methods=["GET"])
def cookies_status():
    return jsonify(get_cookies_status())


@app.route("/configurar-cookies", methods=["GET"])
def configurar_cookies_page():
    status = get_cookies_status()
    return render_template("configurar_cookies.html", status=status)


@app.route("/guardar-cookies", methods=["POST"])
def guardar_cookies():
    data = request.get_json()
    cookies = data.get("cookies", [])

    if not isinstance(cookies, list) or len(cookies) == 0:
        return jsonify(
            {"success": False, "error": "Se requiere una lista de cookies"}
        ), 400

    for cookie in cookies:
        if (
            not isinstance(cookie, dict)
            or "name" not in cookie
            or "value" not in cookie
        ):
            return jsonify(
                {"success": False, "error": "Cada cookie debe tener 'name' y 'value'"}
            ), 400

    success = save_cookies(cookies)
    if success:
        return jsonify({"success": True, "message": "Cookies guardadas correctamente"})
    return jsonify({"success": False, "error": "Error al guardar cookies"}), 500


if __name__ == "__main__":
    os.makedirs(DOWNLOADS_DIR, exist_ok=True)
    app.run(debug=False, port=5000)
