// ============================================
// GESTIÓN DEL CARRITO DE COMPRAS
// ============================================

// Array que almacena todos los productos del carrito
// Cada producto tiene: id, nombre, precio, cantidad, stock, etc.
let carrito = [];

/**
 * Inicializa el carrito cuando se cargan los productos
 * Si el usuario tiene un carrito guardado, lo restaura desde localStorage
 * Si no, crea un carrito vacío con todos los productos disponibles con cantidad 0
 */
function inicializarCarritoDesdeProductos() {
  // Verifico que los productos estén cargados
  if (!productosDisponibles || productosDisponibles.length === 0) {
    return;
  }
  
  // Intento recuperar el stock guardado
  const stockGuardado = cargarStockGuardado();
  
  // Intento recuperar el carrito guardado del usuario
  const carritoGuardado = cargarCarritoGuardado();
  
  if (carritoGuardado.length > 0) {
    // Si hay carrito guardado, lo restauro
    // Mapeo los productos disponibles y busco cuáles tienen cantidad guardada
    carrito = productosDisponibles.map(producto => {
      const guardado = carritoGuardado.find(p => p.id === producto.id);
      
      // Determino el stock: primero intento usar el guardado, sino el del JSON
      let stockProducto = producto.stock;
      if (stockGuardado && stockGuardado[producto.id] !== undefined) {
        stockProducto = stockGuardado[producto.id];
      }
      
      if (guardado) {
        // Si este producto estaba en el carrito, restauro su cantidad
        return {
          ...producto,
          cantidad: guardado.cantidad,
          stock: stockProducto
        };
      }
      
      // Si no estaba en el carrito, lo agrego con cantidad 0
      return { 
        ...producto, 
        cantidad: 0,
        stock: stockProducto 
      };
    });
    
    mostrarInfo('✅ Carrito restaurado');
  } else {
    // Si no hay carrito guardado, creo uno vacío
    // Aplico el stock guardado si existe
    carrito = productosDisponibles.map(producto => {
      let stockProducto = producto.stock;
      if (stockGuardado && stockGuardado[producto.id] !== undefined) {
        stockProducto = stockGuardado[producto.id];
      }
      
      return {
        ...producto,
        cantidad: 0,
        stock: stockProducto
      };
    });
  }
  
  // Actualizo el contador del navbar
  actualizarContadorCarrito();
}

/**
 * Calcula el total del carrito sumando (precio × cantidad) de cada producto
 * Devuelve el total en pesos
 */
function calcularTotal() {
    let total = 0;
    carrito.forEach(item => {
        total += item.precio * item.cantidad;
    });
    return total;
}

/**
 * Agrega event listeners a todos los botones "Agregar al carrito"
 * Maneja la lógica de agregar productos: validaciones, actualización de stock, guardado
 */
function agregarEventListenersCarrito(){
    const botonesAgregar = document.querySelectorAll('.btn-agregar');
    
    // Si no hay botones, salgo de la función
    if (botonesAgregar.length === 0) {
        return;
    }
    
    // Por cada botón "Agregar", le agrego un click listener
    botonesAgregar.forEach( boton =>  {
        boton.addEventListener('click', () => {
            const idProducto = parseInt(boton.getAttribute('data-id'));
            const producto = carrito.find( p => p.id === idProducto );
            
            // Si no encuentro el producto, muestro error y salgo
            if (!producto) {
                mostrarError('❌ Producto no encontrado en el carrito');
                return;
            }
            
            // Valido que no me pase del límite de $300,000
            // Calculo cuánto sería el total si agrego este producto
            const totalActual = calcularTotal();
            const totalFuturo = totalActual + producto.precio;
            
            if (totalFuturo > 300000) {
                mostrarError(`❌ No se puede agregar. Superarías el límite de $300,000 (Total sería: $${totalFuturo.toLocaleString('es-AR')})`);
                return;
            }
            
            // Verifico que haya stock disponible
            if (producto.stock <= 0) {
                mostrarAdvertencia(`⚠️ ${producto.nombre} sin stock disponible`);
                boton.disabled = true;
                boton.textContent = 'Sin Stock';
                return;
            }
            
            // Todo OK, agrego el producto
            producto.cantidad++;
            
            // Reduzco el stock disponible
            producto.stock--;
            
            // Calculo el nuevo total
            const total = calcularTotal();
            
            // Muestro notificación de éxito
            mostrarExito(`✅ ${producto.nombre} agregado al carrito`);
            
            // Guardo el carrito en localStorage (si no es invitado)
            guardarCarrito();
            
            // Actualizo el número de stock que se muestra en la tarjeta del producto
            actualizarStockEnPantalla(producto);
            
            // Actualizo el contador del navbar (el número al lado de "Carrito")
            actualizarContadorCarrito();
            
            // Si se acabó el stock, deshabilito el botón
            if (producto.stock === 0) {
                boton.disabled = true;
                boton.textContent = 'Sin Stock';
                mostrarInfo(`ℹ️ Última unidad de ${producto.nombre} agregada`);
            }
        });
    });
}

