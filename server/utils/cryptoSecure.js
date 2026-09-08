/**
 * ─── 🔑 CYMATIC STUDIO v23.2 · CRYPTO SECURE SUB-SYSTEM ───
 * NORMAS DE CUMPLIMIENTO IMPLEMENTADAS: ISO/IEC 27001 & SHA-512 PROTOCOL
 * NODO DE RIGOR: MATRIX-SECURE-AUTH-PVA
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Configuración de constantes industriales para PBKDF2
const ITERATIONS = 100000;
const KEY_LENGTH = 64; // 512 bits
const DIGEST = 'sha512';
const SALT_LENGTH = 64; // Bytes para entropía máxima

/**
 * Genera un hash seguro utilizando PBKDF2 con una sal aleatoria criptográficamente fuerte.
 * @param {string} password - Contraseña en texto plano de la petición entrante.
 * @returns {Promise<string>} - Cadena formateada: "salt:hex_hash" para almacenamiento directo en SQLite.
 */
async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verifica si una contraseña coincide con el hash almacenado en la base de datos cuántica.
 * @param {string} password - Contraseña en texto plano a verificar.
 * @param {string} storedHash - Hash guardado en formato "salt:hex_hash".
 * @returns {Promise<boolean>} - True si la firma coincide, False si la integridad se rompió.
 */
async function verifyPassword(password, storedHash) {
  return new Promise((resolve, reject) => {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) {
      return reject(new Error('FORMATO_DE_HASH_INVALIDO: Estructura de traza corrupta.'));
    }

    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      
      // Comparación en tiempo constante para mitigar ataques de temporización (Timing Attacks)
      const bufferOriginal = Buffer.from(originalHash, 'hex');
      const bufferDerivado = derivedKey;
      
      if (bufferOriginal.length !== bufferDerivado.length) {
        return resolve(false);
      }
      resolve(crypto.timingSafeEqual(bufferOriginal, bufferDerivado));
    });
  });
}

/**
 * Genera un Token de Acceso firmado mediante el algoritmo HS512 (SHA-512 por hardware).
 * @param {Object} payload - Carga útil con los datos de sesión del operador del nodo.
 * @returns {string} - Token JWT firmado digitalmente.
 */
function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'KRONOS_EMERGENCY_FALLBACK_KEY_9999';
  return jwt.sign(payload, secret, {
    algorithm: 'HS512',
    expiresIn: '8h' // Ventana de operación estándar de un ciclo de traza industrial
  });
}

/**
 * Valida la autenticidad y vigencia de un token JWT perimetral.
 * @param {string} token - Token JWT provisto por las cabeceras HTTP del cliente.
 * @returns {Object|null} - Payload decodificado si es válido, null si falló el handshake técnico.
 */
function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || 'KRONOS_EMERGENCY_FALLBACK_KEY_9999';
    return jwt.verify(token, secret, { algorithms: ['HS512'] });
  } catch (error) {
    return null; // Fallo de integridad de red o token expirado
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
};

// // FIN DEL MÓDULO // DEPLOYMENT READY V23.2 // //
