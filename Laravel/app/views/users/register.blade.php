@extends('layouts.default')

@section('content')

<div id="register_form">

    <div id="register_left">
        <div id="register_labels">
            @if($errors->has())
                <ul style="visibility: hidden">
                    <p id="error_title">Registration Failed!<p>
                    {{ $errors->first('email', '<li>:message</li>') }}
                    {{ $errors->first('username', '<li>:message</li>') }}
                    {{ $errors->first('password', '<li>:message</li>') }}
                </ul>
            @endif
            {{ Form::label('email', 'Email:', array('id' => 'register_label')) }} <br>
            {{ Form::label('username', 'Username:', array('id' => 'register_label')) }} <br>
            {{ Form::label('password', 'Password:', array('id' => 'register_label')) }} <br>
            {{ Form::label('password_confirmation', 'Confirm Password:', array('id' => 'register_label')) }}
        </div>
    </div>

    <div id="register_right">
        <div id="register_input">
            {{ Form::open(array('url' => 'users/register', 'method' => 'POST')) }}
            @if($errors->has())
                <ul id="register_error">
                    <p id="error_title">Registration Failed!<p>
                    {{ $errors->first('email', '<li>:message</li>') }}
                    {{ $errors->first('username', '<li>:message</li>') }}
                    {{ $errors->first('password', '<li>:message</li>') }}
                </ul>
            @endif
                {{ Form::text('email', '', array('id' => 'register_box', 'placeholder'=>'Email')) }} <br>
                {{ Form::text('username', '', array('id' => 'register_box', 'placeholder'=>'Username')) }} <br>
                {{ Form::password('password', array('id' => 'register_box', 'placeholder'=>'password')) }} <br>
                {{ Form::password('password_confirmation', array('id' => 'register_box', 'placeholder'=>'password')) }} <br>
                {{ Form::submit('Register', array('id'=>'prof_login_button')) }}
            {{ Form::close() }}
        </div>
    </div>
</div>
@stop
