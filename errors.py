ERROR_MESSAGES = {
    "url_invalida": "La URL no parece ser de YouTube o Instagram. Revisa el enlace.",
    "youtube_error": "Error al descargar video de YouTube. Verifica que el video exista.",
    "instagram_error": "Error al descargar Reel de Instagram. Necesitas cookies válidas.",
    "instagram_no_cookies": "Instagram requiere cookies. Haz clic en 'Configurar Instagram' para agregar tus cookies.",
    "instagram_cookies_invalidas": "Las cookies de Instagram no son válidas. Verifica los datos ingresados.",
    "proceso_ya_en_curso": "Ya hay una descarga en proceso. Espera a que termine.",
    "nombre_archivo_invalido": "El nombre del archivo contiene caracteres no permitidos.",
    "error_desconocido": "Error inesperado. Cierra y vuelve a intentar.",
    "video_privado": "Este video es privado y no se puede descargar.",
    "video_no_existe": "Este video no existe o fue eliminado.",
}


def get_error(key: str) -> str:
    return ERROR_MESSAGES.get(key, ERROR_MESSAGES["error_desconocido"])
