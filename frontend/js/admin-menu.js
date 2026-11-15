
const resultado = document.getElementById("resultado");
const nombreAdmin = document.getElementById("nombreAdmin");

const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const totalClientes = document.getElementById("totalClientes");
const clientesActivos = document.getElementById("clientesActivos");
const clientesBloqueados = document.getElementById("clientesBloqueados");
const saldoTotal = document.getElementById("saldoTotal");

// Elementos del nuevo menú administrativo
const btnInicioAdmin = document.getElementById("btnInicioAdmin");

const opcionesAdmin = document.querySelectorAll(".opcion-admin");

// Guardar el contenido inicial del panel
const contenidoInicioAdmin = resultado.innerHTML;

// Controlar la opción activa del menú
function marcarOpcionAdmin(botonActivo) {
    opcionesAdmin.forEach(boton => {
        boton.classList.remove("activa");
    });

    if (botonActivo) {
        botonActivo.classList.add("activa");
    }
}

// Volver a la pantalla principal del administrador
function mostrarInicioAdmin() {
    marcarOpcionAdmin(btnInicioAdmin);
    resultado.innerHTML = contenidoInicioAdmin;
}

// Evento del botón Inicio
btnInicioAdmin.addEventListener("click", mostrarInicioAdmin);

// Verificar sesión del administrador
async function verificarSesionAdmin() {
    try {
        const respuesta = await fetch("/api/privadas/admin", {
            credentials: "include"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            window.location.href = "admin.html";
            return;
        }

        nombreAdmin.textContent =
            `Bienvenido, ${datos.usuario.nombre} ${datos.usuario.apellido}`;

        // Actualizar el nombre y las iniciales del administrador
const nombreCompleto = `${datos.usuario.nombre} ${datos.usuario.apellido}`;

const avatarAdmin = document.querySelector(".avatar-admin");
const inicialAdminSuperior = document.querySelector(".inicial-admin-superior");
const datosUsuarioAdmin = document.querySelector(".datos-usuario-admin strong");

const iniciales = `${datos.usuario.nombre.charAt(0)}${datos.usuario.apellido.charAt(0)}`.toUpperCase();

if (avatarAdmin) {
    avatarAdmin.textContent = iniciales;
}

if (inicialAdminSuperior) {
    inicialAdminSuperior.textContent = iniciales;
}

if (datosUsuarioAdmin) {
    datosUsuarioAdmin.textContent = nombreCompleto;
}

        consultarResumen();

    } catch (error) {
        console.error(error);
        resultado.innerHTML = "<p>No se pudo conectar con el servidor.</p>";
    }
}

// Consultar estadísticas del banco
async function consultarResumen() {
    try {
        const respuesta = await fetch("/api/admin/resumen", {
            credentials: "include"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.innerHTML = `<p>${datos.mensaje}</p>`;
            return;
        }

        const resumen = datos.resumen;

        totalClientes.textContent = resumen.total_clientes;
        clientesActivos.textContent = resumen.clientes_activos;
        clientesBloqueados.textContent = resumen.clientes_bloqueados;

        saldoTotal.textContent =
            `$${Number(resumen.dinero_total).toLocaleString("es-CO")}`;

    } catch (error) {
        console.error("Error al consultar estadísticas:", error);
    }
}

// Cerrar sesión
btnCerrarSesion.addEventListener("click", async () => {
    try {
        const respuesta = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });

        if (!respuesta.ok) {
            alert("No se pudo cerrar la sesión.");
            return;
        }

        window.location.href = "admin.html";

    } catch (error) {
        console.error(error);
        alert("Error al cerrar sesión.");
    }
});

// Evento del botón Clientes
// Navegación del menú administrativo
document.getElementById("btnClientes").addEventListener("click", () => {
    marcarOpcionAdmin(document.getElementById("btnClientes"));
    consultarClientes();
});

document.getElementById("btnCuentas").addEventListener("click", () => {
    marcarOpcionAdmin(document.getElementById("btnCuentas"));
    consultarCuentas();
});

document.getElementById("btnDepositos").addEventListener("click", () => {
    marcarOpcionAdmin(document.getElementById("btnDepositos"));
    mostrarFormularioDeposito();
});

document.getElementById("btnMovimientos").addEventListener("click", () => {
    marcarOpcionAdmin(document.getElementById("btnMovimientos"));
    consultarMovimientos();
});

