@extends('layouts.default')

@section('content')
    <h1>Users Home Page</h1>

    <ul>
    @foreach($users as $user)
        <li> {{ link_to_route('user', $user->username, $parameters = array($user->id)) }}</li>
    @endforeach
    </ul>
@stop