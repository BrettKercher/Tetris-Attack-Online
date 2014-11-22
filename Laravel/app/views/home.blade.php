@extends('layouts.default')

@section('content')

    <div id="outer_popular">
        <div id="inner_popular">

        </div>
    </div>

    <div id="outer_profile">
        <div id="inner_profile">
             <div id="prof_left">
                 <img src="img/Logo.png" id="prof_img">
             </div>
             <div id="prof_right">
                @if(Auth::check())
                    {{ Auth::user()->username }}
                @else
                 <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
                     {{ Form::token() }}
                     <input type="text" name="email" class="prof_login_box" placeholder="Email">
                     <input type="password" name="password" class="prof_login_box" placeholder="Password">
                     <input type="submit" name="submit" id="prof_login_button" value="Login">
                     {{ HTML::linkRoute('register', 'Sign Up', '', array('id'=>'prof_register')) }}
                 </form>
                 @endif
             </div>

        </div>
    </div>

    <div id="outer_news">
        <div id="inner_news">
        </div>
    </div>

@stop
