/* ========================================
   APP.JS - VIDEOS VICTOR
   ======================================== */

const POLLING_INTERVAL = 1500;
let pollingTimer = null;

function descargar() {
    const url = document.getElementById('url-input').value.trim();
    const btn = document.getElementById('download-btn');
    
    if (!url) {
        mostrarMensaje('Po, tienes que poner un link weón', 'error');
        return;
    }
    
    btn.disabled = true;
    btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <span>Bajando...</span>
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
            mostrarMensaje('❌ ' + data.error, 'error');
            resetBtn();
        }
    })
    .catch(err => {
        mostrarMensaje('❌alhuea, no hay conexión. Verifica tu internet.', 'error');
        resetBtn();
    });
}

function iniciarPolling() {
    const progressSection = document.getElementById('progress-section');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const progressPercent = document.getElementById('progress-percent');
    
    progressSection.classList.remove('hidden');
    progressText.textContent = 'Bajando video...';
    
    pollingTimer = setInterval(() => {
        fetch('/estado')
        .then(r => r.json())
        .then(data => {
            progressFill.style.width = data.progress + '%';
            progressPercent.textContent = data.progress + '%';
            progressText.textContent = data.message || 'Bajando video...';
            
            if (data.status === 'done') {
                clearInterval(pollingTimer);
                progressFill.style.width = '100%';
                progressPercent.textContent = '100%';
                mostrarMensaje('✅ ¡Listo po! El video está en "Videos Victor"', 'success');
                resetUI();
            } else if (data.status === 'error') {
                clearInterval(pollingTimer);
                mostrarMensaje('❌ ' + (data.error || 'Algo salió mal weón'), 'error');
                resetUI();
            }
        })
        .catch(err => {
            clearInterval(pollingTimer);
            mostrarMensaje('❌ Se perdió la conexión', 'error');
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
        const statusEl = document.getElementById('cookies-status');
        if (statusEl) {
            if (data.configured && data.valid) {
                statusEl.textContent = '✅ Instagram listo';
                statusEl.classList.add('configured');
            } else if (data.configured) {
                statusEl.textContent = '⚠️ Cookies pedidas';
                statusEl.style.color = '#FBBF24';
            } else {
                statusEl.textContent = 'No cacho Instagram';
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