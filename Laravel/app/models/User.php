<?php

use Illuminate\Auth\UserTrait;
use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableTrait;
use Illuminate\Auth\Reminders\RemindableInterface;

class User extends Eloquent implements UserInterface, RemindableInterface {

	use UserTrait, RemindableTrait;

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users';

	/**
	 * The attributes excluded from the model's JSON form.
	 *
	 * @var array
	 */
	protected $hidden = array('password', 'remember_token');

    /**
     * I donno what this is
     *
     * @var array
     */
    protected $fillable = ['id', 'email', 'username', 'password', 'activation_code', 'validated'];

    //array of validation rules
    public static $rules = array (
        'email'=>'required|between:5,64|Unique:users|Email',
        'username'=>'required|between:3,24|Unique:users|AlphaNum',
        'password'=>'required|between:4,32|Confirmed',
        'password_confirmation'=>'Required|between:4,32'
    );

    public static function validate($data)
    {
        return Validator::make($data, static::$rules);
    }

}
