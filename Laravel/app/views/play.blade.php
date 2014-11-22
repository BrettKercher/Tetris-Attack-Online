@extends('layouts.default')

@section('content')
    {{ HTML::script('js/blocks.js') }}
    {{ HTML::script('js/ImageLoader.js') }}
    {{ HTML::script('js/Main.js') }}
    {{ HTML::script('node_modules/socket.io/node_modules/socket.io-client/socket.io.js') }}

    <script>
        var socket = io.connect('http://localhost:8080');
        var player_name =  "<?php echo $user['username'] ?>";
    </script>

    <div id="game_window">
        <canvas id="game_canvas" width="192" height="384"></canvas>
    </div>

@stop