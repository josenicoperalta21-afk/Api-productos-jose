//Este archivo contien la  logica de ñl aplicacion
//5 procediemintons : BUSCAR, LISTAR, REGISTRAR ,ACTUALIZAR , ELIMINAR

//Paso 01
//const objeto = require('')//Todas las funciones
//const {objeto}=required = required('')//Solo algunas funciones
const { pool } = require("../config/database"); //Importar la conexion a la base de datos
const CAMPOS = "id,marca,descripcion,precio,stock";
//todas las funciones deben ser asincronas(tardaran un timepo en ser resultadas)
//milisegunod,segundno (1000=1seg)
const validarCampos = (datos = {}) => {
  const { marca, descripcion, precio, stock } = datos || {};
  const errores = [];
  if (typeof marca !== "string" || marca.trim() === "")
    errores.push("La marca es obligatoria");
  if (typeof descripcion !== "string" || descripcion.trim() === "")
    errores.push("La descripción es necesaria");
  if (typeof precio !== "number" || !Number.isFinite(precio) || precio < 0)
    errores.push("Verifique el precio");
  if (!Number.isInteger(stock) || stock < 0)
    errores.push("Error en el stock");

  //Es posible tener mas de un error
  return errores;
};
const listarProductos = async (req, res) => {
  try {
    const [productos] = await pool.query(
      `SELECT * FROM productos ORDER BY id ASC`,
    );
    res.status(200).json({
      ok: true,
      total: productos.length,
      data: productos,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
//BUSCAR ¿COMO FUNCIONA?
//API REST => http://miaplicacion.com/api/productos/1
const obtenerProductos = async (req, res) => {
  try {
    //Req.params => representa lso parametros enviado por l aURL
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID no puede ser negativo o cero",
      });
    }
    //Si podemons buscar
    //utilizaremos EXECUTE porque pasaremos paramtros
    //Evitaremos lo SQLinjection (tecnico hackeo)
    const [registro] = await pool.execute(
      `SELECT* FROM productos WHERE id = ?`,
      [id],
    );

    if (registro.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No existe el producto",
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
const crearProductos = async (req, res) => {
  try {
    const errores = validarCampos(req.body); //req.body contien todods los datos a registrar
    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Verfifique los datos solicitados",
        errores,
      });
    }
    //procedemos a guardar los datos
    const { marca, descripcion, precio, stock } = req.body;
    const consulta = `INSERT INTO productos
(marca,descripcion,precio,stock)
VALUES(?,?,?,?)`;
    const [registro] = await pool.execute(consulta, [
      marca,
      descripcion,
      precio,
      stock,
    ]);
    res.status(201).json({
      ok: true,
      message: "Producto registrado correctamente",
      data: {
        id: registro.insertId,
        marca,
        descripcion,
        precio,
        stock,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
const actualizarProductos = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID no puede ser negativo o cero",
      });
    }
    //validar los campos (crear producto)
    const errores = validarCampos(req.body); //req.body contien todods los datos a registrar
    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Verfifique los datos solicitados",
        errores,
      });
    }
    const [existe] = await pool.execute(
      `SELECT id FROM productos WHERE id = ?`,
      [id],
    );
    if (existe.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "El id no existe",
      });
    }
    const consulta = `UPDATE productos SET marca=?,descripcion=?,precio=?,stock=? WHERE id=?`;
    const { marca, descripcion, precio, stock } = req.body;
    const [resultado] = await pool.execute(consulta, [
      marca,
      descripcion,
      precio,
      stock,
      id,
    ]);
    res.status(200).json({
      ok: true,
      filasAfectadas: resultado.affectedRows,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
const eliminarProductos = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID no puede ser negativo o cero",
      });
    }

    const [registro] = await pool.execute(
      `SELECT * FROM productos WHERE id = ?`,
      [id],
    );

    if (registro.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No existe el producto",
      });
    }

    await pool.execute(`DELETE FROM productos WHERE id = ?`, [id]);

    res.status(200).json({
      ok: true,
      message: "Producto eliminado correctamente",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

//Todos los metodos deben ser exportados (se utilizran desde la app)
//El que lo utilizaara sera "routes"
module.exports = {
  listarProductos,
  obtenerProductos,
  crearProductos,
  actualizarProductos,
  eliminarProductos,
};
