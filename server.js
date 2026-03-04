const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   VARIABLES EN MEMORIA
========================= */

let jugadores = {};     // { nick: { puntos: number } }
let intentos = {};      // { "nick_bloque_juego": cantidad }
let jackpot = 0;

/* =========================
   FUNCIONES INTERNAS
========================= */

function bloqueActual() {
  return Math.floor(Date.now() / (15 * 60 * 1000)); // 15 minutos
}

/* =========================
   RUTAS
========================= */

/* Registro jugador */
app.post("/registrar", (req, res) => {
  const { nick } = req.body;

  if (!nick || nick.trim() === "") {
    return res.status(400).json({ error: "Nick requerido" });
  }

  if (!jugadores[nick]) {
    jugadores[nick] = { puntos: 0 };
  }

  res.json({ ok: true });
});

/* Jugar */
app.post("/jugar", (req, res) => {
  const { nick, juego, puntos } = req.body;

  if (!nick || juego === undefined) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  if (!jugadores[nick]) {
    return res.status(400).json({ error: "Jugador no registrado" });
  }

  const bloque = bloqueActual();
  const key = `${nick}_${bloque}_${juego}`;

  if (!intentos[key]) {
    intentos[key] = 0;
  }

  if (intentos[key] >= 3) {
    return res.json({ error: "Sin intentos disponibles" });
  }

  intentos[key]++;

  if (puntos && puntos > 0) {
    jugadores[nick].puntos += puntos;
    jackpot += 5; // acumulación base
  }

  res.json({
    ok: true,
    intentosRestantes: 3 - intentos[key],
    jackpot
  });
});

/* Ranking */
app.get("/ranking", (req, res) => {
  const lista = Object.entries(jugadores)
    .map(([nick, data]) => ({
      nick,
      puntos: data.puntos
    }))
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, 10);

  res.json(lista);
});

/* Jackpot */
app.get("/jackpot", (req, res) => {
  res.json({ jackpot });
});

/* Ruta raíz (IMPORTANTE para Render) */
app.get("/", (req, res) => {
  res.send("API Radio Luna activa 🌙");
});

/* =========================
   INICIAR SERVIDOR
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor activo en puerto " + PORT);
});
