const rutas = {

    '#login' : `
        <section class="login-section">
            <h2>Login</h2>
            <form id="login-form">
                <label for="username">Usuario:</label>
                <input type="text" id="username" name="username" required>
                <button id="login-btn" type="submit">Iniciar Sesión</button>
            </form>
            <button id="invitado" type="button">Continuar como Invitado</button>
            <p>Los cambios realizados como invitado no se guardarán.</p>
        </section>
    `,

    '#home' : `
        <nav class="breadcrumbs">
            <span class="breadcrumb-item active">🏠 Inicio</span>
        </nav>
        <section class="home-section">
            <div class="header-home">
                <h2>Bienvenido a PicoSur</h2>
                <p>Explora nuestra selección de cervezas artesanales.</p>
            </div>
            <div id="productos-container" class="productos-container">
                <!-- Los productos se cargarán aquí dinámicamente -->
            </div>
        </section>
    `,

    '#carrito' : `
        <nav class="breadcrumbs">
            <a href="#home" class="breadcrumb-item">🏠 Inicio</a>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-item active">🛒 Carrito</span>
        </nav>
        <section class="carrito-section">
            <div class="carrito-header">
                <h2>Tu Carrito</h2>
                <button id="vaciar-carrito" class="btn-secundario">Vaciar Carrito</button>
            </div>

            <div id="carrito-vacio" class="carrito-vacio">
                <p>Tu carrito está vacío</p>
                <a href="#home" class="btn-principal">Explorar Productos</a>
            </div>

            <div id="carrito-contenido" class="carrito-contenido" style="display: none;">
                <div class="carrito-items" id="carrito-items">
                    <!-- Los items del carrito se cargarán aquí dinámicamente -->
                </div>

                <div class="carrito-resumen">
                    <h3>Resumen de Compra</h3>
                    <div class="resumen-detalle">
                        <div class="resumen-linea">
                            <span>Subtotal:</span>
                            <span id="subtotal">$0</span>
                        </div>
                        <div class="resumen-linea">
                            <span>Envío:</span>
                            <span id="envio">Gratis</span>
                        </div>
                        <div class="resumen-linea total">
                            <span>Total:</span>
                            <span id="total">$0</span>
                        </div>
                    </div>
                    <button id="finalizar-compra" class="btn-principal">Finalizar Compra</button>
                    <a href="#home" class="btn-secundario">Seguir Comprando</a>
                </div>
            </div>
        </section>
    `,
}

function renderRoute(){
    
    const hash = window.location.hash || '#login';
    
    // 🆕 VERIFICAR SESIÓN EN RUTAS PROTEGIDAS
    if (hash !== '#login' && !verificarSesion()) {
        return;
    }
    
    const vista = rutas[hash];
    document.getElementById('app').innerHTML = vista;
    
    // 🆕 MOSTRAR USUARIO EN EL HEADER
    mostrarUsuarioEnHeader();
    
    if (hash === '#home') {
      renderProductos();
    }
    
    if (hash === '#carrito') {
      renderVistaCarrito();
    }

}

// ============================================
// MOSTRAR USUARIO EN HEADER
// ============================================
function mostrarUsuarioEnHeader() {
    const usuario = obtenerUsuarioActual();
    const header = document.querySelector('header h1');
    
    if (!header) return;
    
    // Eliminar info de usuario previa si existe
    const infoUsuarioPrevia = document.getElementById('info-usuario');
    if (infoUsuarioPrevia) {
        infoUsuarioPrevia.remove();
    }
    
    if (usuario && window.location.hash !== '#login') {
        const infoUsuario = document.createElement('div');
        infoUsuario.id = 'info-usuario';
        infoUsuario.style.cssText = 'display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; font-size: 0.9rem;';
        
        infoUsuario.innerHTML = `
            <span>👤 ${usuario}</span>
            <button id="cerrar-sesion" style="
                padding: 0.4rem 0.8rem;
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid white;
                color: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.85rem;
                transition: all 0.3s ease;
            ">Cerrar Sesión</button>
        `;
        
        header.appendChild(infoUsuario);
    }
}

window.addEventListener('DOMContentLoaded', renderRoute);
window.addEventListener('hashchange', renderRoute);