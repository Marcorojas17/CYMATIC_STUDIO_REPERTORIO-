/* ============================================================
   CYMATIC STUDIO · SISTEMA DE PAGOS
   ============================================================ */

const PaymentSystem = (function() {
    'use strict';

    // === CONFIGURACIÓN ===
    const CONFIG = {
        CLABE: '0024 3870 1524 0664 73',
        CLABE_SIN_ESPACIOS: '002438701524066473',
        BANCO: 'BBVA México',
        CORREOS: ['marco.a.rojas.v@hotmail.com', 'proyectokronos@hotmail.com'],
        WHATSAPP: '+52 722 586 2335',
        WHATSAPP_LINK: 'https://wa.me/527225862335'
    };

    // === FUNCIONES PÚBLICAS ===

    /**
     * Copia la CLABE al portapapeles
     */
    function copiarCLABE() {
        const clabe = CONFIG.CLABE.replace(/\s/g, '');
        navigator.clipboard.writeText(clabe).then(() => {
            const btn = document.querySelector('.btn-copy-clabe');
            if (btn) {
                const original = btn.textContent;
                btn.textContent = '✅ ¡Copiado!';
                setTimeout(() => { btn.textContent = original; }, 3000);
            }
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = clabe;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            const btn = document.querySelector('.btn-copy-clabe');
            if (btn) {
                const original = btn.textContent;
                btn.textContent = '✅ ¡Copiado!';
                setTimeout(() => { btn.textContent = original; }, 3000);
            }
        });
    }

    /**
     * Obtiene la CLABE formateada
     */
    function getCLABE() {
        return CONFIG.CLABE;
    }

    /**
     * Obtiene la CLABE sin espacios
     */
    function getCLABESinEspacios() {
        return CONFIG.CLABE_SIN_ESPACIOS;
    }

    /**
     * Genera un número de referencia de pago (simulado)
     */
    function generarReferencia(version, email) {
        const timestamp = Date.now().toString().slice(-6);
        const versionCode = version.replace('v', '').replace('.', '');
        const emailHash = email ? email.slice(0, 4).toUpperCase() : 'XXXX';
        return `CYM-${versionCode}-${emailHash}-${timestamp}`;
    }

    /**
     * Valida que el archivo de comprobante sea válido
     */
    function validarComprobante(file) {
        if (!file) return { valido: false, mensaje: 'No se seleccionó ningún archivo.' };
        const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf'];
        if (!tiposPermitidos.includes(file.type)) {
            return { valido: false, mensaje: 'Formato no permitido. Usa PNG, JPG o PDF.' };
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            return { valido: false, mensaje: 'El archivo es demasiado grande (máx. 5MB).' };
        }
        return { valido: true, mensaje: 'Archivo válido.' };
    }

    /**
     * Obtiene los correos de contacto
     */
    function getCorreos() {
        return CONFIG.CORREOS;
    }

    /**
     * Obtiene el enlace de WhatsApp
     */
    function getWhatsApp() {
        return CONFIG.WHATSAPP_LINK;
    }

    /**
     * Obtiene el número de WhatsApp formateado
     */
    function getWhatsAppNumero() {
        return CONFIG.WHATSAPP;
    }

    /**
     * Abre WhatsApp con un mensaje predefinido
     */
    function abrirWhatsApp(mensaje) {
        const msg = mensaje || 'Hola CYMATIC STUDIO, quiero información sobre las licencias.';
        const url = `${CONFIG.WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    }

    // === EXPORTAR ===
    return {
        copiarCLABE: copiarCLABE,
        getCLABE: getCLABE,
        getCLABESinEspacios: getCLABESinEspacios,
        generarReferencia: generarReferencia,
        validarComprobante: validarComprobante,
        getCorreos: getCorreos,
        getWhatsApp: getWhatsApp,
        getWhatsAppNumero: getWhatsAppNumero,
        abrirWhatsApp: abrirWhatsApp,
        CONFIG: CONFIG
    };

})();

// Exponer globalmente para uso en HTML
window.PaymentSystem = PaymentSystem;