/**
 * Actualiza el número de stock que se muestra en la tarjeta del producto
 * También cambia el color si el stock es bajo (naranja) o nulo (rojo)
 */
function actualizarStockEnPantalla(producto) {
    // Busco la tarjeta del producto en el DOM usando su ID
    const tarjeta = document.querySelector(`.producto-card[data-id="${producto.id}"]`);
    
    if (tarjeta) {
        // Busco el elemento que muestra el stock
        const elementoStock = tarjeta.querySelector('.stock');
        if (elementoStock) {
            // Actualizo el texto con el nuevo stock
            elementoStock.textContent = `Stock: ${producto.stock}`;
            
            // Si no hay stock, lo pinto de rojo
            if (producto.stock === 0) {
                elementoStock.style.color = '#e74c3c';
                elementoStock.style.fontWeight = 'bold';
            } 
            // Si queda poco stock (5 o menos), lo pinto de naranja
            else if (producto.stock <= 5) {
                elementoStock.style.color = '#f39c12';
                elementoStock.style.fontWeight = 'bold';
            }
        }
    }
}

/**
 * Actualiza el contador del carrito que se muestra en el navbar
 * Suma todas las cantidades de productos y lo muestra al lado de "Carrito"
 */
function actualizarContadorCarrito() {
    const contadorElemento = document.getElementById('carritoCount');
    if (contadorElemento) {
        // Sumo todas las cantidades de productos en el carrito
        const totalProductos = carrito.reduce((suma, item) => suma + item.cantidad, 0);
        contadorElemento.textContent = totalProductos;
    }
}

/**
 * Guarda el carrito en localStorage con una clave única por usuario
 * NO guarda si el usuario es "Invitado"
 * También guarda el stock actualizado de cada producto
 */
function guardarCarrito() {
    const usuarioActual = obtenerUsuarioActual();

    // Si no hay usuario, no guardo
    if (!usuarioActual) {
        return;
    }

    // Si es invitado, no guardo (su carrito se pierde al cerrar)
    if (usuarioActual === 'Invitado') {
        return;
    }

    // Creo una clave única: "carrito_Juan", "carrito_María", etc.
    const claveStorage = `carrito_${usuarioActual}`;

    // Solo guardo productos que tengan cantidad mayor a 0
    const productosConCantidad = carrito.filter(p => p.cantidad > 0);

    try {
        // Convierto el array a JSON y lo guardo en localStorage
        localStorage.setItem(claveStorage, JSON.stringify(productosConCantidad));
        
        // También guardo el stock actualizado de TODOS los productos
        guardarStockActualizado();
    } catch (error) {
        mostrarError('Error al guardar el carrito');
    }
}

/**
 * Guarda el stock actualizado de todos los productos en localStorage
 * Esto permite que el stock persista entre sesiones
 */
