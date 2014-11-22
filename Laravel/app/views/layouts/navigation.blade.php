<div id="title_bar">
        </div>

<div id="outer_nav">
    <div id="inner_nav">
        <ul id="nav_list">
            <li class="nav_left">{{ HTML::linkRoute('home', 'Home') }}</li>
            <li class="nav_left"><a href="#">Modes</a></li>
            <li class="nav_left"><a href="#">Ladder</a></li>
            <li class="nav_left"><a href="#">Community</a></li>
            <li class="nav_left">{{ HTML::linkRoute('survival', 'Play') }}</li>

            @if(Auth::check())
                <li class="nav_right">{{ HTML::linkRoute('logout', 'Sign Out') }}</li>
            @else
                <li class="nav_right">{{ HTML::linkRoute('register', 'Sign Up') }}</li>
                <li class="nav_right">{{ HTML::linkRoute('login', 'Log In') }}</li>
            @endif
        </ul>
    </div>
</div>