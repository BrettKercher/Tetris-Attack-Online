<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

/*
 * Unauthenticated user group
 */
Route::group(array('before' => 'guest'), function()
{
    //CSRF Protection
    Route::group(array('before' => 'csrf'), function()
    {
        Route::post('users/register', array('uses'=>'UsersController@registerUser'));
        Route::post('/', array('uses'=>'UsersController@LogIn'));
        Route::post('users/login', array('uses'=>'UsersController@LogIn'));
    });

    //Registration Page
    Route::get('users/register', array('as'=>'register', 'uses'=>'UsersController@showRegistration'));
    Route::get('users/activate/{code}', array('as'=>'activate', 'uses'=>'UsersController@activateUser'));

    //Login Page
    Route::get('users/login', array('as'=>'login', 'uses'=>'UsersController@showLogIn'));
});

/*
 * Authenticated user group
 */
Route::group(array('before' => 'auth'), function()
{
    Route::get('users/logout', array('as'=>'logout', 'uses'=>'UsersController@getLogout'));
    Route::get('games/survival', array('as'=>'survival', 'uses'=>'GameController@showSurvival'));
});

Route::get('/', array('as'=>'home', 'uses'=>'HomeController@showHome'));


