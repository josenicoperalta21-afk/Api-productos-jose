//Este archivo contiene la logica de la aplicacion para clientes
//5 procedimientos: BUSCAR, LISTAR, REGISTRAR, ACTUALIZAR, ELIMINAR

const { pool } = require("../config/database"); //Importar la conexion a la base de datos
const CAMPOS = "id,apellidos,nombres,telefono,direccion,email";

//Validamos los datos que llegan desde el cliente antes de guardar o actualizar
const validarCampos = ({
  apellidos,
  nombres,
  telefono,
  direccion,
  email,
} = {}) => {
  const errores = [];

  if (!apellidos || apellidos.trim() === "")
    errores.push("Los apellidos son obligatorios");
  if (!nombres || nombres.trim() === "")
    errores.push("Los nombres son obligatorios");
  if (!telefono || telefono.trim() === "")
    errores.push("El teléfono es obligatorio");
  if (!direccion || direccion.trim() === "")
    errores.push("La dirección es obligatoria");
  if (!email || email.trim() === "" || !email.includes("@"))
    errores.push("El correo electrónico no es válido");

  //Es posible tener mas de un error
  return errores;
};

//LISTAR TODOS
const listarClientes = async (req, res) => {
  try {
    const [clientes] = await pool.query(
      `SELECT * FROM clientes ORDER BY id ASC`,
    );
    +res.status(200).json({
      ok: true,
      total: clientes.length,
      data: clientes,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

//BUSCAR POR ID
//API REST => http://miaplicacion.com
const obtenerClientes = async (req, res) => {
  try {
    //req.params => representa los parametros enviados por la URL
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID no puede ser negativo, cero o texto",
      });
    }

    //Utilizamos EXECUTE porque pasaremos parametros (evita SQL Injection)
    const [registro] = await pool.execute(
      `SELECT * FROM clientes WHERE id = ?`,
      [id],
    );

    if (registro.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No existe el cliente",
      });
    }

    //Si llegamos aqui, entonces si existe el registro
    res.status(200).json({
      ok: true,
      data: registro[0],
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

//REGISTRAR NUEVO CLIENTE
const crearClientes = async (req, res) => {
  try {
    const errores = validarCampos(req.body); //req.body contiene todos los datos a registrar
    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Verifique los datos solicitados",
        errores,
      });
    }

    //Procedemos a guardar los datos
    const { apellidos, nombres, telefono, direccion, email } = req.body;
    const consulta = `INSERT INTO clientes
      (apellidos, nombres, telefono, direccion, email)
      VALUES (?, ?, ?, ?, ?)`;

    const [registro] = await pool.execute(consulta, [
      apellidos,
      nombres,
      telefono,
      direccion,
      email,
    ]);

    res.status(201).json({
      ok: true,
      id: registro.insertId,
    });
  } catch (e) {
    console.error(e);
    //Si el correo ya existe en la base de datos (por el campo UNIQUE)
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        ok: false,
        message: "El correo electrónico ya se encuentra registrado",
      });
    }
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

//ACTUALIZAR CLIENTE EXISTENTE
const actualizarClientes = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID no puede ser negativo, cero o texto",
      });
    }

    //Validar los campos antes de actualizar
    const errores = validarCampos(req.body);
    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Verifique los datos solicitados",
        errores,
      });
    }

    //Verificamos primero si el cliente existe
    const [existe] = await pool.execute(
      `SELECT id FROM clientes WHERE id = ?`,
      [id],
    );
    if (existe.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "El id del cliente no existe",
      });
    }

    const consulta = `UPDATE clientes SET apellidos=?, nombres=?, telefono=?, direccion=?, email=? WHERE id=?`;
    const { apellidos, nombres, telefono, direccion, email } = req.body;
    const [resultado] = await pool.execute(consulta, [
      apellidos,
      nombres,
      telefono,
      direccion,
      email,
      id,
    ]);

    res.status(200).json({
      ok: true,
      filasAfectadas: resultado.affectedRows,
    });
  } catch (e) {
    console.error(e);
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        ok: false,
        message: "Ese correo electrónico ya pertenece a otro cliente",
      });
    }
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

//ELIMINAR CLIENTE
const eliminarClientes = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID no puede ser negativo, cero o texto",
      });
    }

    const [registro] = await pool.execute(
      `SELECT * FROM clientes WHERE id = ?`,
      [id],
    );

    if (registro.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No existe el cliente",
      });
    }

    await pool.execute(`DELETE FROM clientes WHERE id = ?`, [id]);

    res.status(200).json({
      ok: true,
      message: "Cliente eliminado correctamente",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

//Todos los metodos deben ser exportados (se utilizaran desde routes)
module.exports = {
  listarClientes,
  obtenerClientes,
  crearClientes,
  actualizarClientes,
  eliminarClientes,
};
