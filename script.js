// ===== Validación de formulario contacto ====
const formulario = document.getElementById('form-contacto');
if (formulario) {
  formulario.addEventListener('submit', function (e) {
    e.preventDefault();

    const nombre = formulario.nombre;
    const email = formulario.email;
    const mensaje = formulario.mensaje;

    let valido = true;
    let errores = [];

    if (nombre.value.trim() === "") {
      errores.push("El nombre es obligatorio.");
      valido = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      errores.push("El correo no tiene un formato válido.");
      valido = false;
    }

    if (mensaje.value.trim().length < 10) {
      errores.push("El mensaje debe tener al menos 10 caracteres.");
      valido = false;
    }

    if (!valido) {
      alert("Error:\n" + errores.join("\n"));
      return;
    }

    alert("Gracias por contactarnos. Te responderemos a la brevedad.");
    formulario.reset();
  });
}

// ===== Cargar productos desde API + manuales ====
const contenedor = document.getElementById('contenedor-productos');

if (contenedor) {
  fetch('https://fakestoreapi.com/products/category/electronics')
    .then(res => res.json())
    .then(apiProductos => {
      const productos = [...apiProductos, ...(window.productosManual || [])];

      productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto';
        card.innerHTML = `
          <div class="producto-img-container">
            <img src="${producto.image}" alt="${producto.title}">
            <button class="btn-carrito" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
          </div>
          <h3>${producto.title}</h3>
          <p>$${producto.price}</p>
        `;
        contenedor.appendChild(card);
      });
    });
}

// ===== Carrito Dinámico ====
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function actualizarContadorCarrito() {
  const total = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  const icono = document.querySelector('a[href="carrito.html"]');
  if (icono) icono.innerText = `🛒 (${total})`;
}

function agregarAlCarrito(id) {
  const productoManual = (window.productosManual || []).find(p => p.id === id);

  if (productoManual) {
    const existe = carrito.find(item => item.id === productoManual.id);
    if (existe) {
      existe.cantidad++;
    } else {
      carrito.push({ ...productoManual, cantidad: 1 });
    }
    actualizarContadorCarrito();
  } else {
    fetch(`https://fakestoreapi.com/products/${id}`)
      .then(res => res.json())
      .then(producto => {
        const existe = carrito.find(item => item.id === producto.id);
        if (existe) {
          existe.cantidad++;
        } else {
          carrito.push({ ...producto, cantidad: 1 });
        }
        actualizarContadorCarrito();
      });
  }
}

function mostrarCarrito() {
  const carritoSection = document.querySelector('section');
  if (!carritoSection) return;

  carritoSection.style.minHeight = "60vh";

  if (carrito.length === 0) {
    carritoSection.innerHTML = "<h2>Carrito de Compras</h2><p>Tu carrito está vacío.</p>";
    return;
  }

  let html = `<h2>Carrito de Compras</h2><div class="grid-productos grid-centrado">`;
  let total = 0;

  carrito.forEach((prod, i) => {
    total += prod.price * prod.cantidad;
    html += `
      <div class="producto">
        <div class="contenido-info">
          <img src="${prod.image}" alt="${prod.title}" style="width:100px; height:100px; margin: 0 auto;">
          <h3>${prod.title}</h3>
          <p>Precio: $${prod.price}</p>
          <p>Cantidad: <input type="number" min="1" value="${prod.cantidad}" onchange="cambiarCantidad(${i}, this.value)"></p>
          <p>Total: $${(prod.price * prod.cantidad).toFixed(2)}</p>
        </div>
        <button onclick="eliminarProducto(${i})">Eliminar</button>
      </div>`;
  });

html += `</div>
  <div class="total-carrito">
    <p>Total de la compra: $${total.toFixed(2)}</p>
    <div class="botones-carrito">
      <button onclick="cancelarCarrito()">Cancelar</button>
      <button onclick="alert('Gracias por tu compra')">Pagar</button>
    </div>
  </div>`;
  carritoSection.innerHTML = html;
}

function cambiarCantidad(index, cantidad) {
  carrito[index].cantidad = parseInt(cantidad);
  actualizarContadorCarrito();
  mostrarCarrito();
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  actualizarContadorCarrito();
  mostrarCarrito();
}

function cancelarCarrito() {
  carrito = [];
  actualizarContadorCarrito();
  mostrarCarrito();
}

if (window.location.pathname.includes('carrito.html')) {
  mostrarCarrito();
}

actualizarContadorCarrito();
