/**
 * Created by Brett on 11/17/2014.
 */

/**
 * Game Simulation Variables
 */
const ROWS = 12;
const COLS = 6;

var game_list = [];

function Game(gd, p1)
{
    this.grid_data = gd;
    this.player_1 = p1;
    this.player_2 = null;
}

var clients = [];

var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

io.on('connection', function(socket){

    console.log('Incoming Connection...');


    /**
     * Execute on Receipt of login Message
     */
    socket.on('login', function(msg)
    {
        console.log(msg.name + " logged in");

        clients.push(
            {"name": msg.name, "socket": socket.id}
        );
    });

    /**
     * Execute on Receipt of 'chat message' Message
     */
    socket.on('chat message', function(msg)
    {
        console.log("message: " + msg.message);
        io.emit("chat message", msg);
        //io.sockets.connected[clients[0]].emit("chat message", msg);
    });


    /**
     * Execute on Receipt of "request_board" Message
     * request board is sent when the client initializes a game
     */
    socket.on('request_board', function(msg, callback)
    {
        var grid_data = [];
        var r, c;

        for (r = 0; r < ROWS; r++)
        {
            grid_data[r] = [];
            for (c = 0; c < COLS; c++)
            {
                grid_data[r].push(Math.floor(Math.random() * 5) + 1);
            }
        }
        var game = new Game(grid_data, socket.id);
        game_list.push(game);
        callback(game);

        //io.sockets.connected[get_client_by_name(msg).socket].emit("initialize_board", tempGame);
    });


    /**
     * Simulate a swap of two blocks based on cursor x and y
     * After the swap, check for any matches and send them to the client
     */
    socket.on('swap', function(cx, cy)
    {
        var grid_data = get_game_by_id(socket.id).grid_data;

        var temp = grid_data[cy][cx];
        grid_data[cy][cx] = grid_data[cy][cx + 1];
        grid_data[cy][cx + 1] = temp;
    });

    /**
     * Compare the given grid_data with the server's
     */
    socket.on('compare', function(gd)
    {
        var grid_data = get_game_by_id(socket.id).grid_data;
        var r, c;

        for (r = 0; r < ROWS; r++)
        {
            for (c = 0; c < COLS; c++)
            {
                if(grid_data[r][c] != gd[r][c])
                {
                    console.log("ERROR");
                }
            }
        }
        console.log("SAME");
    });


    /**
     * Execute on Receipt of disconnect Message
     */
    socket.on('disconnect', function()
    {
        console.log("A User Has Disconnected");

        var i = get_client_index_by_id(socket.id);

        if (i > -1) {
            clients.splice(i, 1);
        }
    });
});


/*
 * Get a client from the list of clients by name
 * returns a client with the specified name, null if none exist
 */
function get_client_by_name(name)
{
    for(var  i = 0; i < clients.length; i++)
    {
        if(clients[i].name == name)
            return clients[i];
    }

    return null;
}

/*
 * Get a client from the list of clients by id
 * returns a client from the specified id, null if none exist
 */
function get_client_index_by_id(id)
{
    for(var  i = 0; i < clients.length; i++)
    {
        if(clients[i].socket ==  id)
            return i;
    }

    return -1;
}

/*
 * Get a game from the game_list by game id
 * returns a game from the specified id, -1 if none exist
 */
function get_game_by_id(id)
{
    for(var  i = 0; i < game_list.length; i++)
    {
        if(game_list[i].player_1 ==  id)
            return game_list[i];
    }

    return -1;
}

/*
 * Compare the given grid data with the server's
 * returns true if they match, false otherwise
 */
function compare(gd)
{
    var grid_data = get_game_by_id(socket.id).grid_data;
    var r, c;

    for (r = 0; r < ROWS; r++)
    {
        for (c = 0; c < COLS; c++)
        {
            if(grid_data[r][c] != gd[r][c])
            {
                return false;
            }
        }
    }
    return true;
}

server.listen(8080, function(){
    console.log('listening on *:8080');
});