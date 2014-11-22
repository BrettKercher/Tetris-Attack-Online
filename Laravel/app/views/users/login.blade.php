@extends('layouts.default')

@section('content')

<div id="login_form">

    <div id="register_left">
        <div id="register_labels">
            @if($errors->has())
                <ul style="visibility: hidden">
                    <p id="error_title">Registration Failed!<p>
                    {{ $errors->first('email', '<li>:message</li>') }}
                    {{ $errors->first('password', '<li>:message</li>') }}
                </ul>
            @endif
            {{ Form::label('email', 'Email:', array('id' => 'register_label')) }} <br>
            {{ Form::label('password', 'Password:', array('id' => 'register_label')) }} <br>
        </div>
    </div>

    <div id="register_right">
        <div id="register_input">
            {{ Form::open(array('url' => 'users/login', 'method' => 'POST')) }}
            @if($errors->has())
                <ul id="register_error">
                    <p id="error_title">Login Failed!<p>
                    {{ $errors->first('email', '<li>:message</li>') }}
                    {{ $errors->first('password', '<li>:message</li>') }}
                </ul>
            @endif
                {{ Form::text('email', '', array('id' => 'register_box', 'placeholder'=>'Email')) }} <br>
                {{ Form::password('password', array('id' => 'register_box', 'placeholder'=>'password')) }} <br>
                {{ Form::submit('Log In', array('id'=>'prof_login_button')) }}
            {{ Form::close() }}
        </div>
    </div>
</div>
@stop
