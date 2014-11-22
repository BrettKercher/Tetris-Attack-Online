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
                ctx.drawImage(block_img, (grid_data[r][c] - 1) * BLK_SIZE, 0, BLK_SIZE, BLK_SIZE, c * BLK_SIZE, r * BLK_SIZE, BLK_SIZE, BLK_SIZE);
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
                var temp = grid_data[cur_y][cur_x];
                grid_data[cur_y][cur_x] = grid_data[cur_y][cur_x + 1];
                grid_data[cur_y][cur_x + 1] = temp;

                //Tell the server about the move
                socket.emit('swap', cur_x, cur_y);
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
