<!DOCTYPE html>
<html>

    <head>
        <meta charset="UTF-8">
        <meta name="author" content="Brett Kercher">

        <link rel="stylesheet" type="text/css" href="Laravel/public/css/style.css">
    </head>

    <body>


        <?php

            require_once(__DIR__.'/../res/config.php');

            //define variables
            $username = $password = "";

            // Create connection
            $conn = new mysqli($config["db"]["db1"]["host"], $config["db"]["db1"]["username"], $config["db"]["db1"]["password"], $config["db"]["db1"]["dbname"]);

            // Check connection
            if ($conn->connect_error)
                die("Connection failed: " . $conn->connect_error);

            //On login
            if($_SERVER["REQUEST_METHOD"] == "POST")
            {
                $username = sanitize($_POST["user"]);
                $password = sanitize($_POST["pass"]);

                //Access db
                $stmt = $conn->prepare("INSERT INTO users (Host, Name, Salt, Password) VALUES ('127.0.0.1', ?, '0ab3', ?)");
                $stmt->bind_param("ss", $username, $password);

                $stmt->execute();

                //redirect
                header('Location: /index.php');
                exit;
            }

            function sanitize($input)
            {
                $input = trim($input);
                $input = stripcslashes($input);
                $input = htmlspecialchars($input);
                return $input;
            }
        ?>

        <div>
            <div id="left">
            </div>

            <div id="middle">

                <div id="title_bar">

                </div>

                <div id="outer_nav">
                    <div id="inner_nav">
                        <ul id="nav_list">
                            <li class="nav_left"><a href="#">Home</a></li>
                            <li class="nav_left"><a href="#">Modes</a></li>
                            <li class="nav_left"><a href="#">Ladder</a></li>
                            <li class="nav_left"><a href="#">Community</a></li>
                            <li class="nav_right">
                            </li>
                        </ul>
                    </div>
                </div>

                <div id="outer_popular">
                    <div id="inner_popular">
                    </div>
                </div>

                <div id="outer_profile">
                    <div id="inner_profile">
                        <div id="prof_left">
                            <img src="Laravel/public/img/Logo.png" id="prof_img">
                        </div>
                        <div id="prof_right">
                            <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
                                <input type="text" name="user" class="prof_login_box" placeholder="UserName">
                                <input type="password" name="pass" class="prof_login_box" placeholder="Password">
                                &nbsp;&nbsp;<input type="submit" name="submit" id="prof_login_button" value="Login">
                                <a href="users/register.php" id="prof_register">Sign Up</a>
                            </form>
                        </div>
                    </div>
                </div>

                <div id="outer_news">
                    <div id="inner_news">
                    </div>
                </div>


            </div>

            <div id="right">
            </div>
        </div>

    </body>

</html>