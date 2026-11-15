
const email = document.getElementById("email");
const password = document.getElementById("password");
const btnIngresar = document.getElementById("btnIngresar");
const mensaje = document.getElementById("mensaje");

btnIngresar.addEventListener("click", async () => {

    const correo = email.value.trim();
    const clave = password.value.trim();

    if (!correo || !clave) {
        mensaje.style.color = "#c0392b";
        mensaje.textContent = "Por favor, completa todos los campos.";
        return;
    }

    btnIngresar.disabled = true;
    btnIngresar.textContent = "VERIFICANDO...";
    mensaje.textContent = "";

    try {

        const respuesta = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                correo: correo,
                password: clave
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.style.color = "#c0392b";
            mensaje.textContent = datos.mensaje || "No fue posible iniciar sesión.";
            return;
        }

        if (!datos.usuario || datos.usuario.rol !== "cliente") {
            mensaje.style.color = "#c0392b";
            mensaje.textContent = "Este acceso es exclusivo para clientes.";
            return;
        }

        mensaje.style.color = "#16834a";
        mensaje.textContent = "Bienvenido a NOVA BANK.";

        window.location.href = "cliente-menu.html";

    } catch (error) {

        console.error("Error al iniciar sesión:", error);

        mensaje.style.color = "#c0392b";
        mensaje.textContent = "No se pudo conectar con el servidor.";

    } finally {

        btnIngresar.disabled = false;
        btnIngresar.textContent = "INGRESAR";

    }

});
