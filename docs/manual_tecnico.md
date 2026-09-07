# CYMATIC STUDIO · Manual Técnico
## Documentación para Desarrolladores y Personalización

---

### 📋 Visión General

CYMATIC STUDIO es un motor de visualización musical interactivo construido sobre tecnologías web modernas. Está diseñado para ser **autocontenido** (single HTML file) y **portable** (funciona sin servidor).

---

### 🏗️ Arquitectura Técnica
┌─────────────────────────────────────────────────────────────┐
│ CYMATIC STUDIO ENGINE │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────────┐ │
│ │ Renderer 3D │ │ Web Audio API │ │
│ │ (Three.js) │◄───│ (Sintetizador + Micrófono) │ │
│ └─────────────────┘ └─────────────────────────────────┘ │
│ │ │ │
│ ▼ ▼ │
│ ┌─────────────────┐ ┌─────────────────────────────────┐ │
│ │ Shaders GLSL │ │ Analizador FFT │ │
│ │ (Vertex/Frag) │ │ (Espectro de frecuencia) │ │
│ └─────────────────┘ └─────────────────────────────────┘ │
│ │ │ │
│ ▼ ▼ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Canvas 2D (Capa de interfaz superpuesta) │ │
│ │ (HUD, controles, logs) │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

---

### 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Uso |
| :--- | :--- | :--- |
| **Three.js** | r128 | Renderizado 3D y shaders |
| **Web Audio API** | Nativa | Sintetizador, micrófono, FFT |
| **Google Translate** | Widget | Traducción multilenguaje |
| **IndexedDB** | Nativa | Persistencia de logs y presets |
| **MediaRecorder API** | Nativa | Grabación de video |
| **Canvas 2D** | Nativa | Interfaz y efectos de Bloom |

---

### 📂 Estructura del Código

```javascript
// ============================================================
// 1. CONFIGURACIÓN Y ESTADO GLOBAL
// ============================================================
let modoDimension = 1;
let audioContext, analyser, dataArray;

// ============================================================
// 2. SISTEMA DE LICENCIA
// ============================================================
// license.js – Verifica la clave antes de ejecutar el motor

// ============================================================
// 3. MOTOR DE AUDIO
// ============================================================
// initAudio() – Inicializa Web Audio API
// activarMicrofono() – Captura micrófono
// activarSintetizador() – Genera notas armónicas

// ============================================================
// 4. MOTOR GRÁFICO (Three.js + Shaders)
// ============================================================
// scene, camera, renderer
// customUniforms – Parámetros de shaders (uTime, uAudio, etc.)

// ============================================================
// 5. GENERACIÓN DE GEOMETRÍAS
// ============================================================
// 5 dimensiones: Chladni, Toroide, Metatrón, Flor de la Vida, Merkaba

// ============================================================
// 6. POST-PROCESADO (Bloom)
// ============================================================
// EffectComposer + UnrealBloomPass

// ============================================================
// 7. INTERACCIÓN Y CONTROLES
// ============================================================
// Mouse, teclado, sliders, botones

// ============================================================
// 8. BUCLE DE ANIMACIÓN
// ============================================================
// requestAnimationFrame – Renderizado en tiempo real
🔧 Personalización para Marca Blanca
Cambiar el nombre del producto
Busca todas las ocurrencias de CYMATIC STUDIO en el archivo HTML.

Reemplázalo por tu nombre de marca.

Actualiza el logo en el CSS.

Cambiar colores
En el archivo :root (CSS), modifica:
:root {
    --accent-cyan: #00ffcc;   ← Cambia aquí
    --accent-purple: #a855f7; ← Cambia aquí
    --accent-magenta: #ff00cc;← Cambia aquí
}
Añadir nuevos modos de geometría
Agrega un nuevo target en la generación de partículas.

Añade un nuevo if (uDimension == 6.0) en el vertex shader.

Agrega un botón en el selector de modos.

🧪 Depuración y Testing
Consola del navegador:
→ Abre DevTools (F12) y revisa la consola para ver logs.

Modo de depuración:
→ Agrega ?debug=true a la URL para logs detallados.

Testing de licencia:
→ Usa la clave DEMO-2026-CYMATIC para pruebas.

📤 Exportación de Medios
Captura de pantalla (PNG)
function capturarFoto() {
    composer.render();
    const link = document.createElement('a');
    link.download = `captura_${Date.now()}.png`;
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
}
Grabación de video (WebM)
function alternarGrabacionVideo() {
    const stream = canvas.captureStream(60);
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    // ... manejo de chunks y descarga
}
🔐 Seguridad y Licencia
El sistema de licencias verifica que la clave:

Comience con CYMATIC-.

Tenga al menos 10 caracteres.

Sea almacenada en localStorage para persistencia.

Las claves se validan localmente; no se envían a ningún servidor.

📞 Soporte Técnico
Correo: marco.a.rojas.v@hotmail.com

Correo alternativo: proyectokronos@hotmail.com

WhatsApp: +52 722 586 2335

© 2026 CYMATIC STUDIO – Manual Técnico v1.0


### 📄 **4. LICENSE.txt – Licencia de Uso**

```text
LICENCIA DE USO – CYMATIC STUDIO
================================

