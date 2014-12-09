/**
 * Created by Brett on 11/7/2014.
 */

/**
 * Constants
 */
const ROWS = 12;
const COLS = 6;
const BLK_SIZE = 32;
const GRID_W = 192;
const GRID_H = 384;

/**
 * Key Codes
 */
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const SELECT = 90; //Z
const COMPARE = 112; //f1

/**
 * Game flow variables
 */
var prevTime;
var curTime;
var isGameOver;
var board_ready;

/**
 * Game Data Variables
 */
var canvas;
var ctx;
var grid_data;
var cur_x;
var cur_y;
var BlockState = Object.freeze({NORM: 0, FALL: 1, BREAK: 2});

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

/**
 * Image Variables
 */
var loader;
var block_img;
var cursor_img;

/**
 * Called when the window finishes loading
 * Sets up initial canvas/ctx and starts loading images
 */
window.onload = function()
{
    socket.emit('login', {message: "Im logging in", name: player_name} );

    canvas = document.getElementById("game_canvas");
    ctx = canvas.getContext("2d");

    loader = new ImageLoader();
    loader.addImage("http://localhost/Laravel/public/img/blocks.png", "blocks");
    loader.addImage("http://localhost/Laravel/public/img/cursor.png", "cursor");
    loader.onReadyCallback = on_images_loaded();
    loader.loadImages();

    prevTime = curTime;

    document.onkeydown = handle_input;
};

/**
 * Called when the loader finishes loading our images
 * Store the loaded images in variables and initialize the game
 */
function on_images_loaded()
{
    block_img = loader.getImageByName("blocks");
    cursor_img = loader.getImageByName("cursor");
    init_game();
}

/**
 * Set initial game state
 * If this is the first time playing, create a new 2d array
 * Initialize the grid to empty
 */
function init_game()
{
    isGameOver = false;
    cur_y = ROWS / 2;
    cur_x = COLS / 2;

    board_ready = false;
    get_board_from_server();

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
}

/*
 *
 */
function get_board_from_server()
{
    //what if you fake this request during a game?
    socket.emit('request_board', "Bob", function(res)
    {
        var r, c;
        if(grid_data == undefined)
        {
            grid_data = [];

            for(r = 0; r < ROWS; r++)
            {
                grid_data[r] = [];
                for(c = 0; c < COLS; c++)
                {
                    grid_data[r].push(res.grid_data[r][c]);
                }
            }
        }
        else
        {
            for(r = 0; r < ROWS; r++)
            {
                for(c = 0; c < COLS; c++)
                {
                    grid_data[r][c] = res.grid_data[r][c]
                }
            }
        }
        requestAnimationFrame(update);
    });
}

/*
 * Check for three or more blocks in a row
 * Clears them if they exist
 *
 * x = cursor x position
 * y = cursor y position
 *
 * returns true if one is found
 */
function checkClear(x,y)
{

}

function update()
{
    curTime = new Date().getTime();

    if(curTime - prevTime > 500)
    {
        //Update Board

        prevTime = curTime;
    }

    ctx.clearRect(0,0,GRID_W, GRID_H);
    draw_blocks();
    draw_cursor();

    if(!isGameOver)
    {
        requestAnimationFrame(update);
    }
    else
    {
        //draw game over
    }

}

function draw_blocks()
{
    //draw background image

    for(var r = 0; r < ROWS; r++)
    {
        for(var c = 0; c < COLS; c++)
        {
            if(grid_data[r][c] != 0)
            {
                ctx.drawImage(block_img, (grid_data[r][c].block_type - 1) * BLK_SIZE, 0, BLK_SIZE, BLK_SIZE, grid_data[r][c].pos_x * BLK_SIZE, grid_data[r][c].pos_y * BLK_SIZE, BLK_SIZE, BLK_SIZE);
            }
        }
    }
}

function draw_cursor()
{
    ctx.drawImage(cursor_img, cur_x * BLK_SIZE, cur_y * BLK_SIZE);
}

/**
 * Handles Input
 */
function handle_input(e)
{
    if(!e) { e  = window.event; }

    //ADD WHEN DONE PLS
    //e.preventDefault();

    if(!isGameOver)
    {
        switch(e.keyCode)
        {
            case UP:
                if(cur_y > 0)
                    cur_y -= 1;
                break;
            case LEFT:
                if(cur_x > 0)
                    cur_x -= 1;
                break;
            case DOWN:
                if(cur_y < (ROWS - 1))
                    cur_y += 1;
                break;
            case RIGHT:
                if(cur_x < (COLS - 2))
                cur_x += 1;
                break;
            case SELECT:
                //Tell the server about the move
                socket.emit('swap', cur_y, cur_x);
                //Swap blocks
                swap_blocks(cur_y, cur_x);
                break;
            case COMPARE:
                socket.emit('compare', grid_data);
                break;
        }
    }
    else
    {
        init_game();
    }
}

function swap_blocks(y, x)
{
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
            fall(y, x);
        }
        if((y-1) >= 0 && grid_data[y-1][x+1] != 0)
        {
            did_fall = true;
            fall(y-1, x+1);
        }
        if(did_fall)
            check_all();
        else
            clear_combos(y, x);
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
            fall(y, x + 1);
        }
        if((y-1) >= 0 && grid_data[y-1][x] != 0)
        {
            did_fall = true;
            fall(y - 1, x);
        }

        if(did_fall)
            check_all();
        else
            clear_combos(y, x+1);
    }
    else
    {
        var temp = grid_data[y][x];

        grid_data[y][x] = grid_data[y][x+1];
        grid_data[y][x].pos_x -= 1;

        grid_data[y][x+1] = temp;
        grid_data[y][x+1].pos_x += 1;

        clear_combos(y, x);
        clear_combos(y, x+1);
    }
}

/*
 * Move the block at location y,x and all blocks above it down
 */
function fall(y, x)
{
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

function clear_combos(y, x)
{
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
        console.log(count);
        i -= count;
        var top = i - 1;
        while(count > 0)
        {
            grid_data[i][j].state = BlockState.BREAK;
            grid_data[i][j] = 0;
            count--;
            i++;
        }
        fall(top, j);
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
            fall(y-1, j);
            j++;
        }
    }
}

function check_all()
{
    var r, c;
    for(r = 0; r < ROWS; r++)
    {
        for(c = 0; c < COLS; c++)
        {
            if(grid_data[r][c] != 0)
            {
                clear_combos(r, c);
            }
        }
    }
}

function add_row()
{

}