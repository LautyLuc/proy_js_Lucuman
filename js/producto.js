let productosDisponibles = [];

// Fetch de productos
async function cargarCervezas() {
  try {
    const response = await fetch('./cervezas.json');
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data.cervezas;
  } catch (error) {
    mostrarError('❌ Error al cargar los productos');
    return [];
  }
}

/**
 * Carga y renderiza los productos desde el JSON
 * Muestra un spinner durante la carga para mejor experiencia visual
 */
async function renderProductos() {
  const contenedorProductos = document.getElementById('productos-container');
  
  if (!contenedorProductos) {
    mostrarError('❌ Error: contenedor no encontrado');
    return;
  }
  
  // Muestro el spinner mientras cargo los productos
  contenedorProductos.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
      <p>Cargando productos...</p>
    </div>
  `;
  
  // Cargo los productos del JSON
  const productos = await cargarCervezas();
  
  // Agrego un delay de 800ms para que el spinner se alcance a ver
  // Esto mejora la percepción de que la app está trabajando
  // y evita que la transición sea demasiado brusca
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (!productos || productos.length === 0) {
    contenedorProductos.innerHTML = '<p class="sin-productos">No hay productos disponibles.</p>';
    mostrarAdvertencia('⚠️ No se encontraron productos');
    return;
  }
  
  // Guardo los productos globalmente para que otros módulos los usen
  productosDisponibles = productos;
  
  // Genero el HTML de cada producto
  contenedorProductos.innerHTML = productos.map(producto => `
    <article class="producto-card" data-id="${producto.id}">
      <h3>${producto.nombre}</h3>
      <p class="medida">${producto.medida}</p>
      <p class="descripcion">${producto.descripcion}</p>
      <p class="precio">$${producto.precio.toLocaleString('es-AR')}</p>
      <p class="stock">Stock: ${producto.stock}</p>
      <button class="btn-agregar" data-id="${producto.id}" ${producto.stock === 0 ? 'disabled' : ''}>
        ${producto.stock === 0 ? 'Sin Stock' : 'Agregar al carrito'}
      </button>
    </article>
  `).join('');
  
  mostrarExito(`✅ ${productos.length} productos cargados`);

  // Inicializo el carrito después de cargar los productos
  // Uso setTimeout para asegurarme de que el DOM esté listo
  setTimeout(() => {
    inicializarCarritoDesdeProductos();
    agregarEventListenersCarrito();
  }, 100);
}