//APP = aplicacion 
const path = require("path");
const express = require("express"); //Framework
const routes = require("./routes"); //Rutas

const app = express();

app.use((req, res, next) => {
  const origin = req.get("Origin");
  const isLocalOrigin =
    origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

  if (isLocalOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS",
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(isLocalOrigin ? 204 : 403);
  }

  next();
});

//Middleware para parsear el body de las peticiones
app.use(express.json()); //Comunicaon es JSON
//Se sirve toda la carpeta public (aqui esta index.html)
app.use(express.static(path.join(__dirname, "..", "public")));
//Habilitamos las rutas de todos los moduelos (index.js)
app.use("/api", routes);
module.exports = app;