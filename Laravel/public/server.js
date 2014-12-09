/**
 * Created by Brett on 11/17/2014.
 */


/**
 * Server Variables
 */
const PORT = 8080;
const DOMAIN = "127.0.0.1";

/**
 * Game Simulation Variables
 */
const ROWS = 12;
const COLS = 6;
var BlockState = Object.freeze({NORM: 0, FALL: 1, BREAK: 2});
var game_list = [];

/*
 * Game Object
 */
function Game(gd, p1)
{
    this.grid_data = gd;
    this.player_1 = p1;
    this.player_2 = null;
}

/**
 * Block Object
 */
function block(y, x, type)
{
    this.block_type = type;
    this.pos_x = x;
    this.pos_y = y;
    this.state = BlockState.NORM;
}

var clients = [];

var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

//--------------------------------------------------
//  Handle Incoming Packets:
//  -login
//  -request_board
//  -swap
//  -compare
//  -disconnect
//--------------------------------------------------

io.on('connection', function(socket)
{

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
        var temp_block;

        for (r = 0; r < ROWS; r++)
        {
            grid_data[r] = [];
            for (c = 0; c < COLS; c++)
            {
                if(r >= 6)
                {
                    temp_block = new block(r, c, Math.floor(Math.random() * 5) + 1);
                    grid_data[r].push(temp_block);
                }
                else
                {
                    grid_data[r].push(0);
                }
            }
        }
        var game = new Game(grid_data, socket.id);
        initialize_board(game);
        game_list.push(game);
        callback(game);
    });


    /**
     * Simulate a swap of two blocks based on cursor x and y
     * After the swap, check for any matches and send them to the client
     */
    socket.on('swap', function(y, x)
    {
        var game = get_game_by_id(socket.id);
        swap_blocks(y, x, game);
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
                if(grid_data[r][c].block_type != gd[r][c].block_type)
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


//-----------------------
//  HELPER FUNCTIONS
//-----------------------

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

/*
 * Get the board ready for game start by
 * -removing 6 random blocks to get an initial pattern
 * -removing any existing combos
 */
function initialize_board(game)
{
    var r, c, i, rr, rc;

    //Remove 6 random blocks to start, 3 of them from the same column
    for(i = 0; i < 4; i++)
    {
        rr = Math.floor(Math.random() * 6) + 6; //only rows 6-11 have blocks
        rc = Math.floor(Math.random() * 6);

        //Make sure we choose a unique block
        while( game.grid_data[rr][rc].state == BlockState.BREAK )
        {
            rr = Math.floor(Math.random() * 6) + 6; //only rows 6-11 have blocks
            rc = Math.floor(Math.random() * 6);
        }

        game.grid_data[rr][rc].state = BlockState.BREAK;

        //Remove 3 blocks from the same column on the first pass
        if (i == 0)
        {
            if(rr+1 < ROWS)
            {
                game.grid_data[rr + 1][rc].state = BlockState.BREAK;
                if(rr+2 < ROWS)
                {
                    game.grid_data[rr + 2][rc].state = BlockState.BREAK;
                }
                else
                {
                    game.grid_data[rr - 1][rc].state = BlockState.BREAK;
                }
            }
            else
            {
                game.grid_data[rr - 1][rc].state = BlockState.BREAK;
                if(rr-2 >= 0)
                {
                    game.grid_data[rr - 2][rc].state = BlockState.BREAK;
                }
                else
                {
                    game.grid_data[rr + 1][rc].state = BlockState.BREAK;
                }
            }
        }
    }


    //Remove all blocks in the BREAK state (only rows 6-11 have blocks)
    for(r = 6; r < ROWS; r++)
    {
        for(c = 0; c < COLS; c++)
        {
            if(game.grid_data[r][c].state == BlockState.BREAK)
            {
                if((r-1) >= 0 && game.grid_data[r-1][c] != 0)
                {
                    var i = r;
                    while( (i-1) >= 0 && game.grid_data[i-1][c] != 0 )
                    {
                        game.grid_data[i][c] = game.grid_data[i-1][c];
                        game.grid_data[i][c].pos_y += 1;
                        game.grid_data[i-1][c] = 0;
                        i--;
                    }
                }
                else
                    game.grid_data[r][c] = 0;
            }
        }
    }

    //Change any blocks that are 3 in a row
    for (r = 6; r < ROWS; r++)
    {
        for (c = 0; c < COLS; c++)
        {
            if (game.grid_data[r][c] == 0)
            {
                continue;
            }
            else
            {
                clear_initial_combos(game, r, c);
            }
        }
    }
}

/*
 * Checks for 3+ blocks in a row  both vertically and horizontally
 *  Upon finding a combo, change its middle block to a new type
 */
function clear_initial_combos(game, r, c)
{
    var i = r;
    var j = c;
    var count = 0;

    //Check vertical combos
    while(i < ROWS && game.grid_data[i][j].block_type == game.grid_data[r][c].block_type)
    {
        count++;
        i++;
    }
    if(count >= 3)
    {
        i = i - count + Math.floor(count/2);
        game.grid_data[i][j].block_type = ((game.grid_data[i][j].block_type + 1) % 6);
        if(game.grid_data[i][j].block_type == 0) game.grid_data[i][j].block_type++;

        if((j-1) >= 0 && (j+1) < COLS && game.grid_data[i][j] != 0 && game.grid_data[i][j-1] != 0
            && game.grid_data[i][j+1] != 0 && game.grid_data[i][j].block_type == game.grid_data[i][j-1].block_type
            && game.grid_data[i][j].block_type == game.grid_data[i][j+1].block_type)
        {
            game.grid_data[i][j].block_type = ((game.grid_data[i][j].block_type + 1) % 6);
            if(game.grid_data[i][j].block_type == 0) game.grid_data[i][j].block_type++;
        }
    }

    count = 0;
    i = r;

    //Check horizontal combos
    while(j < COLS && game.grid_data[i][j].block_type == game.grid_data[r][c].block_type)
    {
        count++;
        j++;
    }
    if(count >= 3)
    {
        j = j - count + Math.floor(count/2);
        game.grid_data[i][j].block_type = ((game.grid_data[i][j].block_type + 1) % 6);
        if(game.grid_data[i][j].block_type == 0) game.grid_data[i][j].block_type++;

        if((i-1) >= 0 && (i+1) < ROWS && game.grid_data[i][j] != 0 && game.grid_data[i-1][j] != 0
            && game.grid_data[i+1][j] != 0 && game.grid_data[i][j].block_type == game.grid_data[i-1][j].block_type
            && game.grid_data[i][j].block_type == game.grid_data[i+1][j].block_type)
        {
            game.grid_data[i][j].block_type = ((game.grid_data[i][j].block_type + 1) % 6);
            if(game.grid_data[i][j].block_type == 0) game.grid_data[i][j].block_type++;
        }
    }
}

function swap_blocks(y, x, game)
{
    var grid_data = game.grid_data;

    if(grid_data[y][x] == 0 && grid_data[y][x+1] == 0)
    {
        return;
    }
    else if(grid_data[y][x] == 0)
    {
        grid_data[y][x] = grid_data[y][x+1];
        grid_data[y][x].pos_x -= 1;

        grid_data[y][x+1] = 0;

        var did_fall = false;
        if((y+1) < ROWS && grid_data[y+1][x] == 0)
        {
            did_fall = true;
            fall(y, x, game);
        }
        if((y-1) >= 0 && grid_data[y-1][x+1] != 0)
        {
            did_fall = true;
            fall(y-1, x+1, game);
        }
        if(did_fall)
            check_all(game);
        else
            clear_combos(y, x, game);
    }
    else if(grid_data[y][x+1] == 0)
    {
        grid_data[y][x+1] = grid_data[y][x];
        grid_data[y][x+1].pos_x += 1;

        grid_data[y][x] = 0;

        var did_fall = false;
        if((y+1) < ROWS && grid_data[y+1][x+1] == 0)
        {
            did_fall = true;
            fall(y, x + 1, game);
        }
        if((y-1) >= 0 && grid_data[y-1][x] != 0)
        {
            did_fall = true;
            fall(y - 1, x, game);
        }

        if(did_fall)
            check_all(game);
        else
            clear_combos(y, x+1, game);
    }
    else
    {
        var temp = grid_data[y][x];

        grid_data[y][x] = grid_data[y][x+1];
        grid_data[y][x].pos_x -= 1;

        grid_data[y][x+1] = temp;
        grid_data[y][x+1].pos_x += 1;

        clear_combos(y, x, game);
        clear_combos(y, x+1, game);
    }
}

/*
 * Move the block at location y,x and all blocks above it down
 */
function fall(y, x, game)
{
    var grid_data = game.grid_data;
    var i = y;
    var count = 0;
    //Go up the block stack until hitting a blank space
    while( grid_data[i][x] != 0)
    {
        grid_data[i][x].state = BlockState.FALL;
        count++;
        i--;
    }
    i+= count;
    while(count > 0)
    {
        while ((i + 1) < ROWS && grid_data[i + 1][x] == 0)
        {
            grid_data[i + 1][x] = grid_data[i][x];
            grid_data[i + 1][x].pos_y += 1;
            grid_data[i][x] = 0;
            i++;
        }
        count--;
        y--;
        i=y;
    }
}

//horizontal fall

function clear_combos(y, x, game)
{
    var grid_data = game.grid_data;
    var i = y;
    var j = x;
    var count = 0;

    //Move i to the top most block in the potential combo
    while(i >= 0 && grid_data[i][j].block_type == grid_data[y][x].block_type)
    {
        i--;
    }
    i++;

    //Check vertical combos
    while(i < ROWS && grid_data[i][j].block_type == grid_data[y][x].block_type)
    {
        count++;
        i++;
    }
    if(count >= 3)
    {
        i -= count;
        var top = i - 1;
        while(count > 0)
        {
            grid_data[i][j].state = BlockState.BREAK;
            grid_data[i][j] = 0;
            count--;
            i++;
        }
        fall(top, j, game);
    }

    count = 0;
    i = y;

    //Move j to the left most block in the potential combo
    while(j >= 0 && grid_data[i][j].block_type == grid_data[y][x].block_type)
    {
        j--;
    }
    j++;

    //Check horizontal combos
    while(j < COLS && grid_data[i][j].block_type == grid_data[y][x].block_type)
    {
        count++;
        j++;
    }
    if(count >= 3)
    {
        j -= count;
        while(count > 0)
        {
            grid_data[i][j].state = BlockState.BREAK;
            grid_data[i][j] = 0;
            count--;
            fall(y-1, j, game);
            j++;
        }
    }
}

function check_all(game)
{

    var r, c;
    for(r = 0; r < ROWS; r++)
    {
        for(c = 0; c < COLS; c++)
        {
            if(game.grid_data[r][c] != 0)
            {
                clear_combos(r, c, game);
            }
        }
    }
}


//Start Listening
server.listen(PORT, function() {
    console.log("Server Listening on Port " + PORT);
});

