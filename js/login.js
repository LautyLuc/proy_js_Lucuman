// ============================================
// GESTIÓN DE USUARIOS CON localStorage
// ============================================

/**
 * Guarda el nombre de usuario actual en localStorage
 * Usa la clave "usuarioActual"
 */
function guardarUsuarioActual(nombreUsuario) {
    localStorage.setItem('usuarioActual', nombreUsuario);
}

/**
 * Obtiene el nombre del usuario logueado actualmente
 * Devuelve null si no hay usuario logueado
 */
function obtenerUsuarioActual() {
    return localStorage.getItem('usuarioActual');
}

/**
 * Cierra la sesión del usuario actual
 * Guarda el carrito antes de salir (si no es invitado)
 * Limpia el localStorage y redirige a login
 */
function cerrarSesion() {
    const usuario = obtenerUsuarioActual();
    
    if (usuario) {
        // Guardo el carrito antes de cerrar sesión
        guardarCarrito();
        
        mostrarInfo(`👋 Hasta pronto, ${usuario}!`);
    }
    
    // Elimino el usuario del localStorage
    localStorage.removeItem('usuarioActual');
    
    // Limpio el carrito en memoria
    carrito = [];
    
    // Actualizo el contador a 0
    actualizarContadorCarrito();
    
    // Después de medio segundo, vuelvo a login
    setTimeout(() => {
        window.location.hash = '#login';
    }, 500);
}

/**
 * Verifica si hay un usuario logueado
 * Si no hay usuario y se intenta acceder a una ruta protegida, redirige a login
 */
function verificarSesion() {
    const usuario = obtenerUsuarioActual();
    
    // Si no hay usuario y no estoy en login, redirige
    if (!usuario && window.location.hash !== '#login') {
        mostrarAdvertencia('⚠️ Debes iniciar sesión');
        window.location.hash = '#login';
        return false;
    }
    
    return true;
}

/**
 * Maneja el evento de submit del formulario de login
 * Valida el usuario y lo guarda en localStorage
 */
function manejarLogin(evento) {
    evento.preventDefault();
    
    const nombreUsuario = document.getElementById('username').value;
    
    // Valido que el campo no esté vacío
    if (nombreUsuario.trim() === '') {
        mostrarError('❌ Por favor ingresa un usuario');
        return;
    }
    
    // Guardo el usuario
    guardarUsuarioActual(nombreUsuario);
    
    mostrarExito(`✅ Bienvenido, ${nombreUsuario}! 🍺`);
    
    // Después de 1 segundo, voy a home
    setTimeout(() => {
        window.location.hash = '#home';
    }, 1000);
}

/**
 * Permite continuar sin crear una cuenta
 * El carrito del invitado NO se guardará al cerrar el navegador
 */
function continuarComoInvitado() {
    guardarUsuarioActual('Invitado');
    
    mostrarInfo('ℹ️ Continuando como invitado (los cambios no se guardarán)');
    
    // Después de 800ms, voy a home
    setTimeout(() => {
        window.location.hash = '#home';
    }, 800);
}

// Escucho el submit del formulario de login
document.addEventListener('submit', (evento) => {
    if (evento.target && evento.target.id === 'login-form') {
        manejarLogin(evento);
    }
});

// Escucho los clicks en los botones
document.addEventListener('click', (evento) => {
    // Botón "Continuar como Invitado"
    if (evento.target && evento.target.id === 'invitado') {
        continuarComoInvitado();
    }
    
    // Botón "Cerrar Sesión" (en el header)
    if (evento.target && evento.target.id === 'cerrar-sesion') {
        cerrarSesion();
    }
});
