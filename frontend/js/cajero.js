

const numeroCuenta = document.getElementById("numeroCuenta");
const pin = document.getElementById("pin");

const teclas = document.querySelectorAll(".tecla");

let campoActivo = numeroCuenta;

numeroCuenta.addEventListener("focus", () => {
    campoActivo = numeroCuenta;
});

pin.addEventListener("focus", () => {
    campoActivo = pin;
});

teclas.forEach(tecla => {

    tecla.addEventListener("mousedown", (evento) => {
        evento.preventDefault();
    });

    tecla.addEventListener("click", () => {

        const numero = tecla.dataset.numero;
        const accion = tecla.dataset.accion;

        if (accion === "limpiar") {
            campoActivo.value = "";
            return;
        }

        if (accion === "borrar") {
            campoActivo.value = campoActivo.value.slice(0, -1);
            return;
        }

        if (numero !== undefined) {

            const limite = campoActivo === pin ? 4 : 20;

            if (campoActivo.value.length < limite) {
                campoActivo.value += numero;
            }
        }
    });

});

const btnIngresar = document.getElementById("btnIngresar");
const mensaje = document.getElementById("mensaje");

btnIngresar.addEventListener("click", async () => {

    const cuenta = numeroCuenta.value.trim();
    const clave = pin.value.trim();

    if (!cuenta || !clave) {
        mensaje.textContent = "Por favor, completa todos los campos.";
        return;
    }

    if (!/^\d{4}$/.test(clave)) {
        mensaje.textContent = "El PIN debe tener exactamente 4 números.";
        return;
    }

    btnIngresar.disabled = true;
    btnIngresar.textContent = "VERIFICANDO...";
    mensaje.textContent = "";

    try {
        const respuesta = await fetch("/api/cajero/ingresar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                numero_cuenta: cuenta,
                pin: clave
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || "No fue posible ingresar.";
            return;
        }

        mensaje.style.color = "#16834a";
        mensaje.textContent = datos.mensaje || "Ingreso exitoso.";

        // Guardamos la información básica para mostrarla en la siguiente pantalla.
        sessionStorage.setItem("cajeroUsuario", JSON.stringify(datos));

        window.location.href = "cajero-menu.html";

    } catch (error) {
        console.error("Error al ingresar al cajero:", error);
        mensaje.textContent = "No se pudo conectar con el servidor.";
    } finally {
        btnIngresar.disabled = false;
        btnIngresar.textContent = "INGRESAR AL CAJERO";
    }
});
