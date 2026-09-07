// ==========================================================================
// CYMATIC STUDIO v23.1 QUANTUM CORE+ · CONTROLADOR MAESTRO MEJORADO
// ==========================================================================
// MEJORAS (v23.0 → v23.1):
// ✅ Cierre manual de toasts (botón ✕)
// ✅ Persistencia de pestañas activas en localStorage
// ✅ Ocultar cursor al salir de la ventana
// ✅ ARIA roles y aria-live para accesibilidad
// ✅ Evento personalizado 'themeChange' para sincronización
// ✅ Debounce en resize
// ✅ Manejo de errores en CymaticNotify
// ✅ JSDoc en todas las funciones
// ✅ Limpieza de recursos en beforeunload
// ✅ Getter CymaticTheme.get()
// ==========================================================================

/**
 * @fileoverview Controlador principal de CYMATIC STUDIO v23.1.
 * Proporciona gestión de temas, cursor optimizado, notificaciones en cola,
 * navegación por pestañas y modales dinámicos.
 */

(function() {
    'use strict';

    // ============================================================
    // 1. SISTEMA DE TEMAS PERSISTENTES
    // ============================================================

    /**
     * Gestor de temas claro/oscuro con persistencia en localStorage.
     * @namespace CymaticTheme
     */
    window.CymaticTheme = {
        /**
         * Cambia el tema actual y lo persiste en localStorage.
         * @param {string} theme - 'light' o 'dark'
         */
        set: function(theme) {
            const validThemes = ['light', 'dark'];
            if (!validThemes.includes(theme)) {
                console.warn(`Tema inválido: "${theme}". Usando "dark".`);
                theme = 'dark';
            }
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(`theme-${theme}`);
            localStorage.setItem('cymatic-theme', theme);
            // Disparar evento personalizado
            document.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
        },

        /**
         * Alterna entre tema claro y oscuro.
         */
        toggle: function() {
            const current = this.get();
            const next = current === 'light' ? 'dark' : 'light';
            this.set(next);
            if (window.CymaticNotify) {
                window.CymaticNotify.trigger(`Tema cambiado a ${next.toUpperCase()}`, 'info');
            }
        },

        /**
         * Obtiene el tema actual.
         * @returns {string} 'light' o 'dark'
         */
        get: function() {
            if (document.body.classList.contains('theme-light')) return 'light';
            if (document.body.classList.contains('theme-dark')) return 'dark';
            return 'dark'; // default
        },

        /**
         * Inicializa el tema con preferencia guardada o del sistema.
         */
        init: function() {
            const saved = localStorage.getItem('cymatic-theme');
            if (saved && (saved === 'light' || saved === 'dark')) {
                this.set(saved);
                return;
            }
            const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            this.set(prefersLight ? 'light' : 'dark');
            // Escuchar cambios en la preferencia del sistema
            const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('cymatic-theme')) {
                    this.set(e.matches ? 'light' : 'dark');
                }
            });
        }
    };

    // Inicializar tema
    CymaticTheme.init();

    // ============================================================
    // 2. CURSOR PERSONALIZADO CON THROTTLING A 60 FPS
    // ============================================================

    /**
     * Crea el elemento cursor en el DOM si no existe.
     */
    let cursorNode = document.getElementById('q-cursor');
    if (!cursorNode) {
        cursorNode = document.createElement('div');
        cursorNode.className = 'custom-cursor';
        cursorNode.id = 'q-cursor';
        cursorNode.setAttribute('aria-hidden', 'true');
        document.body.appendChild(cursorNode);
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let lastRenderTime = 0;
    let isHovering = false;
    let isClicking = false;
    let cursorFrameId = null;
    const FPS_INTERVAL = 1000 / 60; // 60 FPS
    const LERP_FACTOR = 0.16;

    /**
     * Actualiza la posición del cursor con interpolación y throttling.
     * @param {DOMHighResTimeStamp} timestamp - Tiempo actual de animación.
     */
    function renderCursor(timestamp) {
        const delta = timestamp - lastRenderTime;
        if (delta >= FPS_INTERVAL) {
            lastRenderTime = timestamp - (delta % FPS_INTERVAL);
            cursorX += (mouseX - cursorX) * LERP_FACTOR;
            cursorY += (mouseY - cursorY) * LERP_FACTOR;
            cursorNode.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        }
        cursorFrameId = requestAnimationFrame(renderCursor);
    }

    // --- Eventos de mouse ---
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            isClicking = true;
            cursorNode.classList.add('click');
        }
    }, { passive: true });

    window.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            isClicking = false;
            cursorNode.classList.remove('click');
        }
    }, { passive: true });

    // Ocultar cursor al salir de la ventana
    window.addEventListener('mouseleave', () => {
        cursorNode.style.opacity = '0';
    }, { passive: true });

    window.addEventListener('mouseenter', () => {
        cursorNode.style.opacity = '1';
    }, { passive: true });

    // --- Event Delegation para hover (mejor performance) ---
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('button, a, input, select, textarea, .interactive, .btn-kronos, .tab-btn, .glass-card, [role="button"]');
        if (target) {
            isHovering = true;
            cursorNode.classList.add('hover');
        }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('button, a, input, select, textarea, .interactive, .btn-kronos, .tab-btn, .glass-card, [role="button"]');
        if (target) {
            isHovering = false;
            cursorNode.classList.remove('hover');
        }
    }, { passive: true });

    // Ocultar cursor en móviles
    function updateCursorVisibility() {
        if (window.innerWidth <= 992) {
            cursorNode.style.display = 'none';
        } else {
            cursorNode.style.display = 'block';
        }
    }
    window.addEventListener('resize', updateCursorVisibility, { passive: true });
    updateCursorVisibility();

    // Iniciar loop del cursor
    cursorFrameId = requestAnimationFrame(renderCursor);

    // ============================================================
    // 3. SISTEMA DE NOTIFICACIONES (TOASTS) CON COLA Y CIERRE
    // ============================================================

    /**
     * @namespace CymaticNotify
     * @description Gestor de notificaciones en cola con prioridad y cierre manual.
     */
    window.CymaticNotify = {
        /** @type {Array} Cola de notificaciones pendientes */
        queue: [],
        /** @type {number} Número de toasts visibles actualmente */
        activeCount: 0,
        /** @type {number} Máximo de toasts visibles simultáneamente */
        maxVisible: 4,
        /** @type {boolean} Indica si se está procesando la cola */
        isProcessing: false,

        /**
         * Muestra una notificación toast.
         * @param {string} text - Mensaje a mostrar.
         * @param {string} type - 'info' | 'success' | 'warn' | 'error'
         * @param {number} duration - Duración en ms (por defecto 3500).
         * @param {number} priority - Menor = mayor prioridad (0-10, por defecto 5).
         */
        trigger: function(text, type = 'info', duration = 3500, priority = 5) {
            if (!text || typeof text !== 'string') {
                console.error('CymaticNotify: el mensaje debe ser un string válido.');
                return;
            }
            if (!['info', 'success', 'warn', 'error'].includes(type)) {
                console.warn(`CymaticNotify: tipo "${type}" inválido, usando "info".`);
                type = 'info';
            }
            this.queue.push({ text, type, duration, priority });
            this.queue.sort((a, b) => a.priority - b.priority);
            this.processQueue();
        },

        /**
         * Procesa la cola de notificaciones.
         * @private
         */
        processQueue: function() {
            if (this.isProcessing || this.queue.length === 0 || this.activeCount >= this.maxVisible) {
                return;
            }
            this.isProcessing = true;
            const item = this.queue.shift();
            this.activeCount++;

            const container = document.getElementById('toast-container');
            if (!container) {
                console.error('CymaticNotify: contenedor de toasts no encontrado.');
                this.activeCount--;
                this.isProcessing = false;
                this.processQueue();
                return;
            }

            const toast = document.createElement('div');
            toast.className = `toast ${item.type}`;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'polite');

            const icons = {
                info: 'ℹ️',
                success: '✅',
                warn: '⚠️',
                error: '❌'
            };

            toast.innerHTML = `
                <span class="toast-icon">${icons[item.type] || '📢'}</span>
                <span class="toast-content">${item.text}</span>
                <button class="toast-close" aria-label="Cerrar notificación">✕</button>
            `;

            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => {
                this.closeToast(toast);
            });

            container.appendChild(toast);

            // Auto-cierre
            const timeoutId = setTimeout(() => {
                this.closeToast(toast);
            }, item.duration || 3500);

            toast._timeoutId = timeoutId;

            this.isProcessing = false;
            // Procesar siguiente
            if (this.queue.length > 0 && this.activeCount < this.maxVisible) {
                setTimeout(() => this.processQueue(), 100);
            }
        },

        /**
         * Cierra un toast específico.
         * @param {HTMLElement} toast - Elemento toast a cerrar.
         * @private
         */
        closeToast: function(toast) {
            if (toast._closing) return;
            toast._closing = true;
            if (toast._timeoutId) {
                clearTimeout(toast._timeoutId);
            }
            toast.classList.add('hide');
            toast.addEventListener('animationend', () => {
                if (toast.parentNode) toast.remove();
                this.activeCount = Math.max(0, this.activeCount - 1);
                this.processQueue();
            });
        }
    };

    // Crear contenedor de toasts si no existe
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }

    // ============================================================
    // 4. SISTEMA DE TABS CON PERSISTENCIA
    // ============================================================

    /**
     * @namespace CymaticTabs
     * @description Gestor de pestañas con persistencia en localStorage.
     */
    window.CymaticTabs = {
        /**
         * Inicializa un grupo de pestañas.
         * @param {string} navId - ID del contenedor de navegación.
         * @param {string} contentClass - Clase de los paneles de contenido.
         * @param {string} storageKey - Clave para localStorage (opcional).
         */
        init: function(navId, contentClass, storageKey = 'cymatic-active-tab') {
            const nav = document.getElementById(navId);
            if (!nav) {
                console.warn(`CymaticTabs: contenedor "${navId}" no encontrado.`);
                return;
            }

            const tabs = nav.querySelectorAll('.tab-btn');
            const panels = document.querySelectorAll(`.${contentClass}`);

            if (tabs.length === 0 || panels.length === 0) {
                console.warn(`CymaticTabs: no se encontraron tabs o paneles.`);
                return;
            }

            // Asignar roles ARIA
            nav.setAttribute('role', 'tablist');
            tabs.forEach(tab => {
                tab.setAttribute('role', 'tab');
                const targetId = tab.dataset.tab;
                const panel = document.getElementById(targetId);
                if (panel) {
                    tab.setAttribute('aria-controls', targetId);
                    panel.setAttribute('role', 'tabpanel');
                    panel.setAttribute('aria-labelledby', tab.id || tab.textContent);
                }
            });

            // Restaurar estado guardado
            const savedTab = localStorage.getItem(storageKey);
            if (savedTab) {
                const targetTab = tabs.find(t => t.dataset.tab === savedTab);
                if (targetTab) {
                    this.activateTab(targetTab, panels, storageKey);
                } else {
                    // Si no se encuentra, activar el primero
                    if (tabs[0]) this.activateTab(tabs[0], panels, storageKey);
                }
            } else {
                // Activar el primero por defecto
                if (tabs[0]) this.activateTab(tabs[0], panels, storageKey);
            }

            // Event listeners
            nav.addEventListener('click', (e) => {
                const button = e.target.closest('.tab-btn');
                if (!button || button.disabled) return;
                this.activateTab(button, panels, storageKey);
            });
        },

        /**
         * Activa una pestaña específica.
         * @param {HTMLElement} tab - Elemento botón de la pestaña.
         * @param {NodeList} panels - Lista de paneles de contenido.
         * @param {string} storageKey - Clave para localStorage.
         * @private
         */
        activateTab: function(tab, panels, storageKey) {
            const targetId = tab.dataset.tab;
            const nav = tab.closest('[role="tablist"]');

            // Desactivar todas
            nav.querySelectorAll('.tab-btn').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            panels.forEach(p => {
                p.classList.remove('active');
                p.style.display = 'none';
            });

            // Activar la seleccionada
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const panel = document.getElementById(targetId);
            if (panel) {
                panel.classList.add('active');
                panel.style.display = 'block';
            }

            // Guardar estado
            if (storageKey) {
                localStorage.setItem(storageKey, targetId);
            }

            if (window.CymaticNotify) {
                window.CymaticNotify.trigger(`Panel ${targetId.toUpperCase()} activado`, 'info', 1500);
            }
        }
    };

    // ============================================================
    // 5. SISTEMA DE MODALES
    // ============================================================

    /**
     * @namespace CymaticModal
     * @description Gestor de ventanas modales.
     */
    window.CymaticModal = {
        /**
         * Abre un modal por su ID.
         * @param {string} modalId - ID del modal.
         */
        open: function(modalId) {
            const overlay = document.getElementById(modalId);
            if (!overlay) {
                console.warn(`CymaticModal: modal "${modalId}" no encontrado.`);
                return;
            }
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            const firstInput = overlay.querySelector('input, button, a');
            if (firstInput) firstInput.focus();
        },

        /**
         * Cierra un modal por su ID.
         * @param {string} modalId - ID del modal.
         */
        close: function(modalId) {
            const overlay = document.getElementById(modalId);
            if (!overlay) return;
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        },

        /**
         * Cierra todos los modales abiertos.
         */
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
    }, { passive: true });

    // ============================================================
    // 6. LIMPIEZA DE RECURSOS
    // ============================================================

    /**
     * Limpia recursos al cerrar la página.
     */
    window.addEventListener('beforeunload', function() {
        if (cursorFrameId) {
            cancelAnimationFrame(cursorFrameId);
            cursorFrameId = null;
        }
        // Limpiar cola de toasts
        if (window.CymaticNotify) {
            window.CymaticNotify.queue = [];
            window.CymaticNotify.activeCount = 0;
            window.CymaticNotify.isProcessing = false;
        }
        // Eliminar toasts del DOM
        const container = document.getElementById('toast-container');
        if (container) {
            container.innerHTML = '';
        }
    });

    // ============================================================
    // 7. DEBOUNCE PARA RESIZE
    // ============================================================

    /**
     * Debounce simple para eventos de resize.
     * @param {Function} fn - Función a ejecutar.
     * @param {number} delay - Retraso en ms.
     * @returns {Function} Función con debounce.
     */
    function debounce(fn, delay = 100) {
        let timeoutId = null;
        return function(...args) {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                fn.apply(this, args);
                timeoutId = null;
            }, delay);
        };
    }

    // Aplicar debounce a eventos de resize
    const debouncedResize = debounce(() => {
        updateCursorVisibility();
    }, 150);
    window.addEventListener('resize', debouncedResize, { passive: true });

    // ============================================================
    // 8. CONSOLA DE INICIALIZACIÓN
    // ============================================================

    console.log('✅ CYMATIC STUDIO v23.1 Quantum Core+ cargado.');
    console.log('📦 Módulos disponibles:');
    console.log('  - CymaticTheme (set, toggle, get, init)');
    console.log('  - CymaticNotify (trigger, closeToast)');
    console.log('  - CymaticTabs (init, activateTab)');
    console.log('  - CymaticModal (open, close, closeAll)');
    console.log('🎯 Tema actual:', CymaticTheme.get());

})();
