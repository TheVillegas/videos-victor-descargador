/* ========================================
   APP.JS - VIDEOS VICTOR
   ======================================== */

const POLLING_INTERVAL = 1500;
let pollingTimer = null;

function descargar() {
    const url = document.getElementById('url-input').value.trim();
    const btn = document.getElementById('download-btn');

    if (!url) {
        mostrarMensaje('Ingresa el enlace del video para comenzar', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <span>Descargando...</span>
    `;

    fetch('/descargar', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({url})
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            iniciarPolling();
        } else {
            mostrarMensaje(data.error || 'No se pudo iniciar la descarga. Verifica el enlace e intenta nuevamente.', 'error');
            resetBtn();
        }
    })
    .catch(err => {
        mostrarMensaje('Sin conexion. Verifica tu internet e intenta nuevamente.', 'error');
        resetBtn();
    });
}

function iniciarPolling() {
    const progressSection = document.getElementById('progress-section');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const progressPercent = document.getElementById('progress-percent');

    progressSection.classList.remove('hidden');
    progressText.textContent = 'Descargando video...';

    pollingTimer = setInterval(() => {
        fetch('/estado')
        .then(r => r.json())
        .then(data => {
            progressFill.style.width = data.progress + '%';
            progressPercent.textContent = data.progress + '%';
            progressText.textContent = data.message || 'Descargando video...';

            if (data.status === 'done') {
                clearInterval(pollingTimer);
                progressFill.style.width = '100%';
                progressPercent.textContent = '100%';
                mostrarMensaje('Listo. Tu video se guardo en la carpeta Videos Victor.', 'success');
                resetUI();
            } else if (data.status === 'error') {
                clearInterval(pollingTimer);
                mostrarMensaje(data.error || 'Ocurrio un error. Intenta nuevamente.', 'error');
                resetUI();
            }
        })
        .catch(err => {
            clearInterval(pollingTimer);
            mostrarMensaje('Se perdio la conexion con el servidor.', 'error');
            resetUI();
        });
    }, POLLING_INTERVAL);
}

function mostrarMensaje(texto, tipo) {
    const section = document.getElementById('message-section');
    section.classList.remove('hidden', 'success', 'error', 'warning');
    section.classList.add(tipo);

    const iconSuccess = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>';
    const iconError = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    const iconWarning = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

    let icon = '';
    if (tipo === 'success') icon = iconSuccess;
    else if (tipo === 'error') icon = iconError;
    else icon = iconWarning;

    section.innerHTML = icon + '<span>' + texto + '</span>';
}

function resetBtn() {
    const btn = document.getElementById('download-btn');
    btn.disabled = false;
    btn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        <span>Descargar</span>
    `;
}

function resetUI() {
    setTimeout(() => {
        resetBtn();
    }, 2000);

    setTimeout(() => {
        document.getElementById('progress-section').classList.add('hidden');
        document.getElementById('progress-fill').style.width = '0%';
    }, 4000);

    setTimeout(() => {
        document.getElementById('message-section').classList.add('hidden');
    }, 6000);
}

function abrirConfigInstagram() {
    window.location.href = '/configurar-cookies';
}

function verificarCookiesStatus() {
    fetch('/cookies-status')
    .then(r => r.json())
    .then(data => {
        const dot = document.getElementById('ig-status-dot');
        const title = document.getElementById('ig-status-title');
        const desc = document.getElementById('ig-status-desc');
        const btn = document.getElementById('ig-config-btn');

        if (!dot || !title) return;

        dot.classList.remove('green', 'yellow', 'red');

        if (data.configured && data.valid) {
            dot.classList.add('green');
            title.textContent = 'Instagram configurado';
            desc.textContent = 'Listo para descargar Reels';
            btn.textContent = 'Verificado';
            btn.classList.remove('configure');
            btn.classList.add('verify');
            btn.onclick = null;
        } else if (data.configured) {
            dot.classList.add('yellow');
            title.textContent = 'Instagram sin verificar';
            desc.textContent = 'El sessionid puede haber expirado';
            btn.textContent = 'Actualizar';
            btn.classList.add('configure');
            btn.classList.remove('verify');
        } else {
            dot.classList.add('red');
            title.textContent = 'Instagram no configurado';
            desc.textContent = 'Activa Reels para descargar desde Instagram';
            btn.textContent = 'Configurar';
            btn.classList.add('configure');
            btn.classList.remove('verify');
        }
    })
    .catch(() => {});
}

document.addEventListener('DOMContentLoaded', () => {
    verificarCookiesStatus();

    const input = document.getElementById('url-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                descargar();
            }
        });
    }
});
