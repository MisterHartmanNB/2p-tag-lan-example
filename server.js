var express = require('express');
var app = express();
var server = app.listen(3000);
app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', newConnection);

var players = [];

function newConnection(socket) {
    console.log('new connection: ' + socket.id);
    socket.on('player',updatePlayers);

    function updatePlayers(data){
        data.id = socket.id;
        socket.broadcast.emit('player',data);
    }

}