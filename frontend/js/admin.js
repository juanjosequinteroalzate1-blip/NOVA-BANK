
const correo = document.getElementById("correo");
const password = document.getElementById("password");
const btnIngresar = document.getElementById("btnIngresar");
const mensaje = document.getElementById("mensaje");

btnIngresar.addEventListener("click", async () => {

    const correoValor = correo.value.trim();
    const passwordValor = password.value.trim();

    if (!correoValor || !passwordValor) {
        mensaje.textContent = "Completa todos los campos.";
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
                correo: correoValor,
                password: passwordValor
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent =
                datos.mensaje || "No fue posible iniciar sesión.";
            return;
        }

        if (!datos.usuario || datos.usuario.rol !== "admin") {
            mensaje.textContent =
                "Este acceso es exclusivo para administradores.";
            return;
        }

        window.location.href = "admin-menu.html";

    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        mensaje.textContent = "No se pudo conectar con el servidor.";

    } finally {
        btnIngresar.disabled = false;
        btnIngresar.textContent = "INGRESAR";
    }

});
