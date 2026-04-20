# SPEC.md — Videos Victor: Rediseño UI/UX

> Spec-Driven Development para el rediseño de la interfaz de Videos Victor.
> Fecha: 2026-04-20

---

## 1. Problema Actual

La UI actual presenta varios problemas:

1. **Lenguaje demasiado informal/chileno** — No es profesional para un producto público. Palabras como "weón", "po", "cachái", "alhuea" generan desconfianza y no son apropiadas para todos los usuarios.
2. **Instrucciones de Instagram incomprensibles** — El flujo de configuración de cookies requiere conocimiento técnico avanzado (F12, DevTools, Application tab, cookies). Un usuario no técnico no sabe qué hacer.
3. **Estados poco claros** — El indicador de estado de Instagram ("No cacho Instagram", "Cookies pedidas") no explica qué significa ni qué debe hacer el usuario.
4. **Mensajes de error técnicos** — Los mensajes de error del sistema no están redactados para usuarios finales.

---

## 2. Objetivos del Rediseño

- **Idioma neutro y profesional** — Español claro que funcione para cualquier persona de habla hispana, sin regionalismos.
- **Instrucciones paso a paso visuales** — Guía clara con capturas de pantalla ficticias para usuarios no técnicos.
- **Estados UX comprensibles** — Mensajes que expliquen exactamente qué falta y qué hacer.
- **Mantener la funcionalidad existente** — No cambiar el backend, solo la interfaz.

---

## 3. Lenguaje — Diccionario de Cambios

| Antes (chileno) | Después (español neutro) |
|-----------------|--------------------------|
| "Descargador Weón 💪" | "Descargador de Videos" |
| "Bajando video..." | "Descargando video..." |
| "Bajando..." | "Descargando..." |
| "Po, tienes que poner un link weón" | "Ingresa el enlace del video para comenzar" |
| "o si cachái Instagram" | "o si prefieres descargar desde Instagram" |
| "No cacho Instagram" | "Instagram no está configurado" |
| "alhuea, no hay conexión" | "Sin conexión. Verifica tu internet e intenta nuevamente" |
| "¡Listo po! El video está en..." | "¡Listo! Tu video se guardó en la carpeta Videos Victor" |
| "Algo salió mal weón" | "Ocurrió un error. Intenta nuevamente" |
| "Se perdió la conexión" | "Se perdió la conexión. Reintentando..." |

---

## 4. Arquitectura de Página

### 4.1 index.html (página principal)

**Elementos:**
1. Header con logo y título (profesional, sin emojis informales)
2. Card principal con input de URL
3. Badges de plataforma (YouTube, Instagram)
4. Barra de progreso (oculta hasta iniciar descarga)
5. Sección de mensajes de estado (éxito/error)
6. Botón de configuración de Instagram (solo visible si IG no está configurado o como acceso rápido)
7. Indicador de estado de Instagram (claro y accionable)
8. Footer con nombre de carpeta de descarga

**Estados de UI:**

| Estado | Indicador |
|--------|-----------|
| Sin actividad | Input listo, botón "Descargar" |
| Descargando | Barra de progreso animada, botón deshabilitado |
| Éxito | Mensaje verde con icono, auto-limpieza en 6s |
| Error | Mensaje rojo con icono descriptivo, auto-limpieza en 6s |

### 4.2 configurar_cookies.html (configuración Instagram)

**Problemas actuales:**
- Instrucciones técnicas (F12, DevTools, Application tab)
- No explica qué es sessionid ni por qué se necesita
- No hay guía visual

**Nueva estructura:**
1. **Explicación simple** — Qué son las cookies y por qué se necesitan
2. **Paso a paso visual** — Con capturas de pantalla ficticias que muestran exactamente qué hacer
3. **Campo de ingreso claro** — Con validación y feedback
4. **Estado post-configuración** — Confirmación clara y opción de volver

**Guía paso a paso (nueva):**

```
PASO 1: Abre Instagram en tu navegador
  → Ve a instagram.com e inicia sesión con tu usuario y contraseña

PASO 2: Accede a las cookies de Instagram
  → En la barra de direcciones, haz clic en el candado 🔒
  → Selecciona "Cookies" > "instagram.com"

PASO 3: Busca el cookie "sessionid"
  → Busca en la lista el cookie llamado "sessionid"
  → Copia el valor que aparece en la columna "Valor"

PASO 4: Pega el valor aquí abajo
  → Haz clic en el campo de texto
  → Pega el valor copiado (es una cadena larga de letras y números)
  → Haz clic en "Guardar"
```

---

## 5. Indicadores de Estado — Mejoras

### Antes:

```
✅ Instagram listo         → Entendible pero demasiado informal
⚠️ Cookies pedidas         → ¿Qué significa "pedidas"?
No cacho Instagram         → Muy informal, no dice qué hacer
```

### Después:

```
🟢 Instagram configurado   → Funciona para Reels
🟡 Instagram sin verificar → Necesitas pegar la sessionid
🔴 Instagram no configurado → Haz clic en "Configurar Instagram" para activar Reels
```

---

## 6. Diseño Visual (mantener con ajustes)

**Paleta de colores:** Mantener la actual (fondo oscuro, rojo acento)

**Mejoras CSS:**
- Mejor espaciado y jerarquía visual
- Estados de focus claros para accesibilidad
- Tooltips explicativos en elementos clave
- Transiciones suaves para estados de carga
- Responsive mejorado para móviles

---

## 7. Criterios de Éxito

- [ ] No hay regionalismos chilenos en ninguna parte de la UI
- [ ] Un usuario sin conocimientos técnicos puede configurar Instagram siguiendo las instrucciones
- [ ] Los mensajes de error explican qué pasó y qué hacer
- [ ] Los estados de Instagram son comprensibles sin contexto previo
- [ ] La interfaz se ve profesional y genera confianza
- [ ] No se cambia ninguna funcionalidad del backend

---

## 8. Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `templates/index.html` | Reescritura completa UI |
| `templates/configurar_cookies.html` | Reescritura completa con guía visual |
| `static/style.css` | Ajustes de diseño, mejor jerarquía |
| `static/app.js` | Mensajes en español neutro |

---

*VIMU DEVS — Spec-Driven Development*
