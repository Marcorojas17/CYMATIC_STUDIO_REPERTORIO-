// ============================================================
//  CURSOR PERSONALIZADO · CYMATIC STUDIO v22.3
//  Controlador de cinemática inversa y efectos elásticos LERP
// ============================================================

(function() {
    'use strict';

    // --- Elementos del DOM ---
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    // --- Estado interno ---
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let isHovering = false;
    let isClicking = false;
    let frameId = null;
    let isVisible = true;

    // --- Configuración ---
    const CONFIG = {
        LERP_SPEED: 0.12,          // Suavidad del movimiento (0.1 - 0.2)
        HOVER_SCALE: 2.3,
        CLICK_SCALE: 0.7,
        HOVER_BORDER: '#ff00cc',
        DEFAULT_BORDER: '#00ffcc',
        HOVER_BG: 'rgba(255, 0, 204, 0.05)',
        DEFAULT_BG: 'rgba(0, 255, 204, 0.02)'
    };

    // --- Funciones de actualización ---
    function updateCursor() {
        if (!cursor) return;

        // Interpolación suave (LERP)
        cursorX += (mouseX - cursorX) * CONFIG.LERP_SPEED;
        cursorY += (mouseY - cursorY) * CONFIG.LERP_SPEED;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        // Actualizar estados visuales
        if (isClicking) {
            cursor.classList.add('click');
        } else {
            cursor.classList.remove('click');
        }

        if (isHovering) {
            cursor.classList.add('hover');
        } else {
            cursor.classList.remove('hover');
        }

        // Ocultar cursor si está fuera de la ventana
        const isOutOfBounds =
            cursorX < -10 || cursorX > window.innerWidth + 10 ||
            cursorY < -10 || cursorY > window.innerHeight + 10;

        if (isOutOfBounds && isVisible) {
            cursor.style.opacity = '0';
            isVisible = false;
        } else if (!isOutOfBounds && !isVisible) {
            cursor.style.opacity = '1';
            isVisible = true;
        }

        frameId = requestAnimationFrame(updateCursor);
    }

    // --- Event listeners ---
    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function handleMouseEnter() {
        cursor.style.opacity = '1';
        isVisible = true;
    }

    function handleMouseLeave() {
        cursor.style.opacity = '0';
        isVisible = false;
    }

    function handleMouseDown(e) {
        if (e.button === 0) { // Solo clic izquierdo
            isClicking = true;
            // Podríamos añadir un pequeño retardo para simular el rebote
        }
    }

    function handleMouseUp(e) {
        if (e.button === 0) {
            isClicking = false;
        }
    }

    // --- Detección de elementos interactivos (hover) ---
    function setupHoverDetection() {
        const interactiveElements = document.querySelectorAll(
            'button, a, input, select, textarea, .interactive, .btn-kronos, .tab, .glass-card, [role="button"]'
        );

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                isHovering = true;
            });
            el.addEventListener('mouseleave', () => {
                isHovering = false;
            });
        });

        // También detectar cambios dinámicos en el DOM
        const observer = new MutationObserver(() => {
            const newElements = document.querySelectorAll(
                'button, a, input, select, textarea, .interactive, .btn-kronos, .tab, .glass-card, [role="button"]'
            );
            newElements.forEach(el => {
                if (!el._cursorListener) {
                    el.addEventListener('mouseenter', () => { isHovering = true; });
                    el.addEventListener('mouseleave', () => { isHovering = false; });
                    el._cursorListener = true;
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // --- Redimensionamiento ---
    function handleResize() {
        // No es necesario hacer nada especial, pero se podría ajustar el límite
    }

    // --- Inicialización ---
    function init() {
        // Escuchar eventos de mouse
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        // Detección de hover en elementos interactivos
        setupHoverDetection();

        // Redimensionamiento
        window.addEventListener('resize', handleResize);

        // Iniciar bucle de animación
        updateCursor();

        // Si el cursor se oculta al salir de la ventana, volver a mostrarlo al entrar
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            isVisible = true;
        });

        // Limpiar al recargar o salir
        window.addEventListener('beforeunload', () => {
            if (frameId) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
        });

        console.log('✅ Cursor personalizado inicializado');
    }

    // --- Iniciar cuando el DOM esté listo ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
