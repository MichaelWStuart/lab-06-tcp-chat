'use strict';

const net = require('net');
const server = net.createServer();
const Client = require('./lib/client');

let clientPool = [];

server.on('connection', socket => {
  const client = new Client(socket);
  client.addUser();
  client.socket.on('error', () => client.removeUser());
  client.socket.on('close', () => client.removeUser());
  client.socket.on('data', buffer => client.wackRouter(buffer));
});

server.listen(8080, () => {
  console.log('server up on port 8080');
});
