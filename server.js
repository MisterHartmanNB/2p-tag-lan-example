var express = require('express');
var app = express();
var server = app.listen(3000);
app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', newConnection);

const playerColors = ['red','blue','green','yellow','purple','orange','pink','brown','black','white'];
var numPlayers = 0;

function newConnection(socket) {
    console.log('new connection: ' + socket.id);
    socket.on('player',updatePlayers);
    numPlayers++;
    let playerColor = playerColors[(numPlayers-1)%playerColors.length];

    function updatePlayers(data){
        data.id = socket.id;
        data.yourColor = playerColor;
        socket.broadcast.emit('player',data);
    }

}