function guardarStockActualizado() {
    const stockActualizado = {};
    
    // Creo un objeto con el ID y el stock de cada producto
    carrito.forEach(producto => {
        stockActualizado[producto.id] = producto.stock;
    });
    
    try {
        localStorage.setItem('stockProductos', JSON.stringify(stockActualizado));
    } catch (error) {
        // Si falla, no hago nada crítico
    }
}

/**
 * Carga el stock guardado desde localStorage
 * Si existe stock guardado, lo aplica a los productos
 */
function cargarStockGuardado() {
    const stockJSON = localStorage.getItem('stockProductos');
    
    if (!stockJSON) {
        return null;
    }
    
    try {
        return JSON.parse(stockJSON);
    } catch (error) {
        return null;
    }
}

/**
 * Carga el carrito guardado del usuario desde localStorage
 * Devuelve un array con los productos que tenía en el carrito
 * Si no hay carrito guardado, devuelve un array vacío
 */
function cargarCarritoGuardado() {
    const usuarioActual = obtenerUsuarioActual();

    // Si no hay usuario, devuelvo array vacío
    if (!usuarioActual) {
        return [];
    }

    // Creo la misma clave que usé para guardar
    const claveStorage = `carrito_${usuarioActual}`;
    const carritoJSON = localStorage.getItem(claveStorage);

    // Si no hay nada guardado, devuelvo array vacío
    if (!carritoJSON) {
        return [];
    }

    try {
        // Convierto el JSON de vuelta a array
        const carritoGuardado = JSON.parse(carritoJSON);
        return carritoGuardado;
    } catch (error) {
        // Si hay error al parsear, devuelvo array vacío
        return [];
    }
}

/**
 * Vacía completamente el carrito
 * Elimina el carrito del localStorage y reinicia todas las cantidades a 0
 */
function vaciarCarrito() {
    const usuarioActual = obtenerUsuarioActual();

    // Elimino el carrito del localStorage
    if (usuarioActual) {
        localStorage.removeItem(`carrito_${usuarioActual}`);
    }

    // Reinicio el carrito: todos los productos con cantidad 0
    carrito = productosDisponibles.map(p => ({
        ...p,
        cantidad: 0
    }));

    // Actualizo el contador del navbar
    actualizarContadorCarrito();
    
    // Intento guardar (aunque no hará nada porque todas las cantidades son 0)
    guardarCarrito();
    
    // Si estoy en la vista del carrito, la vuelvo a renderizar para mostrar "vacío"
    if (window.location.hash === '#carrito') {
        renderVistaCarrito();
    }
    
    mostrarInfo('🗑️ Carrito vaciado');
}

/**
 * Renderiza la vista del carrito (#carrito)
 * Muestra todos los productos que tienen cantidad > 0
 * Si no hay productos, muestra mensaje de "carrito vacío"
 */
function renderVistaCarrito() {
    const divCarritoVacio = document.getElementById('carrito-vacio');
    const divCarritoContenido = document.getElementById('carrito-contenido');
    const contenedorItems = document.getElementById('carrito-items');
    
    // Si no encuentro el contenedor, salgo
    if (!contenedorItems) {
        return;
    }
    
    // Filtro solo productos que tienen cantidad mayor a 0
    const productosEnCarrito = carrito.filter(p => p.cantidad > 0);
    
    // Si no hay productos, muestro el mensaje de "carrito vacío"
    if (productosEnCarrito.length === 0) {
        if (divCarritoVacio) divCarritoVacio.style.display = 'block';
        if (divCarritoContenido) divCarritoContenido.style.display = 'none';
        return;
    }
    
    // Si hay productos, muestro el contenido del carrito
    if (divCarritoVacio) divCarritoVacio.style.display = 'none';
    if (divCarritoContenido) divCarritoContenido.style.display = 'block';
    
    // Genero el HTML de cada producto en el carrito
    contenedorItems.innerHTML = productosEnCarrito.map(producto => `
        <article class="carrito-item" data-id="${producto.id}">
            <div class="item-info">
                <h3>${producto.nombre}</h3>
                <p class="item-medida">${producto.medida}</p>
            </div>
            <div class="item-cantidad">
                <button class="btn-cantidad btn-restar" data-id="${producto.id}">-</button>
                <span class="cantidad-valor">${producto.cantidad}</span>
                <button class="btn-cantidad btn-sumar" data-id="${producto.id}">+</button>
            </div>
            <div class="item-precio">
                <p class="precio-unitario">$${producto.precio.toLocaleString('es-AR')} c/u</p>
                <p class="precio-total">$${(producto.precio * producto.cantidad).toLocaleString('es-AR')}</p>
            </div>
            <button class="btn-eliminar" data-id="${producto.id}">
                <span>🗑️</span>
            </button>
        </article>
    `).join('');
    
    // Actualizo los totales (subtotal, envío, total)
    actualizarResumenCarrito();
    
    // Agrego los event listeners a los botones (+, -, 🗑️, etc.)
    agregarEventListenersVistaCarrito();
}

