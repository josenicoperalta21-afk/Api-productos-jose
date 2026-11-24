//necesito
const app = require("./app");
const { port } = require("./config/env");
const { probarConexion } = require("./config/database");

const iniciarServidor = async () => {
  try {
    await probarConexion();
    console.log("Conexión a MYSQL exitosa :3");

    app.listen(port, () => {
      console.log(`Servidor iniciado en el puerto http://localhost:${port}`);
    });
  } catch (e) {
    console.error("no podemos conectarnos a MYSQL:", e.message);
    process.exit(1);
  }
};
iniciarServidor();