Versión: 1.0
Fecha: 2026
Propietario: CYMATIC STUDIO
Folio: 5204160405358537
SHA: a4ff808e

---

1. CONCESIÓN DE LICENCIA
   Se concede al usuario una licencia no exclusiva, intransferible y perpetua
   para utilizar el software CYMATIC STUDIO en la versión adquirida,
   de acuerdo con los términos y condiciones establecidos en este documento.

2. TIPOS DE LICENCIA

   2.1. PERSONAL (v1.0 – Gratuita)
        - Uso no comercial.
        - Hasta 2 dispositivos.
        - No incluye soporte prioritario.
        - Incluye actualizaciones de seguridad.

   2.2. PRO (v3.0 – v8.0)
        - Uso comercial en hasta 2 proyectos.
        - Hasta 2 dispositivos.
        - Incluye soporte por correo (48 horas).
        - Actualizaciones durante 1 año.

   2.3. ULTRA (v15.0 – v18.0)
        - Uso comercial ilimitado.
        - Hasta 3 dispositivos.
        - Incluye soporte prioritario (12 horas).
        - Actualizaciones durante 2 años.
        - Marca blanca básica (cambio de colores y logo).

   2.4. ENTERPRISE (v21.5)
        - Uso comercial ilimitado.
        - Dispositivos ilimitados en la organización.
        - Soporte 24/7 vía WhatsApp y correo.
        - Actualizaciones vitalicias.
        - Marca blanca completa (nombre, logo, colores, diseño).
        - Código fuente incluido.

3. RESTRICCIONES
   - No está permitida la redistribución del código fuente sin autorización expresa del propietario.
   - No está permitida la ingeniería inversa, descompilación o desensamblaje.
   - No está permitido el uso comercial sin la licencia correspondiente (PRO, ULTRA o ENTERPRISE).
   - La licencia es intransferible a terceros sin consentimiento escrito del propietario.

4. PROPIEDAD INTELECTUAL
   Todo el código, diseño, interfaz de usuario, algoritmos y contenido visual
   son propiedad exclusiva de CYMATIC STUDIO.
   Queda prohibida la copia, modificación o distribución sin autorización.

5. GARANTÍA
   El software se proporciona "tal cual", sin garantía de ningún tipo,
   expresa o implícita. El propietario no se hace responsable de daños
   directos, indirectos, incidentales o consecuentes derivados del uso del software.

6. DEVOLUCIONES
   Se ofrece una garantía de devolución de 30 días a partir de la fecha de compra,
   siempre que el producto no funcione como se describe en la documentación.
   Para solicitar un reembolso, contacta a: marco.a.rojas.v@hotmail.com

7. ACTUALIZACIONES
   Las actualizaciones incluidas en cada plan son acumulativas y se entregan
   a través del enlace de descarga original. No se incluyen versiones mayores
   (ej. v8.0 → v15.0) sin la compra de una nueva licencia.

8. SOPORTE
   El soporte se proporciona por correo electrónico y WhatsApp, según el plan adquirido.
   Tiempos de respuesta:
   - PRO: 48 horas
   - ULTRA: 12 horas
   - ENTERPRISE: 24/7 (respuesta en 2 horas)

9. CONTACTO
   Para consultas sobre licencias:
   📧 marco.a.rojas.v@hotmail.com
   📧 proyectokronos@hotmail.com
   📱 +52 722 586 2335 (WhatsApp)

10. ACEPTACIÓN
    Al utilizar el software, el usuario acepta automáticamente todos los términos
    y condiciones establecidos en esta licencia.

---

© 2026 CYMATIC STUDIO. Todos los derechos reservados.
Folio: 5204160405358537 · SHA: a4ff808e
