
const resultado = document.getElementById("resultado");

const btnSaldo = document.getElementById("btnSaldo");
const btnRetirar = document.getElementById("btnRetirar");
const btnMovimientos = document.getElementById("btnMovimientos");
const btnCerrar = document.getElementById("btnCerrar");

// Consultar saldo

// Consultar saldo
btnSaldo.addEventListener("click", async () => {
    resultado.textContent = "Consultando saldo...";

    try {
        const respuesta = await fetch(
            "http://localhost:3000/api/cajero/saldo",
            { credentials: "include" }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.textContent =
                datos.mensaje || "No se pudo consultar el saldo.";
            return;
        }

        const saldo = Number(datos.cuenta.saldo);

        resultado.innerHTML = `
            <h3>Saldo disponible</h3>
            <p class="valor">
                $${saldo.toLocaleString("es-CO")}
            </p>
            <p>Cuenta: ${datos.cuenta.numero_cuenta}</p>
            <p>Tipo: ${datos.cuenta.tipo_cuenta}</p>
        `;

    } catch (error) {
        console.error(error);
        resultado.textContent = "No se pudo conectar con el servidor.";
    }
});

// Realizar retiro
btnRetirar.addEventListener("click", () => {
    resultado.innerHTML = `
        <h3>Retirar dinero</h3>
        <p>Ingresa el valor que deseas retirar.</p>
        <input type="number" id="valorRetiro" placeholder="Valor del retiro">
        <button id="confirmarRetiro">Confirmar retiro</button>
        <p id="mensajeRetiro"></p>
    `;

    document.getElementById("confirmarRetiro").addEventListener("click", realizarRetiro);
});

async function realizarRetiro() {
    const monto = Number(document.getElementById("valorRetiro").value);
    const mensaje = document.getElementById("mensajeRetiro");

    if (!Number.isFinite(monto) || monto <= 0) {
        mensaje.textContent = "Ingresa un valor mayor que cero.";
        return;
    }

    mensaje.textContent = "Procesando retiro...";

    try {
        const respuesta = await fetch(
            "http://localhost:3000/api/cajero/retirar",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ monto })
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || "No se pudo realizar el retiro.";
            return;
        }

        mensaje.textContent =
           `Retiro exitoso. Nuevo saldo: $${Number(datos.nuevo_saldo).toLocaleString("es-CO")}`;
    } catch (error) {
        console.error(error);
        mensaje.textContent = "Error de conexión con el servidor.";
    }
}

// Consultar últimos movimientos
btnMovimientos.addEventListener("click", async () => {
    resultado.textContent = "Consultando movimientos...";

    try {
        const respuesta = await fetch(
            "http://localhost:3000/api/cajero/movimientos",
            { credentials: "include" }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.textContent =
                datos.mensaje || "No se pudieron consultar los movimientos.";
            return;
        }

        const movimientos = datos.movimientos;

        if (!Array.isArray(movimientos) || movimientos.length === 0) {
            resultado.innerHTML = "<p>No hay movimientos registrados.</p>";
            return;
        }

        resultado.innerHTML = `
            <h3>Últimos movimientos</h3>
            <div class="lista-movimientos">
                ${movimientos.map(movimiento => `
                    <div class="movimiento">
                        <strong>${movimiento.tipo.toUpperCase()}</strong>
                        <p>${movimiento.descripcion}</p>
                        <p>Valor: $${Number(movimiento.monto).toLocaleString("es-CO")}</p>
                        <p>Saldo restante: $${Number(movimiento.saldo_resultante).toLocaleString("es-CO")}</p>
                        <small>${new Date(movimiento.fecha).toLocaleString("es-CO")}</small>
                    </div>
                `).join("")}
            </div>
        `;

    } catch (error) {
        console.error("Error consultando movimientos:", error);
        resultado.textContent = "Error al consultar los movimientos.";
    }
});


// Cerrar operación
btnCerrar.addEventListener("click", async () => {
    if (!confirm("¿Deseas finalizar tu operación en el cajero?")) {
        return;
    }

    try {
        const respuesta = await fetch(
            "http://localhost:3000/api/cajero/cerrar",
            {
                method: "POST",
                credentials: "include"
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.textContent = datos.mensaje || "No se pudo cerrar la operación.";
            return;
        }

        sessionStorage.removeItem("cajeroUsuario");
        window.location.href = "cajero.html";

    } catch (error) {
        console.error(error);
        resultado.textContent = "No se pudo conectar con el servidor.";
    }
});
