//Este archivo contiene la logica de la aplicacion para proveedores
//5 procedimientos: LISTAR, BUSCAR, REGISTRAR, ACTUALIZAR, ELIMINAR

const { pool } = require("../config/database");

//Validamos los datos que llegan desde el cliente antes de guardar o actualizar
const validarCampos = ({ razonsocial, contacto, ruc, direccion } = {}) => {
  const errores = [];

  if (!razonsocial || razonsocial.trim() === "")
    errores.push("La razón social es obligatoria");
  if (!contacto || contacto.trim() === "")
    errores.push("El contacto es obligatorio");
  if (!ruc || !/^\d{11}$/.test(String(ruc).trim()))
    errores.push("El RUC debe tener 11 dígitos numéricos");
  if (!direccion || direccion.trim() === "")
    errores.push("La dirección es obligatoria");

  return errores;
};

const validarId = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id) || id <= 0) {
    res.status(400).json({
      ok: false,
      message: "El ID no puede ser negativo, cero o texto",
    });
    return null;
  }
  return id;
};

const errorServidor = (e, res) => {
  console.error(e);
  res.status(500).json({ ok: false, message: "Error interno del servidor" });
};

//LISTAR TODOS
const listarProveedores = async (req, res) => {
  try {
    const [proveedores] = await pool.query(
      `SELECT * FROM proveedores ORDER BY id ASC`,
    );
    res.status(200).json({
      ok: true,
      total: proveedores.length,
      data: proveedores,
    });
  } catch (e) {
    errorServidor(e, res);
  }
};

//BUSCAR POR ID => /api/proveedores/1
const obtenerProveedores = async (req, res) => {
  try {
    const id = validarId(req, res);
    if (id === null) return;

    const [registro] = await pool.execute(
      `SELECT * FROM proveedores WHERE id = ?`,
      [id],
    );
    if (registro.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No existe el proveedor",
      });
    }
    res.status(200).json({ ok: true, data: registro[0] });
  } catch (e) {
    errorServidor(e, res);
  }
};

//REGISTRAR NUEVO PROVEEDOR
const crearProveedores = async (req, res) => {
  try {
    const errores = validarCampos(req.body);
    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Verifique los datos solicitados",
        errores,
      });
    }

    const { razonsocial, contacto, ruc, direccion } = req.body;
    const [registro] = await pool.execute(
      `INSERT INTO proveedores (razonsocial, contacto, ruc, direccion)
       VALUES (?, ?, ?, ?)`,
      [razonsocial, contacto, String(ruc).trim(), direccion],
    );
    res.status(201).json({ ok: true, id: registro.insertId });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        ok: false,
        message: "El RUC ya se encuentra registrado",
      });
    }
    errorServidor(e, res);
  }
};

//ACTUALIZAR PROVEEDOR EXISTENTE
const actualizarProveedores = async (req, res) => {
  try {
    const id = validarId(req, res);
    if (id === null) return;

    const errores = validarCampos(req.body);
    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Verifique los datos solicitados",
        errores,
      });
    }

    const [existe] = await pool.execute(
      `SELECT id FROM proveedores WHERE id = ?`,
      [id],
    );
    if (existe.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "El id del proveedor no existe",
      });
    }

    const { razonsocial, contacto, ruc, direccion } = req.body;
    const [resultado] = await pool.execute(
      `UPDATE proveedores SET razonsocial=?, contacto=?, ruc=?, direccion=? WHERE id=?`,
      [razonsocial, contacto, String(ruc).trim(), direccion, id],
    );
    res.status(200).json({ ok: true, filasAfectadas: resultado.affectedRows });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        ok: false,
        message: "Ese RUC ya pertenece a otro proveedor",
      });
    }
    errorServidor(e, res);
  }
};

//ELIMINAR PROVEEDOR
const eliminarProveedores = async (req, res) => {
  try {
    const id = validarId(req, res);
    if (id === null) return;

    const [registro] = await pool.execute(
      `SELECT id FROM proveedores WHERE id = ?`,
      [id],
    );
    if (registro.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No existe el proveedor",
      });
    }

    await pool.execute(`DELETE FROM proveedores WHERE id = ?`, [id]);
    res.status(200).json({
      ok: true,
      message: "Proveedor eliminado correctamente",
    });
  } catch (e) {
    errorServidor(e, res);
  }
};

module.exports = {
  listarProveedores,
  obtenerProveedores,
  crearProveedores,
  actualizarProveedores,
  eliminarProveedores,
};