// Ejecutar al abrir el panel
verificarSesionAdmin();
// Consultar todos los clientes
async function consultarClientes() {
    marcarOpcionAdmin(document.getElementById("btnClientes"));
    try {
        const respuesta = await fetch("/api/admin/clientes", {
            credentials: "include"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.innerHTML = `<p>${datos.mensaje}</p>`;
            return;
        }

        let html = `
            <h2>Clientes registrados</h2>

            <button id="btnNuevoCliente">+ Registrar nuevo cliente</button>

<div class="buscador-clientes">
    <input
        type="text"
        id="busquedaCliente"
        placeholder="Buscar por nombre, documento o correo"
    >

    <button id="btnBuscarCliente">Buscar</button>
    <button id="btnMostrarTodos">Mostrar todos</button>
</div>

<p>Total de clientes: ${datos.total}</p>

            <div class="tabla-contenedor">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Estado</th>
                            <th>Cuentas</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        datos.clientes.forEach(cliente => {
            html += `
                <tr>
                    <td>${cliente.nombre} ${cliente.apellido}</td>
                    <td>${cliente.correo}</td>
                    <td>${cliente.estado}</td>
                    <td>${cliente.cantidad_cuentas}</td>
                    <td>
                        <button onclick="consultarDetalleCliente(${cliente.id})">
                            Ver detalles
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        resultado.innerHTML = html; 

        document.getElementById("btnNuevoCliente").addEventListener("click", mostrarFormularioCliente);
        document.getElementById("btnBuscarCliente").addEventListener("click", buscarCliente);
        document.getElementById("btnMostrarTodos").addEventListener("click", consultarClientes);

    } catch (error) {
        console.error("Error al consultar clientes:", error);
        resultado.innerHTML = "<p>Error al cargar los clientes.</p>";
    }
}

// Consultar detalles de un cliente
// Consultar detalles de un cliente
async function consultarDetalleCliente(id) {
    try {
        const respuesta = await fetch(`/api/admin/clientes/${id}`, {
            credentials: "include"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.innerHTML = `<p>${datos.mensaje}</p>`;
            return;
        }

        const cliente = datos.cliente;

        let html = `
            <h2>Información del cliente</h2>

            <p><strong>Nombre:</strong> ${cliente.nombre} ${cliente.apellido}</p>
            <p><strong>Documento:</strong> ${cliente.documento}</p>
            <p><strong>Correo:</strong> ${cliente.correo}</p>
            <p><strong>Teléfono:</strong> ${cliente.telefono || "No registrado"}</p>
            <p><strong>Estado:</strong> ${cliente.estado}</p>

            <h3>Administrar estado del cliente</h3>

            <button id="btnCambiarEstado">
                ${cliente.estado === "activo" ? "Bloquear cliente" : "Activar cliente"}
            </button>

            <p id="mensajeEstado"></p>

            <h3>Editar información del cliente</h3>

            <div class="formulario-editar">
                <label>Nombre:</label>
                <input type="text" id="editarNombre" value="${cliente.nombre}">

                <label>Apellido:</label>
                <input type="text" id="editarApellido" value="${cliente.apellido}">

                <label>Correo:</label>
                <input type="email" id="editarCorreo" value="${cliente.correo}">

                <label>Teléfono:</label>
                <input type="text" id="editarTelefono" value="${cliente.telefono || ""}">

                <button id="btnGuardarEdicion">Guardar cambios</button>
                <p id="mensajeEdicion"></p>
            </div>

            <h3>Cuentas del cliente</h3>
        `;

        if (datos.cuentas.length === 0) {
            html += "<p>Este cliente no tiene cuentas registradas.</p>";
        } else {
            datos.cuentas.forEach(cuenta => {
                html += `
                    <div class="tarjeta-cuenta">
                        <p><strong>Número:</strong> ${cuenta.numero_cuenta}</p>
                        <p><strong>Tipo:</strong> ${cuenta.tipo_cuenta}</p>
                        <p><strong>Saldo:</strong> $${Number(cuenta.saldo).toLocaleString("es-CO")}</p>
                    </div>
                `;
            });
        }

        html += `
            <button id="btnVolverClientes">Volver a clientes</button>
        `;

        resultado.innerHTML = html;

        // Volver a la lista de clientes
        document.getElementById("btnVolverClientes")
            .addEventListener("click", consultarClientes);

        // Guardar cambios del cliente
        document.getElementById("btnGuardarEdicion")
            .addEventListener("click", async () => {

                const nombre = document.getElementById("editarNombre").value.trim();
                const apellido = document.getElementById("editarApellido").value.trim();
                const correo = document.getElementById("editarCorreo").value.trim();
                const telefono = document.getElementById("editarTelefono").value.trim();

                const mensajeEdicion = document.getElementById("mensajeEdicion");

                if (!nombre || !apellido || !correo) {
                    mensajeEdicion.textContent = "Nombre, apellido y correo son obligatorios.";
                    return;
                }

                try {
                    const respuesta = await fetch(`/api/admin/clientes/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            nombre,
                            apellido,
                            correo,
                            telefono
                        })
                    });

                    const datos = await respuesta.json();

                    if (!respuesta.ok) {
                        mensajeEdicion.textContent = datos.mensaje;
                        return;
                    }

                    alert(datos.mensaje);
                    consultarDetalleCliente(id);

                } catch (error) {
                    console.error("Error al editar cliente:", error);
                    mensajeEdicion.textContent = "Error al conectar con el servidor.";
                }
            });

        // Bloquear o activar cliente
        document.getElementById("btnCambiarEstado")
            .addEventListener("click", async () => {

                const nuevoEstado = cliente.estado === "activo"
                    ? "bloqueado"
                    : "activo";

                const confirmar = confirm(
                    `¿Estás seguro de que deseas ${nuevoEstado === "bloqueado" ? "bloquear" : "activar"} a ${cliente.nombre}?`
                );

                if (!confirmar) {
                    return;
                }

                try {
                    const respuesta = await fetch(`/api/admin/clientes/${id}/estado`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            estado: nuevoEstado
                        })
                    });

                    const datos = await respuesta.json();

                    if (!respuesta.ok) {
                        document.getElementById("mensajeEstado").textContent =
                            datos.mensaje || "No se pudo cambiar el estado.";
                        return;
                    }

                    alert(datos.mensaje);

                    consultarDetalleCliente(id);

                } catch (error) {
                    console.error("Error al cambiar el estado:", error);
                    document.getElementById("mensajeEstado").textContent =
                        "Error al conectar con el servidor.";
                }
            });

    } catch (error) {
        console.error("Error al consultar el detalle:", error);
        resultado.innerHTML = "<p>Error al consultar el cliente.</p>";
    }
}

// Buscar clientes
async function buscarCliente() {
    const busqueda = document.getElementById("busquedaCliente").value.trim();

    if (!busqueda) {
        alert("Escribe un nombre, documento o correo para buscar.");
        return;
    }

    try {
        const respuesta = await fetch(
            `/api/admin/clientes/buscar?busqueda=${encodeURIComponent(busqueda)}`,
            {
                credentials: "include"
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.innerHTML = `<p>${datos.mensaje}</p>`;
            return;
        }

        let html = `
            <h2>Resultados de búsqueda</h2>
            <p>Clientes encontrados: ${datos.clientes.length}</p>

            <div class="tabla-contenedor">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Documento</th>
                            <th>Correo</th>
                            <th>Teléfono</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        datos.clientes.forEach(cliente => {
            html += `
                <tr>
                    <td>${cliente.nombre} ${cliente.apellido}</td>
                    <td>${cliente.documento}</td>
                    <td>${cliente.correo}</td>
                    <td>${cliente.telefono || "No registrado"}</td>
                    <td>${cliente.estado}</td>
                    <td>
                        <button onclick="consultarDetalleCliente(${cliente.id})">
                            Ver detalles
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        resultado.innerHTML = html;

    } catch (error) {
        console.error("Error al buscar clientes:", error);
        resultado.innerHTML = "<p>Error al realizar la búsqueda.</p>";
    }
}
// Mostrar formulario para registrar un cliente
function mostrarFormularioCliente() {
    resultado.innerHTML = `
        <h2>Registrar nuevo cliente</h2>

        <div class="formulario-editar">

            <label>Nombre:</label>
            <input type="text" id="nuevoNombre" placeholder="Nombre">

            <label>Apellido:</label>
            <input type="text" id="nuevoApellido" placeholder="Apellido">

            <label>Documento:</label>
            <input type="text" id="nuevoDocumento" placeholder="Número de documento">

            <label>Correo electrónico:</label>
            <input type="email" id="nuevoCorreo" placeholder="Correo electrónico">

            <label>Teléfono:</label>
            <input type="text" id="nuevoTelefono" placeholder="Teléfono">

            <label>Contraseña:</label>
            <input type="password" id="nuevoPassword" placeholder="Mínimo 8 caracteres">

            <label>PIN del cajero:</label>
            <input type="password" id="nuevoPin" maxlength="4" placeholder="4 números">

            <button id="btnGuardarNuevoCliente">
                Registrar cliente
            </button>

            <button id="btnCancelarRegistro">
                Cancelar
            </button>

            <p id="mensajeRegistro"></p>

        </div>
    `;

    document.getElementById("btnGuardarNuevoCliente")
        .addEventListener("click", registrarNuevoCliente);

    document.getElementById("btnCancelarRegistro")
        .addEventListener("click", consultarClientes);
}
// Registrar un nuevo cliente
async function registrarNuevoCliente() {

    const nombre = document.getElementById("nuevoNombre").value.trim();
    const apellido = document.getElementById("nuevoApellido").value.trim();
    const documento = document.getElementById("nuevoDocumento").value.trim();
    const correo = document.getElementById("nuevoCorreo").value.trim();
    const telefono = document.getElementById("nuevoTelefono").value.trim();
    const password = document.getElementById("nuevoPassword").value;
    const pin = document.getElementById("nuevoPin").value.trim();

    const mensaje = document.getElementById("mensajeRegistro");
    const boton = document.getElementById("btnGuardarNuevoCliente");

    if (!nombre || !apellido || !documento || !correo || !password || !pin) {
        mensaje.textContent = "Completa todos los campos obligatorios.";
        return;
    }

    if (password.length < 8) {
        mensaje.textContent = "La contraseña debe tener mínimo 8 caracteres.";
        return;
    }

    if (!/^\d{4}$/.test(pin)) {
        mensaje.textContent = "El PIN debe tener exactamente 4 números.";
        return;
    }

    boton.disabled = true;
    boton.textContent = "REGISTRANDO...";

    try {
        const respuesta = await fetch("/api/admin/clientes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                nombre,
                apellido,
                documento,
                correo,
                telefono,
                password,
                pin
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || "No se pudo registrar el cliente.";
            return;
        }

        alert(datos.mensaje);

        consultarClientes();

    } catch (error) {
        console.error("Error al registrar cliente:", error);
        mensaje.textContent = "Error al conectar con el servidor.";
    } finally {
        boton.disabled = false;
        boton.textContent = "Registrar cliente";
    }
}
// Consultar todas las cuentas bancarias
async function consultarCuentas() {
    marcarOpcionAdmin(document.getElementById("btnCuentas"));
    try {
        const respuesta = await fetch("/api/admin/cuentas", {
            credentials: "include"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.innerHTML = `<p>${datos.mensaje}</p>`;
            return;
        }

        let html = `
            <h2>Cuentas bancarias</h2>
            <p>Total de cuentas: ${datos.total}</p>

            <div class="tabla-contenedor">
                <table>
                    <thead>
                        <tr>
                            <th>Titular</th>
                            <th>Correo</th>
                            <th>Número de cuenta</th>
                            <th>Tipo</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        datos.cuentas.forEach(cuenta => {
            html += `
                <tr>
                    <td>${cuenta.nombre} ${cuenta.apellido}</td>
                    <td>${cuenta.correo}</td>
                    <td>${cuenta.numero_cuenta}</td>
                    <td>${cuenta.tipo_cuenta}</td>
                    <td>$${Number(cuenta.saldo).toLocaleString("es-CO")}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        resultado.innerHTML = html;

    } catch (error) {
        console.error("Error al consultar cuentas:", error);
        resultado.innerHTML = "<p>Error al cargar las cuentas bancarias.</p>";
    }
}
// Mostrar formulario de depósitos
function mostrarFormularioDeposito() {
    marcarOpcionAdmin(document.getElementById("btnDepositos"));
    resultado.innerHTML = `
        <h2>Registrar depósito</h2>

        <div class="formulario-editar">

            <label>Número de cuenta:</label>
            <input
                type="text"
                id="cuentaDeposito"
                placeholder="Ejemplo: 104600655068"
            >

            <label>Monto del depósito:</label>
            <input
                type="number"
                id="montoDeposito"
                placeholder="Ingrese el monto"
                min="1"
            >

            <label>Descripción:</label>
            <input
                type="text"
                id="descripcionDeposito"
                placeholder="Motivo del depósito"
            >

            <button id="btnRealizarDeposito">
                Realizar depósito
            </button>

            <button id="btnCancelarDeposito">
                Cancelar
            </button>

            <p id="mensajeDeposito"></p>

        </div>
    `;

    document.getElementById("btnRealizarDeposito")
        .addEventListener("click", realizarDepositoAdmin);

    document.getElementById("btnCancelarDeposito")
        .addEventListener("click", consultarCuentas);
}
// Realizar depósito desde administración
async function realizarDepositoAdmin() {

    const numero_cuenta = document.getElementById("cuentaDeposito").value.trim();
    const monto = Number(document.getElementById("montoDeposito").value);
    const descripcion = document.getElementById("descripcionDeposito").value.trim();

    const mensaje = document.getElementById("mensajeDeposito");
    const boton = document.getElementById("btnRealizarDeposito");

    if (!numero_cuenta || !document.getElementById("montoDeposito").value) {
        mensaje.textContent = "Debes ingresar la cuenta y el monto.";
        return;
    }

    if (!Number.isFinite(monto) || monto <= 0) {
        mensaje.textContent = "El monto debe ser mayor que cero.";
        return;
    }

    const confirmar = confirm(
        `¿Deseas depositar $${monto.toLocaleString("es-CO")} en la cuenta ${numero_cuenta}?`
    );

    if (!confirmar) {
        return;
    }

    boton.disabled = true;
    boton.textContent = "PROCESANDO...";

    try {
        const respuesta = await fetch("/api/depositos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                numero_cuenta,
                monto,
                descripcion
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || "No se pudo realizar el depósito.";
            return;
        }

        resultado.innerHTML = `
            <h2>Depósito realizado correctamente</h2>
            <p><strong>Cuenta:</strong> ${datos.numero_cuenta}</p>
            <p><strong>Monto depositado:</strong> $${Number(datos.monto).toLocaleString("es-CO")}</p>
            <p><strong>Saldo anterior:</strong> $${Number(datos.saldo_anterior).toLocaleString("es-CO")}</p>
            <p><strong>Saldo nuevo:</strong> $${Number(datos.saldo_nuevo).toLocaleString("es-CO")}</p>
            <button id="btnVolverCuentas">Consultar cuentas</button>
        `;

        document.getElementById("btnVolverCuentas")
            .addEventListener("click", consultarCuentas);

    } catch (error) {
        console.error("Error al realizar depósito:", error);
        mensaje.textContent = "Error al conectar con el servidor.";

    } finally {
        boton.disabled = false;
        boton.textContent = "Realizar depósito";
    }
}
// Consultar movimientos generales del banco
async function consultarMovimientos() {
    marcarOpcionAdmin(document.getElementById("btnMovimientos"));
    try {
        const respuesta = await fetch("/api/admin/movimientos", {
            credentials: "include"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.innerHTML = `<p>${datos.mensaje}</p>`;
            return;
        }

        let html = `
            <h2>Movimientos generales</h2>
            <p>Total de movimientos: ${datos.total}</p>

            <div class="tabla-contenedor">
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Correo</th>
                            <th>Cuenta</th>
                            <th>Tipo</th>
                            <th>Descripción</th>
                            <th>Monto</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        datos.movimientos.forEach(movimiento => {
            html += `
                <tr>
                    <td>${movimiento.nombre} ${movimiento.apellido}</td>
                    <td>${movimiento.correo}</td>
                    <td>${movimiento.numero_cuenta}</td>
                    <td>${movimiento.tipo}</td>
                    <td>${movimiento.descripcion || "Sin descripción"}</td>
                    <td>$${Number(movimiento.monto).toLocaleString("es-CO")}</td>
                    <td>${new Date(movimiento.fecha).toLocaleString("es-CO")}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        resultado.innerHTML = html;

    } catch (error) {
        console.error("Error al consultar movimientos:", error);
        resultado.innerHTML = "<p>Error al cargar los movimientos generales.</p>";
    }
}