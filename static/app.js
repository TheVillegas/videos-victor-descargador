const POLLING_INTERVAL = 2000;
let pollingTimer = null;

function descargar() {
    const url = document.getElementById('url-input').value.trim();
    const btn = document.getElementById('download-btn');
    
    if (!url) {
        mostrarMensaje('Por favor, ingresa una URL', 'error');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Descargando...';
    
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
            mostrarMensaje(data.error, 'error');
            btn.disabled = false;
            btn.textContent = '⬇ Descargar Video';
        }
    })
    .catch(err => {
        mostrarMensaje('Error de conexión. Verificá tu internet.', 'error');
        btn.disabled = false;
        btn.textContent = '⬇ Descargar Video';
    });
}

function iniciarPolling() {
    const progressSection = document.getElementById('progress-section');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    progressSection.classList.remove('hidden');
    progressText.textContent = 'Iniciando descarga...';
    
    pollingTimer = setInterval(() => {
        fetch('/estado')
        .then(r => r.json())
        .then(data => {
            progressFill.style.width = data.progress + '%';
            progressText.textContent = data.message || 'Descargando...';
            
            if (data.status === 'done') {
                clearInterval(pollingTimer);
                mostrarMensaje('✓ Descarga completada! El video está en la carpeta "Videos Victor"', 'success');
                resetUI();
            } else if (data.status === 'error') {
                clearInterval(pollingTimer);
                mostrarMensaje('✗ ' + (data.error || 'Error en la descarga'), 'error');
                resetUI();
            }
        })
        .catch(err => {
            clearInterval(pollingTimer);
            mostrarMensaje('Error al verificar estado', 'error');
            resetUI();
        });
    }, POLLING_INTERVAL);
}

function mostrarMensaje(texto, tipo) {
    const section = document.getElementById('message-section');
    const text = document.getElementById('message-text');
    section.classList.remove('hidden', 'success', 'error');
    section.classList.add(tipo);
    text.textContent = texto;
}

function resetUI() {
    const btn = document.getElementById('download-btn');
    btn.disabled = false;
    btn.textContent = '⬇ Descargar Video';
    
    setTimeout(() => {
        document.getElementById('progress-section').classList.add('hidden');
        document.getElementById('progress-fill').style.width = '0%';
    }, 5000);
    
    setTimeout(() => {
        document.getElementById('message-section').classList.add('hidden');
    }, 8000);
}

function abrirConfigInstagram() {
    window.location.href = '/configurar-cookies';
}

function verificarCookiesStatus() {
    fetch('/cookies-status')
    .then(r => r.json())
    .then(data => {
        const statusEl = document.getElementById('cookies-status');
        if (statusEl) {
            if (data.configured && data.valid) {
                statusEl.textContent = '✓ Instagram configurado';
                statusEl.style.color = '#059669';
            } else if (data.configured) {
                statusEl.textContent = '⚠ Cookies inválidas';
                statusEl.style.color = '#F59E0B';
            } else {
                statusEl.textContent = 'No configurado';
                statusEl.style.color = '#6B7280';
            }
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