/**
 * Actualiza el resumen del carrito: subtotal, costo de envío y total
 * Envío gratis si el subtotal supera $50,000
 */
function actualizarResumenCarrito() {
    const elementoSubtotal = document.getElementById('subtotal');
    const elementoEnvio = document.getElementById('envio');
    const elementoTotal = document.getElementById('total');
    
    // Calculo el subtotal (suma de productos)
    const subtotal = calcularTotal();
    
    // Si supera $50,000, envío gratis. Sino, $5,000
    const costoEnvio = subtotal >= 50000 ? 0 : 5000;
    
    // Total final
    const total = subtotal + costoEnvio;
    
    // Actualizo el HTML de cada elemento
    if (elementoSubtotal) {
        elementoSubtotal.textContent = `$${subtotal.toLocaleString('es-AR')}`;
    }
    
    if (elementoEnvio) {
        elementoEnvio.textContent = costoEnvio === 0 ? 'Gratis 🎉' : `$${costoEnvio.toLocaleString('es-AR')}`;
    }
    
    if (elementoTotal) {
        elementoTotal.textContent = `$${total.toLocaleString('es-AR')}`;
    }
}

/**
 * Agrega todos los event listeners de la vista del carrito
 * Botones: vaciar carrito, sumar, restar, eliminar, finalizar compra
 */
function agregarEventListenersVistaCarrito() {
    // Botón "Vaciar Carrito"
    const botonVaciarCarrito = document.getElementById('vaciar-carrito');
    if (botonVaciarCarrito) {
        botonVaciarCarrito.addEventListener('click', () => {
            vaciarCarrito();
        });
    }
    
    // Botones "+" para sumar cantidad
    const botonesSumar = document.querySelectorAll('.btn-sumar');
    botonesSumar.forEach(boton => {
        boton.addEventListener('click', () => {
            const idProducto = parseInt(boton.getAttribute('data-id'));
            aumentarCantidad(idProducto);
        });
    });
    
    // Botones "-" para restar cantidad
    const botonesRestar = document.querySelectorAll('.btn-restar');
    botonesRestar.forEach(boton => {
        boton.addEventListener('click', () => {
            const idProducto = parseInt(boton.getAttribute('data-id'));
            disminuirCantidad(idProducto);
        });
    });
    
    // Botones "🗑️" para eliminar producto completamente
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', () => {
            const idProducto = parseInt(boton.getAttribute('data-id'));
            eliminarProductoDelCarrito(idProducto);
        });
    });
    
    // Botón "Finalizar Compra"
    const botonFinalizarCompra = document.getElementById('finalizar-compra');
    if (botonFinalizarCompra) {
        botonFinalizarCompra.addEventListener('click', () => {
            finalizarCompra();
        });
    }
}

/**
 * Aumenta en 1 la cantidad de un producto en el carrito
 * Valida límite de $300,000 y stock disponible
 */
