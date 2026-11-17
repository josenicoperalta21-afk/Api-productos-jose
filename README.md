# API REST
## Sistema para compartir datos de tienda Peru
**Requerimientos**
1. instalacion nodejs(v20 o superior)
2. Acceso a internet (instalar dependencia)
3. Clone al repositorio, y ejecute ```npminstall```
4. Requerimos el archivo ```_.env_```


```bash

PORT=3000
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_CONNECTION_LIMIT=10

```
5. Necesitamos la tabla _productos_
```sql
CREATE TABLE IF NOT EXISTS productos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    precio VARCHAR(100) NOT NULL,
    stock VARCHAR(100) NOT NULL DEFAULT 0,
    create_at DATETIME NOT NULL DEFAULT NOW(),
    update_at DATETIME NULL
) ENGINE=INNODB;
```
6. Ejecutar el proyetco escribiendo : ```node src/server```
7. Utlice Postman [Descargar_Postman](https://www.postman.com/downloads/)  o cualquier softwrae similar pra realizar el TEST









































API REST hecha con **Node.js + Express + MySQL** que administra los módulos de **productos, clientes y proveedores** de la base de datos `tiendaperu`.




































## Tecnologías
Node.js · Express 5 · mysql2 · dotenv · nodemon (desarrollo)

## Estructura
```
database/db.sql              -> script de la BD (3 tablas + 3 registros de prueba c/u)
src/config/                  -> env.js (variables) y database.js (conexión MySQL)
src/controllers/             -> producto / cliente / proveedor .controller.js
src/routes/                  -> producto / cliente / proveedor .routes.js + index.js
src/app.js                   -> configuración de Express
src/server.js                -> arranque del servidor
```

## Instalación y ejecución
1. Clonar: `git clone https://github.com/TU_USUARIO/api-productos.git` y entrar a la carpeta.
2. Instalar dependencias: `npm install`
3. Crear la base de datos: importar `database/db.sql` en MySQL (phpMyAdmin / Workbench / `mysql -u root < database/db.sql`).
4. Crear el archivo `.env` en la raíz (puede copiarse de `.env.example`):
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tiendaperu
DB_CONNECTION_LIMIT=10
```
5. Ejecutar: `npm run dev` (con nodemon) o `npm start`.
6. Abrir `http://localhost:3000/` → debe mostrar *"API REST ejecutandose correctamente"*.

## Endpoints
| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/productos` `/api/clientes` `/api/proveedores` | Listar |
| GET | `/api/{modulo}/:id` | Obtener por id |
| POST | `/api/{modulo}` | Crear |
| PUT | `/api/{modulo}/:id` | Actualizar |
| DELETE | `/api/{modulo}/:id` | Eliminar |

### Ejemplos de body (JSON)
**Cliente:** `{"apellidos":"Lopez Diaz","nombres":"Ana","telefono":"900111222","direccion":"Av. Lima 1","email":"ana@mail.com"}`

**Proveedor:** `{"razonsocial":"Mi Empresa SAC","contacto":"Juan Perez","ruc":"20123456789","direccion":"Jr. Cusco 10"}`

**Producto:** `{"marca":"Sony","descripcion":"Audifonos","precio":150,"stock":5}`

## Autor
Nicolás Peralta
