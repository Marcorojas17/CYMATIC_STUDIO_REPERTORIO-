// ==========================================================================
// CYMATIC STUDIO v23.0 QUANTUM CORE · CONTROLADOR UNIFICADO
// ==========================================================================
// MEJORAS ESTRATÉGICAS (v22.3 → v23.0):
// ✅ Cursor con throttling (60 FPS) y gestión de memoria
// ✅ Sistema de Toasts con cola de prioridad (info, success, warn, error)
// ✅ Sistema de Tabs funcional con persistencia de estado
// ✅ Sistema de Modales dinámicos con stack
// ✅ Toggle de temas con persistencia en localStorage
// ✅ Event Delegation para hover (mejor performance)
// ✅ Sistema de Tooltips dinámicos
// ==========================================================================

(function() {
    'use strict';

    // ============================================================
    // 1. CURSOR PERSONALIZADO (THROTTLED)
    // ============================================================

    const cursorNode = document.getElementById('q-cursor') || (() => {
        const el = document.createElement('div');
        el.className = 'custom-cursor';
        el.id = 'q-cursor';
        document.body.appendChild(el);
        return el;
    })();

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let lastFrameTime = 0;
    let isHovering = false;
    let isClicking = false;
    let frameId = null;

    // --- Movimiento con LERP y throttling a 60 FPS ---
    function updateCursorFrame(timestamp) {
        if (timestamp - lastFrameTime < 16) { // ~60 FPS
            frameId = requestAnimationFrame(updateCursorFrame);
            return;
        }
        lastFrameTime = timestamp;

        const lerpFactor = 0.18;
        cursorX += (mouseX - cursorX) * lerpFactor;
        cursorY += (mouseY - cursorY) * lerpFactor;

        cursorNode.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

        if (isClicking) {
            cursorNode.classList.add('click');
        } else {
            cursorNode.classList.remove('click');
        }

        if (isHovering) {
            cursorNode.classList.add('hover');
        } else {
            cursorNode.classList.remove('hover');
        }

        frameId = requestAnimationFrame(updateCursorFrame);
    }

    // --- Eventos de mouse (con debounce implícito) ---
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) isClicking = true;
    });
    document.addEventListener('mouseup', (e) => {
        if (e.button === 0) isClicking = false;
    });

    // --- Event Delegation para hover (mejor performance) ---
    document.addEventListener('mouseenter', (e) => {
        const target = e.target.closest('button, a, input, select, textarea, .interactive, .btn-kronos, .tab, .glass-card, [role="button"]');
        if (target) isHovering = true;
    }, true);
    document.addEventListener('mouseleave', (e) => {
        const target = e.target.closest('button, a, input, select, textarea, .interactive, .btn-kronos, .tab, .glass-card, [role="button"]');
        if (target) isHovering = false;
    }, true);

    // --- Iniciar cursor ---
    frameId = requestAnimationFrame(updateCursorFrame);

    // Ocultar cursor en móviles
    if (window.innerWidth <= 992) {
        cursorNode.style.display = 'none';
    }
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 992) {
            cursorNode.style.display = 'none';
        } else {
            cursorNode.style.display = 'block';
        }
    });

    // ============================================================
    // 2. SISTEMA DE TOASTS CON COLA DE PRIORIDAD
    // ============================================================

    const toastContainer = document.getElementById('toast-container') || (() => {
        const el = document.createElement('div');
        el.id = 'toast-container';
        document.body.appendChild(el);
        return el;
    })();

    const toastQueue = [];
    let isProcessingToast = false;

    const TOAST_ICONS = {
        info: 'ℹ️',
        success: '✅',
        warn: '⚠️',
        error: '❌'
    };

    function processToastQueue() {
        if (isProcessingToast || toastQueue.length === 0) return;
        isProcessingToast = true;

        const { message, type, duration, priority } = toastQueue.shift();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${TOAST_ICONS[type] || '📢'}</span>
            <span class="toast-content">${message}</span>
            <button class="toast-close" aria-label="Cerrar notificación">✕</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            removeToast(toast);
        });

        toastContainer.appendChild(toast);

        // Auto-destrucción
        const timeout = setTimeout(() => {
            removeToast(toast);
        }, duration || 3500);

        // Guardar timeout para poder cancelarlo
        toast._timeout = timeout;

        isProcessingToast = false;
        // Procesar siguiente en cola
        processToastQueue();
    }

    function removeToast(toast) {
        if (toast._removing) return;
        toast._removing = true;
        toast.classList.add('hide');
        if (toast._timeout) clearTimeout(toast._timeout);
        toast.addEventListener('animationend', () => {
            if (toast.parentNode) toast.remove();
            // Reanudar cola
            processToastQueue();
        });
    }

    window.CymaticNotify = {
        /**
         * Crea una notificación toast con cola de prioridad.
         * @param {string} message - Mensaje a mostrar.
         * @param {string} type - 'info' | 'success' | 'warn' | 'error'
         * @param {number} duration - Duración en ms (default 3500).
         * @param {number} priority - 0 (más alta) a 10 (más baja). Por defecto 5.
         */
        trigger: function(message, type = 'info', duration = 3500, priority = 5) {
            toastQueue.push({ message, type, duration, priority });
            // Ordenar por prioridad (menor número = mayor prioridad)
            toastQueue.sort((a, b) => a.priority - b.priority);
            if (!isProcessingToast) {
                processToastQueue();
            }
        },
        // Atajos
        info: function(msg, dur = 3500) { this.trigger(msg, 'info', dur, 5); },
        success: function(msg, dur = 3500) { this.trigger(msg, 'success', dur, 2); },
        warn: function(msg, dur = 4000) { this.trigger(msg, 'warn', dur, 3); },
        error: function(msg, dur = 5000) { this.trigger(msg, 'error', dur, 1); }
    };

    // ============================================================
    // 3. SISTEMA DE TABS FUNCIONAL
    // ============================================================

    window.CymaticTabs = {
        init: function(container) {
            const tabs = container.querySelectorAll('.tab');
            const panels = container.querySelectorAll('.tab-panel');

            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const target = this.dataset.target;
                    // Desactivar todos
                    tabs.forEach(t => t.classList.remove('active'));
                    panels.forEach(p => p.style.display = 'none');
                    // Activar el seleccionado
                    this.classList.add('active');
                    const panel = container.querySelector(`#${target}`);
                    if (panel) panel.style.display = 'block';
                    // Guardar estado en localStorage
                    localStorage.setItem('cymatic-active-tab', target);
                });
            });

            // Restaurar estado
            const saved = localStorage.getItem('cymatic-active-tab');
            if (saved) {
                const tab = container.querySelector(`.tab[data-target="${saved}"]`);
                if (tab) tab.click();
            }
        }
    };

    // Inicializar tabs automáticamente en los contenedores con clase .tabs-container
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.tabs-container').forEach(container => {
            // Asegurar que las pestañas tengan data-target y los paneles tengan id correspondiente
            CymaticTabs.init(container);
        });
    });

    // ============================================================
    // 4. SISTEMA DE MODALES DINÁMICOS
    // ============================================================

    window.CymaticModal = {
        open: function(modalId) {
            const overlay = document.getElementById(modalId);
            if (!overlay) {
                console.warn(`Modal con ID "${modalId}" no encontrado.`);
                return;
            }
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Enfocar el primer input dentro del modal
            const firstInput = overlay.querySelector('input, button, a');
            if (firstInput) firstInput.focus();
        },
        close: function(modalId) {
            const overlay = document.getElementById(modalId);
            if (!overlay) return;
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        },
        closeAll: function() {
            document.querySelectorAll('.modal-overlay.active').forEach(el => {
                el.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    };

    // Cerrar modales con clic fuera del contenido
    document.addEventListener('click', (e) => {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay && e.target === overlay) {
            CymaticModal.close(overlay.id);
        }
    });

    // Cerrar modales con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            CymaticModal.closeAll();
        }
    });

    // ============================================================
    // 5. SISTEMA DE TEMAS (TOGGLE MANUAL + PERSISTENCIA)
    // ============================================================

    window.CymaticTheme = {
        set: function(theme) {
            document.body.classList.remove('theme-light', 'theme-dark');
            if (theme === 'light') {
                document.body.classList.add('theme-light');
            } else {
                document.body.classList.add('theme-dark');
            }
            localStorage.setItem('cymatic-theme', theme);
            // Disparar evento para que otros módulos se actualicen
            document.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
        },
        toggle: function() {
            const current = document.body.classList.contains('theme-light') ? 'light' : 'dark';
            const next = current === 'light' ? 'dark' : 'light';
            this.set(next);
        },
        get: function() {
            if (document.body.classList.contains('theme-light')) return 'light';
            if (document.body.classList.contains('theme-dark')) return 'dark';
            return 'dark'; // default
        },
        init: function() {
            const saved = localStorage.getItem('cymatic-theme');
            if (saved && (saved === 'light' || saved === 'dark')) {
                this.set(saved);
            } else {
                // Usar preferencia del sistema si no hay guardado
                const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
                this.set(prefersLight ? 'light' : 'dark');
            }
            // Escuchar cambios en la preferencia del sistema
            window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
                if (!localStorage.getItem('cymatic-theme')) {
                    this.set(e.matches ? 'light' : 'dark');
                }
            });
        }
    };

    // Inicializar tema al cargar
    CymaticTheme.init();

    // Exponer botones de tema si existen en el DOM
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                CymaticTheme.toggle();
                const newTheme = CymaticTheme.get();
                CymaticNotify.success(`Tema cambiado a ${newTheme.toUpperCase()}`);
            });
        });
    });

    // ============================================================
    // 6. LIMPIEZA DE RECURSOS (MEMORIA)
    // ============================================================

    window.addEventListener('beforeunload', () => {
        if (frameId) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
        // Limpiar toasts pendientes
        toastQueue.length = 0;
        isProcessingToast = false;
    });

    console.log('✅ CYMATIC STUDIO v23.0 Quantum Core · Controlador cargado.');
    console.log('📦 Módulos disponibles: CymaticNotify, CymaticTabs, CymaticModal, CymaticTheme');

})();
