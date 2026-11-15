
const resultado = document.getElementById("resultado");
const nombreCliente = document.getElementById("nombreCliente");

const btnInicio = document.getElementById("btnInicio");
const btnCuentas = document.getElementById("btnCuentas");
const btnMovimientos = document.getElementById("btnMovimientos");
const btnTransferencias = document.getElementById("btnTransferencias");
const btnPerfil = document.getElementById("btnPerfil");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

let usuarioActual = null;

// Evita insertar directamente texto recibido del servidor en HTML.
function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caracter]);
}

function formatoDinero(valor) {
    return Number(valor || 0).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    });
}

function marcarOpcionActiva(botonActivo) {
    document.querySelectorAll(".opcion-menu").forEach(boton => {
        boton.classList.remove("activa");
    });

    if (botonActivo) {
        botonActivo.classList.add("activa");
    }
}

function actualizarDatosUsuario(usuario) {
    if (!usuario) return;

    const nombreCompleto =
        `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();

    const inicial = (usuario.nombre || "N").charAt(0).toUpperCase();

    const avatarLateral = document.querySelector(".avatar-cliente");
    const inicialSuperior = document.querySelector(".usuario-inicial");
    const datosSuperior = document.querySelector(".usuario-datos strong");
    const inicialBienvenida = document.getElementById("inicialBienvenida");

    if (avatarLateral) avatarLateral.textContent = inicial;
    if (inicialSuperior) inicialSuperior.textContent = inicial;
    if (inicialBienvenida) inicialBienvenida.textContent = inicial;
    
    if (datosSuperior) {
        datosSuperior.textContent = nombreCompleto || "Cliente NOVA";
    }

    if (nombreCliente) {
        nombreCliente.textContent = `Hola, ${nombreCompleto || "cliente"}`;
    }
}

// INICIO

function mostrarInicio() {
    marcarOpcionActiva(btnInicio);

    resultado.innerHTML = `
        <div class="encabezado-contenido">
            <span class="subtitulo-contenido">Resumen general</span>
            <h2>Tu espacio financiero</h2>
            <p>
                Consulta tu información bancaria y administra tus operaciones
                desde un solo lugar.
            </p>
        </div>

        <div class="tarjetas-informativas">
            <div class="tarjeta-informativa">
                <div class="icono-informativo">▣</div>
                <h3>Mis cuentas</h3>
                <p>Consulta tus cuentas bancarias y revisa los saldos disponibles.</p>
                <button type="button" id="inicioCuentas">Consultar cuentas</button>
            </div>

            <div class="tarjeta-informativa">
                <div class="icono-informativo">⇄</div>
                <h3>Transferencias</h3>
                <p>Envía dinero a otras cuentas de NOVA BANK de forma sencilla.</p>
                <button type="button" id="inicioTransferencias">Realizar transferencia</button>
            </div>

            <div class="tarjeta-informativa">
                <div class="icono-informativo">▤</div>
                <h3>Movimientos</h3>
                <p>Revisa los ingresos, retiros y transferencias de tu cuenta.</p>
                <button type="button" id="inicioMovimientos">Ver movimientos</button>
            </div>
        </div>

        <div class="aviso-informativo">
            <strong>Seguridad NOVA BANK:</strong>
            recuerda mantener tus datos de acceso protegidos y cerrar tu sesión
            cuando termines de utilizar la plataforma.
        </div>
    `;

    document.getElementById("inicioCuentas")
        .addEventListener("click", consultarCuentas);

    document.getElementById("inicioTransferencias")
        .addEventListener("click", mostrarTransferencias);

    document.getElementById("inicioMovimientos")
        .addEventListener("click", consultarMovimientos);
}

// VERIFICAR SESIÓN

async function verificarSesion() {
    try {
        const respuesta = await fetch("/api/privadas/cliente", {
            credentials: "include"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            window.location.href = "cliente.html";
            return;
        }

        usuarioActual = datos.usuario;
        actualizarDatosUsuario(usuarioActual);
        mostrarInicio();

    } catch (error) {
        console.error("Error al verificar la sesión:", error);
        resultado.innerHTML = `
            <div class="aviso-informativo">
                No se pudo conectar con el servidor. Intenta nuevamente.
            </div>
        `;
    }
}

// CONSULTAR CUENTAS

async function consultarCuentas() {
    marcarOpcionActiva(btnCuentas);

    resultado.innerHTML = `
        <div class="encabezado-contenido">
            <span class="subtitulo-contenido">Información bancaria</span>
            <h2>Mis cuentas</h2>
            <p>Consulta tus cuentas y el dinero disponible.</p>
        </div>
        <p>Consultando tus cuentas...</p>
    `;

    try {
        const respuesta = await fetch("/api/cuentas", {
            credentials: "include"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.innerHTML = `
                <div class="aviso-informativo">
                    ${escaparHTML(datos.mensaje || "No se pudieron consultar las cuentas.")}
                </div>
            `;
            return;
        }

        if (!datos.cuentas || datos.cuentas.length === 0) {
            resultado.innerHTML = `
                <div class="encabezado-contenido">
                    <h2>Mis cuentas</h2>
                    <p>No tienes cuentas registradas.</p>
                </div>
            `;
            return;
        }

        resultado.innerHTML = `
            <div class="encabezado-contenido">
                <span class="subtitulo-contenido">Información bancaria</span>
                <h2>Mis cuentas</h2>
                <p>Este es el resumen de tus cuentas registradas.</p>
            </div>

            ${datos.cuentas.map(cuenta => `
                <div class="cuenta">
                    <h3>Cuenta ${escaparHTML(cuenta.tipo_cuenta)}</h3>
                    <p><strong>Número:</strong> ${escaparHTML(cuenta.numero_cuenta)}</p>
                    <p><strong>Saldo disponible:</strong> ${formatoDinero(cuenta.saldo)}</p>
                </div>
            `).join("")}
        `;

    } catch (error) {
        console.error("Error al consultar las cuentas:", error);
        resultado.innerHTML = `
            <div class="aviso-informativo">
                Ocurrió un error al consultar tus cuentas.
            </div>
        `;
    }
}

// CONSULTAR MOVIMIENTOS

async function consultarMovimientos() {
    marcarOpcionActiva(btnMovimientos);

    resultado.innerHTML = `
        <div class="encabezado-contenido">
            <span class="subtitulo-contenido">Historial bancario</span>
            <h2>Mis movimientos</h2>
            <p>Consultando el historial de tu cuenta...</p>
        </div>
    `;

    try {
        const respuesta = await fetch("/api/movimientos", {
            credentials: "include"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.innerHTML = `
                <div class="aviso-informativo">
                    ${escaparHTML(datos.mensaje || "No se pudieron consultar los movimientos.")}
                </div>
            `;
            return;
        }

        if (!datos.movimientos || datos.movimientos.length === 0) {
            resultado.innerHTML = `
                <div class="encabezado-contenido">
                    <h2>Mis movimientos</h2>
                    <p>Todavía no tienes movimientos registrados.</p>
                </div>
            `;
            return;
        }

        resultado.innerHTML = `
            <div class="encabezado-contenido">
                <span class="subtitulo-contenido">Historial bancario</span>
                <h2>Mis movimientos</h2>
                <p>Estos son los movimientos registrados en tu cuenta.</p>
            </div>

            <div class="lista-movimientos">
                ${datos.movimientos.map(movimiento => `
                    <div class="movimiento">
                        <h3>${escaparHTML(movimiento.tipo)}</h3>
                        <p><strong>Descripción:</strong> ${escaparHTML(movimiento.descripcion)}</p>
                        <p><strong>Valor:</strong> ${formatoDinero(movimiento.monto)}</p>
                        <p><strong>Saldo resultante:</strong> ${formatoDinero(movimiento.saldo_resultante)}</p>
                        <p><strong>Fecha:</strong> ${escaparHTML(
                            new Date(movimiento.fecha).toLocaleString("es-CO")
                        )}</p>
                    </div>
                `).join("")}
            </div>
        `;

    } catch (error) {
        console.error("Error al consultar movimientos:", error);
        resultado.innerHTML = `
            <div class="aviso-informativo">
                Ocurrió un error al consultar tus movimientos.
            </div>
        `;
    }
}

// MOSTRAR FORMULARIO DE TRANSFERENCIAS

function mostrarTransferencias() {
    marcarOpcionActiva(btnTransferencias);

    resultado.innerHTML = `
        <div class="encabezado-contenido">
            <span class="subtitulo-contenido">Operaciones bancarias</span>
            <h2>Realizar transferencia</h2>
            <p>Envía dinero a otra cuenta de NOVA BANK.</p>
        </div>

        <div class="cuenta">
            <label for="cuentaDestino">Número de cuenta de destino</label>
            <input
                type="text"
                id="cuentaDestino"
                placeholder="Ejemplo: 100000000001"
            >

            <label for="montoTransferencia">Valor a transferir</label>
            <input
                type="number"
                id="montoTransferencia"
                placeholder="Ingresa el valor"
                min="1"
            >

            <label for="descripcionTransferencia">Descripción</label>
            <input
                type="text"
                id="descripcionTransferencia"
                placeholder="Motivo de la transferencia"
            >

            <button type="button" id="btnEnviarTransferencia">
                Enviar transferencia
            </button>

            <p id="mensajeTransferencia"></p>
        </div>
    `;

    document.getElementById("btnEnviarTransferencia")
        .addEventListener("click", realizarTransferencia);
}

// REALIZAR TRANSFERENCIA

async function realizarTransferencia() {
    const numeroCuenta = document.getElementById("cuentaDestino").value.trim();
    const monto = document.getElementById("montoTransferencia").value;
    const descripcion = document.getElementById("descripcionTransferencia").value.trim();

    const mensaje = document.getElementById("mensajeTransferencia");
    const boton = document.getElementById("btnEnviarTransferencia");

    if (!numeroCuenta || !monto) {
        mensaje.textContent = "Completa el número de cuenta y el valor.";
        mensaje.className = "mensaje-error";
        return;
    }

    if (Number(monto) <= 0 || !Number.isFinite(Number(monto))) {
        mensaje.textContent = "Ingresa un valor válido mayor que cero.";
        mensaje.className = "mensaje-error";
        return;
    }

    boton.disabled = true;
    mensaje.textContent = "Procesando transferencia...";
    mensaje.className = "";

    try {
        const respuesta = await fetch("/api/transferencias", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                numero_cuenta_destino: numeroCuenta,
                monto: Number(monto),
                descripcion: descripcion
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || "No se pudo realizar la transferencia.";
            mensaje.className = "mensaje-error";
            return;
        }

        mensaje.textContent =
            `${datos.mensaje}. Nuevo saldo: ${formatoDinero(datos.saldo_origen)}`;

        mensaje.className = "mensaje-exito";

    } catch (error) {
        console.error("Error al realizar transferencia:", error);
        mensaje.textContent = "Ocurrió un error al procesar la transferencia.";
        mensaje.className = "mensaje-error";

    } finally {
        boton.disabled = false;
    }
}

// MOSTRAR PERFIL

async function mostrarPerfil() {
    marcarOpcionActiva(btnPerfil);

    resultado.innerHTML = `
        <div class="encabezado-contenido">
            <span class="subtitulo-contenido">Mi información</span>
            <h2>Mi perfil</h2>
            <p>Consulta y actualiza tus datos personales.</p>
        </div>
        <p>Cargando información...</p>
    `;

    try {
        const respuesta = await fetch("/api/auth/perfil", {
            credentials: "include"
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.innerHTML = `
                <div class="aviso-informativo">
                    ${escaparHTML(datos.mensaje || "No se pudo cargar tu perfil.")}
                </div>
            `;
            return;
        }

        const perfil = datos.usuario;

        resultado.innerHTML = `
            <div class="encabezado-contenido">
                <span class="subtitulo-contenido">Mi información</span>
                <h2>Mi perfil</h2>
                <p>Mantén tus datos personales actualizados.</p>
            </div>

            <div class="cuenta">
                <label for="perfilNombre">Nombre</label>
                <input type="text" id="perfilNombre" value="${escaparHTML(perfil.nombre)}">

                <label for="perfilApellido">Apellido</label>
                <input type="text" id="perfilApellido" value="${escaparHTML(perfil.apellido)}">

                <label for="perfilCorreo">Correo electrónico</label>
                <input type="email" id="perfilCorreo" value="${escaparHTML(perfil.correo)}">

                <label for="perfilTelefono">Teléfono</label>
                <input type="text" id="perfilTelefono" value="${escaparHTML(perfil.telefono)}">

                <button type="button" id="btnGuardarPerfil">
                    Guardar cambios
                </button>

                <button type="button" id="btnMostrarPassword">
                    Cambiar contraseña
                </button>

                <p id="mensajePerfil"></p>
            </div>
        `;

        document.getElementById("btnGuardarPerfil")
            .addEventListener("click", actualizarPerfil);

        document.getElementById("btnMostrarPassword")
            .addEventListener("click", mostrarCambioPassword);

    } catch (error) {
        console.error("Error al consultar el perfil:", error);
        resultado.innerHTML = `
            <div class="aviso-informativo">
                Ocurrió un error al cargar tu perfil.
            </div>
        `;
    }
}

// ACTUALIZAR PERFIL

async function actualizarPerfil() {
    const nombre = document.getElementById("perfilNombre").value.trim();
    const apellido = document.getElementById("perfilApellido").value.trim();
    const correo = document.getElementById("perfilCorreo").value.trim();
    const telefono = document.getElementById("perfilTelefono").value.trim();

    const mensaje = document.getElementById("mensajePerfil");
    const boton = document.getElementById("btnGuardarPerfil");

    if (!nombre || !apellido || !correo) {
        mensaje.textContent = "Completa el nombre, apellido y correo.";
        mensaje.className = "mensaje-error";
        return;
    }

    boton.disabled = true;

    try {
        const respuesta = await fetch("/api/auth/perfil", {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre,
                apellido,
                correo,
                telefono
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || "No se pudieron guardar los cambios.";
            mensaje.className = "mensaje-error";
            return;
        }

        mensaje.textContent = datos.mensaje || "Tus datos se actualizaron correctamente.";
        mensaje.className = "mensaje-exito";

        if (datos.usuario) {
            usuarioActual = datos.usuario;
            actualizarDatosUsuario(usuarioActual);
        } else {
            actualizarDatosUsuario({ nombre, apellido });
        }

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        mensaje.textContent = "Ocurrió un error al guardar los cambios.";
        mensaje.className = "mensaje-error";

    } finally {
        boton.disabled = false;
    }
}

// MOSTRAR FORMULARIO PARA CAMBIAR CONTRASEÑA

function mostrarCambioPassword() {
    resultado.innerHTML = `
        <div class="encabezado-contenido">
            <span class="subtitulo-contenido">Seguridad de la cuenta</span>
            <h2>Cambiar contraseña</h2>
            <p>Utiliza una contraseña segura que no compartas con otras personas.</p>
        </div>

        <div class="cuenta">
            <label for="passwordActual">Contraseña actual</label>
            <input type="password" id="passwordActual" placeholder="Contraseña actual">

            <label for="passwordNueva">Nueva contraseña</label>
            <input type="password" id="passwordNueva" placeholder="Mínimo 8 caracteres">

            <label for="passwordConfirmar">Confirmar nueva contraseña</label>
            <input type="password" id="passwordConfirmar" placeholder="Repite la nueva contraseña">

            <button type="button" id="btnGuardarPassword">
                Actualizar contraseña
            </button>

            <p id="mensajePassword"></p>
        </div>
    `;

    document.getElementById("btnGuardarPassword")
        .addEventListener("click", cambiarPassword);
}

// CAMBIAR CONTRASEÑA

async function cambiarPassword() {
    const passwordActual = document.getElementById("passwordActual").value;
    const passwordNueva = document.getElementById("passwordNueva").value;
    const passwordConfirmar = document.getElementById("passwordConfirmar").value;

    const mensaje = document.getElementById("mensajePassword");
    const boton = document.getElementById("btnGuardarPassword");

    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
        mensaje.textContent = "Completa todos los campos.";
        mensaje.className = "mensaje-error";
        return;
    }

    if (passwordNueva.length < 8) {
        mensaje.textContent = "La nueva contraseña debe tener mínimo 8 caracteres.";
        mensaje.className = "mensaje-error";
        return;
    }

    if (passwordNueva !== passwordConfirmar) {
        mensaje.textContent = "Las contraseñas nuevas no coinciden.";
        mensaje.className = "mensaje-error";
        return;
    }

    boton.disabled = true;

    try {
        const respuesta = await fetch("/api/auth/cambiar-password", {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                passwordActual,
                passwordNueva
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || "No se pudo cambiar la contraseña.";
            mensaje.className = "mensaje-error";
            return;
        }

        mensaje.textContent = datos.mensaje || "Tu contraseña se actualizó correctamente.";
        mensaje.className = "mensaje-exito";

    } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        mensaje.textContent = "Ocurrió un error al cambiar la contraseña.";
        mensaje.className = "mensaje-error";

    } finally {
        boton.disabled = false;
    }
}

// NAVEGACIÓN DEL MENÚ

if (btnInicio) {
    btnInicio.addEventListener("click", mostrarInicio);
}

btnCuentas.addEventListener("click", consultarCuentas);
btnMovimientos.addEventListener("click", consultarMovimientos);
btnTransferencias.addEventListener("click", mostrarTransferencias);
btnPerfil.addEventListener("click", mostrarPerfil);

// CERRAR SESIÓN

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

        window.location.href = "cliente.html";

    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Error al cerrar sesión.");
    }
});

// INICIAR PANEL

verificarSesion();
