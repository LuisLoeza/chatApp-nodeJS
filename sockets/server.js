const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const PUERTO = process.PORT || 3000;

const puerto = () => `:${PUERTO}`;

let usuarios = [];
const chats = [];

const hexadecimal = () => (Math.floor(Math.random() * 130) + 125).toString(16);

const nuevoColor = () => `#${hexadecimal()}${hexadecimal()}${hexadecimal()}`;

app.use(express.static(`${__dirname}/public`));

const conexion = async (payload, socket, color) => {
  const idUser = socket.id;
  const { user } = payload;
  let error = false;
  usuarios.forEach(element => {
    error = element.user === user;
    if (error) return false;
  });
  if (error) {
    io.to(idUser).emit('error-registro-usuario', { 
      error: `El usuario <b>${user}</b> esta en uso.`,
      err: error,
    });
  } else {
    usuarios.push({ ...payload, idUser, color });
    io.emit('registro-usuario', usuarios);
  }
};

const desconectar = socket => {
  usuarios = [...usuarios.filter(item => item.idUser !== socket.id)];
  io.emit('registro-usuario', usuarios);
};

const escribiendo = payload => {
  const { data } = payload;
  io.emit('usuario-escribiendo', data ? `El usuario ${data} esta escribiendo...` : '');
};

const mensaje = (payload, color, tipo) => {
  const nuevaData = {...payload, color};
  chats.push(nuevaData);
  if (tipo === 'privado') {
    io.to(payload.idDestino).emit('recibir-mensaje', nuevaData);
  } else {
    io.emit('recibir-mensaje', nuevaData);
  }
};

io.on('connection', socket => {
  let idUser = null;
  const color = nuevoColor();
  socket.on('conectar', payload => conexion(payload, socket, color));
  socket.on('disconnect', () => desconectar(socket));
  socket.on('escribiendo', escribiendo);
  socket.on('mensaje-general', payload => mensaje(payload, color, 'general'));
  socket.on('mensaje-privado', payload => mensaje(payload, color, 'privado'));
});

server.listen(PUERTO, () => {
  console.log(`127.0.0.1${puerto()}`);
});