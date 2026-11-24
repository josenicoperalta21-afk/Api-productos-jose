const API = `${window.location.protocol}//${window.location.hostname}:3000/api/productos`

// Gestión del DOM
const formProducto = document.getElementById("formProducto")
const formBuscar = document.getElementById("formBuscar")
const cuerpoTabla = document.getElementById("cuerpoTabla")
const mensaje = document.getElementById("mensaje")
const tituloFormulario = document.getElementById("tituloFormulario")
const botonGuardar = formProducto.querySelector('button[type="submit"]')

// Campos del formulario de producto
const marca = document.getElementById("marca")
const descripcion = document.getElementById("descripcion")
const precio = document.getElementById("precio")
const stock = document.getElementById("stock")
const campoId = document.getElementById("id")

// Campos del formulario de búsqueda
const buscarId = document.getElementById("buscarId")
const mostrarTodo = document.getElementById("mostrarTodo")

function mostrarMensaje(texto, tipo = "danger") {
  mensaje.innerHTML = ""
  if (!texto) return

  const alerta = document.createElement("div")
  alerta.className = `alert alert-${tipo} mb-0`
  alerta.setAttribute("role", "alert")
  alerta.textContent = texto
  mensaje.append(alerta)
}

function mostrarEstadoTabla(texto) {
  cuerpoTabla.innerHTML = ""
  const fila = document.createElement("tr")
  const celda = document.createElement("td")
  celda.colSpan = 6
  celda.className = "text-center text-muted"
  celda.textContent = texto
  fila.append(celda)
  cuerpoTabla.append(fila)
}

async function solicitar(url, opciones) {
  const respuesta = await fetch(url, opciones)
  const resultado = await respuesta.json()

  if (!respuesta.ok || !resultado.ok) {
    const errores = Array.isArray(resultado.errores)
      ? `: ${resultado.errores.join(", ")}`
      : ""
    throw new Error(
      `${resultado.message || "No se pudo completar la solicitud"}${errores}`
    )
  }

  return resultado
}

function dibujarTabla(productos) {
  cuerpoTabla.innerHTML = ''
  if (!productos || productos.length === 0) {
    mostrarEstadoTabla("No hay productos")
    return
  }

  productos.forEach(p => {
    const fila = document.createElement("tr")
    const valores = [p.id, p.marca, p.descripcion, p.precio, p.stock]
    valores.forEach(valor => {
      const celda = document.createElement("td")
      celda.textContent = valor
      fila.append(celda)
    })

    const acciones = document.createElement("td")
    const botonEditar = document.createElement("button")
    botonEditar.type = "button"
    botonEditar.className = "btn btn-sm btn-primary me-1"
    botonEditar.dataset.accion = "editar"
    botonEditar.dataset.id = p.id
    botonEditar.textContent = "Editar"

    const botonEliminar = document.createElement("button")
    botonEliminar.type = "button"
    botonEliminar.className = "btn btn-sm btn-outline-danger"
    botonEliminar.dataset.accion = "eliminar"
    botonEliminar.dataset.id = p.id
    botonEliminar.textContent = "Eliminar"

    acciones.append(botonEditar, botonEliminar)
    fila.append(acciones)
    cuerpoTabla.append(fila)
  })
}

async function editarProducto(id) {
  try {
    const resultado = await solicitar(`${API}/${id}`)
    const producto = resultado.data
    campoId.value = producto.id
    marca.value = producto.marca
    descripcion.value = producto.descripcion
    precio.value = producto.precio
    stock.value = producto.stock
    tituloFormulario.textContent = `Editando producto #${producto.id}`
    mostrarMensaje("")
    marca.focus()
  } catch (e) {
    mostrarMensaje(e.message)
  }
}

async function eliminarProducto(id) {
  if (!confirm('¿Está seguro de eliminar?')) return

  try {
    const resultado = await solicitar(`${API}/${id}`, { method: 'DELETE' })
    await cargarProductos()
    mostrarMensaje(resultado.message, "success")
  } catch (e) {
    mostrarMensaje(e.message)
  }
}

async function cargarProductos() {
  mostrarMensaje("")
  mostrarEstadoTabla("Cargando productos...")

  try {
    const resultado = await solicitar(API)
    dibujarTabla(resultado.data)
  } catch (e) {
    mostrarEstadoTabla("No se pudieron cargar los productos")
    mostrarMensaje(`${e.message}. Comprueba que la API y MySQL estén en ejecución.`)
  }
}

async function buscarProducto(id) {
  try {
    const resultado = await solicitar(`${API}/${id}`)
    dibujarTabla([resultado.data])
    mostrarMensaje("")
  } catch (e) {
    mostrarEstadoTabla("No se encontró el producto")
    mostrarMensaje(e.message, "warning")
  }
}

async function guardarProducto() {
  const producto = {
    marca: marca.value,
    descripcion: descripcion.value,
    precio: parseFloat(precio.value),
    stock: parseInt(stock.value, 10)
  }
  const editando = campoId.value !== ''

  botonGuardar.disabled = true
  try {
    const url = editando ? `${API}/${campoId.value}` : API
    const opciones = {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto)
    }

    const resultado = await solicitar(url, opciones)

    formProducto.reset()
    await cargarProductos()
    const confirmacion = editando
      ? "Producto actualizado correctamente"
      : `Producto registrado correctamente (ID ${resultado.data?.id ?? resultado.id})`
    mostrarMensaje(confirmacion, "success")
    marca.focus()
  } catch (e) {
    mostrarMensaje(e.message)
  } finally {
    botonGuardar.disabled = false
  }
}

formBuscar.addEventListener("submit", function (e) {
  e.preventDefault()
  const id = parseInt(buscarId.value, 10)
  if (Number.isInteger(id) && id > 0) buscarProducto(id)
})

formProducto.addEventListener("submit", function (e) {
  e.preventDefault()
  guardarProducto()
})

formProducto.addEventListener("reset", function () {
  campoId.value = ""
  tituloFormulario.textContent = "Nuevo producto"
  mostrarMensaje("")
})

cuerpoTabla.addEventListener("click", function (e) {
  const boton = e.target.closest("button[data-accion]")
  if (!boton) return

  if (boton.dataset.accion === "editar") editarProducto(boton.dataset.id)
  if (boton.dataset.accion === "eliminar") eliminarProducto(boton.dataset.id)
})

mostrarTodo.addEventListener("click", function () {
  formBuscar.reset()
  cargarProductos()
})

cargarProductos()