<!DOCTYPE html>

<html lang="en">
    <head>
        <meta charset="UTF-8">
        <Title>{{ $title }}</Title>
        {{ HTML::style('css/style.css') }}
    </head>

    <body>
        @if(Session::has('message'))
            <p style="color:green;">{{ Session::get('message') }}</p>
        @endif

    <div id="left">
    </div>

    <div id="middle">
        @include('layouts.navigation')

        @yield('content')

    </div>

    <div id="right">
    </div>

    </body>
</html>