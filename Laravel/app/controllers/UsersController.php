<?php
/**
 * Created by PhpStorm.
 * User: Brett
 * Date: 11/15/2014
 * Time: 9:33 PM
 */

class UsersController extends BaseController
{
    public $restful = true;

    public function get_index()
    {
        return View::make('users.index')
            ->with('title', 'Users')
            ->with('users', User::orderBY('id')->get());
    }

    public function get_view($id)
    {
        return View::make('users.view')
            ->with('title', 'User View Page')
            ->with('user', User::find($id));
    }

    public function showRegistration()
    {
        return View::make('users.register')
            ->with('title', 'Sign Up');
    }

    public function registerUser()
    {
        //validate data
        $validation = User::validate(Input::all());

        if($validation->fails())
        {
            return Redirect::route('register')
                ->withErrors($validation) //reloads with error values passed to view
                ->withInput(); //remembers old input
        }
        else
        {
            $username = Input::get('username');
            $email = Input::get('email');
            $password = Input::get('password');
            $code = str_random(60);

            //process form
            $user = User::create(array(
                'host'              => Request::getClientIp(),
                'email'             => $email,
                'username'          => $username,
                'password'          => Hash::make($password),
                'activation_code'   => $code,
                'validated'         => false
            ));

            if($user)
            {
                //send email
                Mail::send('emails.auth.activation', array('link' => URL::route('activate', $code), 'username'=> $username), function($message) use ($user)
                {
                    $message->to($user->email, $user->username)
                        ->subject('Activate Your Account!');
                });

                //redirect to home screen
                return Redirect::route('home')
                    ->with('message', 'Registration Successful!');
            }
            else
            {
                return Redirect::route('home')
                    ->with('message', 'Something went horribly wrong.');
            }
        }
    }

    public function activateUser($code)
    {
        $user = User::where('activation_code', '=', $code)->where('validated', '=', 0);

        if($user->count())
        {
            $user = $user->first();

            //Update the database to activate the user
            $user->validated = 1;
            $user->activation_code = '';

            if($user->save())
            {
                return Redirect::route('home')
                    ->with('message', 'Account Activated Successfully!');
            }
        }

        return Redirect::route('home')
            ->with('message', 'Something went horribly wrong.');
    }

    public function showLogIn()
    {
        return View::make('users.login')
            ->with('title', 'Log In');
    }

    public function LogIn()
    {
        echo 'hi';

        $validation = Validator::make(Input::all(),
            array(
                'email' => 'required|email',
                'password' => 'required'
            ));

        if($validation->fails())
        {
            return Redirect::route('login')
                ->withErrors($validation) //reloads with error values passed to view
                ->withInput(); //remembers old input
        }
        else
        {
            $auth = Auth::attempt(array(
                'email' => Input::get('email'),
                'password' => Input::get('password'),
                'validated' => 1
            ));

            if($auth)
            {
                //redirect to intended page
                return Redirect::intended('/');
            }
        }

        return Redirect::route('login')
            ->with('message', 'Problem signing in');
    }

    public function getLogOut()
    {
        Auth::logout();
        return Redirect::route('home');
    }
}