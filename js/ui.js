// FUNCIONES DE NOTIFICACIONES CON TOASTIFY
/**
 * Muestra una notificación de éxito
 * @param {string} mensaje - Texto a mostrar
 */
function mostrarExito(mensaje) {
    Toastify({
        text: mensaje,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
        },
        stopOnFocus: true
    }).showToast();
}

/**
 * Muestra una notificación de error
 * @param {string} mensaje - Texto a mostrar
 */
function mostrarError(mensaje) {
    Toastify({
        text: mensaje,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
        },
        stopOnFocus: true
    }).showToast();
}

/**
 * Muestra una notificación informativa
 * @param {string} mensaje - Texto a mostrar
 */
function mostrarInfo(mensaje) {
    Toastify({
        text: mensaje,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
        },
        stopOnFocus: true
    }).showToast();
}

/**
 * Muestra una notificación de advertencia
 * @param {string} mensaje - Texto a mostrar
 */
function mostrarAdvertencia(mensaje) {
    Toastify({
        text: mensaje,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
        },
        stopOnFocus: true
    }).showToast();
}