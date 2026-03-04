const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let jugadores = {};
let intentos = {};
let jackpot = 0;

function bloqueActual(){
return Math.floor(Date.now()/(15*60*1000));
}

app.post("/registrar",(req,res)=>{
const {nick} = req.body;
if(!nick) return res.status(400).json({error:"Nick requerido"});

if(!jugadores[nick]){
jugadores[nick] = { puntos:0 };
}

res.json({ok:true});
});

app.post("/jugar",(req,res)=>{
const {nick,juego,puntos} = req.body;

if(!nick || juego===undefined)
return res.status(400).json({error:"Datos inválidos"});

let bloque = bloqueActual();
let key = `${nick}_${bloque}_${juego}`;

if(!intentos[key]) intentos[key]=0;

if(intentos[key] >= 3)
return res.json({error:"Sin intentos"});

intentos[key]++;

if(puntos > 0){
jugadores[nick].puntos += puntos;
jackpot += 5;
}

res.json({
ok:true,
intentosRestantes: 3 - intentos[key],
jackpot
});
});

app.get("/ranking",(req,res)=>{
let lista = Object.entries(jugadores)
.map(([nick,data])=>({nick,puntos:data.puntos}))
.sort((a,b)=>b.puntos-a.puntos)
.slice(0,10);

res.json(lista);
});

app.get("/jackpot",(req,res)=>{
res.json({jackpot});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log("Servidor activo"));