function aumentarCantidad(idProducto) {
    const producto = carrito.find(p => p.id === idProducto);
    
    // Si no encuentro el producto, muestro error
    if (!producto) {
        mostrarError('❌ Producto no encontrado');
        return;
    }
    
    // Valido que no me pase del límite de $300,000
    const totalActual = calcularTotal();
    const totalFuturo = totalActual + producto.precio;
    
    if (totalFuturo > 300000) {
        mostrarError(`❌ No se puede agregar. Superarías el límite de $300,000 (Total sería: $${totalFuturo.toLocaleString('es-AR')})`);
        return;
    }
    
    // Verifico que haya stock
    if (producto.stock <= 0) {
        mostrarAdvertencia(`⚠️ No hay más stock de ${producto.nombre}`);
        return;
    }
    
    // Todo OK, aumento la cantidad
    producto.cantidad++;
    producto.stock--;
    
    // Guardo, actualizo contador y vuelvo a renderizar
    guardarCarrito();
    actualizarContadorCarrito();
    renderVistaCarrito();
    
    mostrarExito(`✅ ${producto.nombre} agregado`);
}

/**
 * Disminuye en 1 la cantidad de un producto en el carrito
 * Si llega a 0, el producto desaparece de la vista
 */
function disminuirCantidad(idProducto) {
    const producto = carrito.find(p => p.id === idProducto);
    
    // Si no encuentro el producto, muestro error
    if (!producto) {
        mostrarError('❌ Producto no encontrado');
        return;
    }
    
    // Si ya está en 0, no hago nada
    if (producto.cantidad <= 0) {
        return;
    }
    
    // Reduzco la cantidad y devuelvo 1 al stock
    producto.cantidad--;
    producto.stock++;
    
    // Guardo, actualizo contador y vuelvo a renderizar
    guardarCarrito();
    actualizarContadorCarrito();
    renderVistaCarrito();
    
    // Muestro mensaje diferente si se eliminó completamente
    if (producto.cantidad === 0) {
        mostrarInfo(`ℹ️ ${producto.nombre} eliminado del carrito`);
    } else {
        mostrarInfo(`➖ ${producto.nombre} reducido`);
    }
}

/**
 * Elimina completamente un producto del carrito
 * Devuelve todas las unidades al stock
 */
function eliminarProductoDelCarrito(idProducto) {
    const producto = carrito.find(p => p.id === idProducto);
    
    // Si no encuentro el producto, muestro error
    if (!producto) {
        mostrarError('❌ Producto no encontrado');
        return;
    }
    
    // Devuelvo todas las unidades al stock
    producto.stock += producto.cantidad;
    producto.cantidad = 0;
    
    // Guardo, actualizo contador y vuelvo a renderizar
    guardarCarrito();
    actualizarContadorCarrito();
    renderVistaCarrito();
    
    mostrarInfo(`🗑️ ${producto.nombre} eliminado del carrito`);
}

/**
 * Finaliza la compra
 * Valida que el usuario no sea invitado y que haya productos
 * Vacía el carrito y redirige a home
 */
function finalizarCompra() {
    const usuarioActual = obtenerUsuarioActual();
    
    // Los invitados no pueden comprar
    if (usuarioActual === 'Invitado') {
        mostrarAdvertencia('⚠️ Los invitados no pueden finalizar compras. Por favor, inicia sesión.');
        return;
    }
    
    // Verifico que haya productos en el carrito
    const productosEnCarrito = carrito.filter(p => p.cantidad > 0);
    
    if (productosEnCarrito.length === 0) {
        mostrarAdvertencia('⚠️ El carrito está vacío');
        return;
    }
    
    // Calculo el total
    const total = calcularTotal();
    
    // Confirmo la compra y proceso
    mostrarExito('🎉 ¡Compra realizada con éxito!');
    vaciarCarrito();
    
    // Después de 2 segundos, vuelvo a home
    setTimeout(() => {
        window.location.hash = '#home';
    }, 2000);
}