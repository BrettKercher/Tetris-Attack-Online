@extends('layouts.default')

@section('content')
    <h1>{{ $user->username }}</h1>
    <p> {{ $user->salt }}</p>
@stop