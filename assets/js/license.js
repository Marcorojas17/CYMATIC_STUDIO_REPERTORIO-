/* ============================================================
   CYMATIC STUDIO · SISTEMA DE LICENCIAS
   ============================================================ */

const LicenseSystem = (function() {
    'use strict';

    // === CONFIGURACIÓN ===
    const CONFIG = {
        PRODUCTO: 'CYMATIC STUDIO',
        VERSION: 'v21.5',
        CLAVE_PUBLICA: 'CYMATIC-PUB-KEY-2026-A4FF808E',
        DEMO_LICENSE: 'DEMO-2026-CYMATIC',
        STORAGE_KEY: 'cymatic_licencia'
    };

    // === FUNCIONES PRIVADAS ===
    function obtenerLicencia() {
        let licencia = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (licencia) return licencia;
        licencia = sessionStorage.getItem(CONFIG.STORAGE_KEY);
        if (licencia) return licencia;
        const urlParams = new URLSearchParams(window.location.search);
        licencia = urlParams.get('licencia');
        if (licencia) {
            localStorage.setItem(CONFIG.STORAGE_KEY, licencia);
            return licencia;
        }
        return null;
    }

    function validarLicencia(clave) {
        if (!clave) return false;
        // Licencia demo (para versiones gratuitas)
        if (clave === CONFIG.DEMO_LICENSE) return true;
        // Licencias reales: comienzan con "CYMATIC-" y tienen al menos 10 caracteres
        if (clave.startsWith('CYMATIC-') && clave.length >= 10) return true;
        return false;
    }

    function mostrarBloqueo(mensaje, version) {
        const producto = `${CONFIG.PRODUCTO} ${version || ''}`;
        document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#020308;color:#ff4d6d;font-family:'Courier New',monospace;padding:20px;text-align:center;">
                <div style="font-size:4rem;margin-bottom:20px;">🔒</div>
                <h1 style="font-size:2rem;margin-bottom:10px;color:#ff4d6d;">${mensaje}</h1>
                <p style="color:#64748b;font-size:1rem;max-width:500px;line-height:1.6;">
                    <strong style="color:#fff;">${producto}</strong><br><br>
                    Este software requiere una licencia válida para funcionar.
                    <br><br>
                    <span style="color:#00ffcc;">Contacta a soporte@cymaticstudio.com</span>
                    <br><br>
                    <button onclick="LicenseSystem.ingresarLicencia()" style="background:linear-gradient(135deg,#00ffcc,#a855f7);color:#000;border:none;padding:12px 32px;border-radius:40px;font-weight:800;cursor:pointer;font-size:1rem;font-family:'Courier New',monospace;margin-top:10px;">
                        🔑 Ingresar clave de licencia
                    </button>
                    <br><br>
                    <a href="../checkout.html" style="color:#00ffcc;font-size:0.9rem;">🛒 Comprar licencia</a>
                    <br><br>
                    <span style="font-size:0.7rem;color:#475569;">Folio: 5204160405358537 · SHA: a4ff808e</span>
                </p>
            </div>
        `;
    }

    // === FUNCIONES PÚBLICAS ===
    function init(version, isDemoVersion = false) {
        const licencia = obtenerLicencia();

        // Si es versión demo y no hay licencia, activar demo automáticamente
        if (isDemoVersion && !licencia) {
            localStorage.setItem(CONFIG.STORAGE_KEY, CONFIG.DEMO_LICENSE);
            console.log('📢 Versión gratuita activada automáticamente.');
            return true;
        }

        if (!licencia || !validarLicencia(licencia)) {
            mostrarBloqueo('⚠️ Licencia no encontrada o inválida', version);
            return false;
        }

        console.log(`✅ Licencia válida para ${CONFIG.PRODUCTO} ${version}`);
        return true;
    }

    function ingresarLicencia() {
        const clave = prompt('🔑 Ingresa tu clave de licencia de CYMATIC STUDIO:');
        if (clave) {
            localStorage.setItem(CONFIG.STORAGE_KEY, clave);
            location.reload();
        }
    }

    function obtenerClaveActual() {
        return obtenerLicencia();
    }

    function esDemo() {
        const clave = obtenerLicencia();
        return clave === CONFIG.DEMO_LICENSE;
    }

    // === EXPORTAR ===
    return {
        init: init,
        ingresarLicencia: ingresarLicencia,
        obtenerClaveActual: obtenerClaveActual,
        esDemo: esDemo,
        CONFIG: CONFIG
    };

})();

// Exponer globalmente para uso en HTML
window.LicenseSystem = LicenseSystem;
