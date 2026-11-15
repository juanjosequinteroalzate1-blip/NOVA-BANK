# NOVA BANK
### Simulador Bancario Web

## Descripción del proyecto

NOVA BANK es un simulador bancario web desarrollado como proyecto académico. Su objetivo es representar el funcionamiento básico de una entidad bancaria mediante una aplicación que permite gestionar clientes, cuentas y operaciones financieras.

El sistema cuenta con tres módulos principales: banca virtual para clientes, administración bancaria y cajero automático. Los tres módulos trabajan con una misma base de datos MySQL.

## Equipo de trabajo

- Juan José
- Felipe González

## Tecnologías utilizadas

- Node.js
- Express.js
- MySQL
- HTML5
- CSS3
- JavaScript
- Bootstrap

## Funcionalidades principales

### 1. Banca virtual para clientes

- Inicio y cierre de sesión.
- Consulta de saldo y datos de la cuenta.
- Consulta del historial de movimientos.
- Transferencias entre cuentas.
- Actualización de información personal.
- Cambio de contraseña.

### 2. Módulo de administración

- Registro y consulta de clientes.
- Edición de información de clientes.
- Bloqueo y activación de clientes.
- Consulta de cuentas bancarias.
- Registro de depósitos.
- Consulta de movimientos generales.
- Panel con estadísticas del banco.

### 3. Cajero automático

- Inicio de sesión mediante número de cuenta y PIN.
- Consulta de saldo.
- Retiro de dinero.
- Consulta de últimos movimientos.
- Finalización de la operación.

## Estructura del proyecto

```text
NOVA-BANK/
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       └── app.js
│
├── frontend/
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── admin.html
│   ├── cliente.html
│   └── cajero.html
│
├── database.sql
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Requisitos para ejecutar el proyecto

- Node.js y npm.
- MySQL Server.
- Visual Studio Code (recomendado).
- Navegador web.

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/juanjosequinteroalzate1-blip/NOVA-BANK.git
```

### 2. Entrar a la carpeta

```bash
cd NOVA-BANK
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Crear la base de datos

En MySQL, importar el archivo `database.sql` para crear la base de datos y sus tablas.

### 5. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_MYSQL
DB_NAME=nova_bank
DB_PORT=3306
SESSION_SECRET=TU_CLAVE_DE_SESION
```

Reemplazar los valores de ejemplo por los datos correspondientes al entorno local.

### 6. Ejecutar el proyecto

Desde la carpeta principal, ejecutar:

```bash
node backend/src/app.js
```

### 7. Abrir la aplicación

Ingresar desde el navegador a:

http://localhost:3000

## Base de datos

El proyecto utiliza MySQL y cuenta con las siguientes tablas principales:

- `usuarios`
- `cuentas`
- `movimientos`
- `transferencias`

Estas tablas permiten almacenar los usuarios del sistema, sus cuentas bancarias y las operaciones realizadas.

## Seguridad

- Contraseñas protegidas mediante hash.
- PIN almacenado de forma protegida.
- Variables de entorno para las credenciales.
- Validación de operaciones bancarias.
- Control de acceso a las funcionalidades privadas.
- Restricciones para evitar operaciones con saldos insuficientes.

## Estado del proyecto

El sistema cuenta con los tres módulos implementados y se realizaron pruebas funcionales de registro de clientes, consulta de saldos, transferencias, retiros desde cajero y depósitos administrativos.

## Repositorio

https://github.com/juanjosequinteroalzate1-blip/NOVA-BANK

---

**NOVA BANK – Proyecto académico de desarrollo web.**