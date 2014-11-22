<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="author" content="Brett Kercher">

    <link rel="stylesheet" type="text/css" href="../Laravel/public/css/style.css">
</head>

<body>

<?php

require_once(__DIR__.'/../../res/config.php');

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

    //Access db - Check If the Name Exists, if Not, add it.
    $stmt = $conn->prepare("SELECT Name FROM users WHERE Name=?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if($row = $result->fetch_assoc())
    {
        //already exists
        header('Location: /users/register.php');
    }
    else
    {
        $stmt = $conn->prepare("INSERT INTO users (Host, Name, Salt, Password) VALUES ('127.0.0.1', ?, '0ab3', ?)");
        $stmt->bind_param("ss", $username, $password);

        $stmt->execute();

        //redirect
        header('Location: /index.php');
    }
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
                    <li class="nav_left"><a href="/index.php">Home</a></li>
                    <li class="nav_left"><a href="#">Modes</a></li>
                    <li class="nav_left"><a href="#">Ladder</a></li>
                    <li class="nav_left"><a href="#">Community</a></li>
                    <li class="nav_right">
                    </li>
                </ul>
            </div>
        </div>

        <div id="register_form">

            <div id="register_left">

            </div>

            <div id="register_right">
                <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
                    <input type="text" name="user" placeholder="UserName">
                    <input type="password" name="pass" placeholder="Password">
                    &nbsp;&nbsp;<input type="submit" name="submit" value="Login">
                </form>
            </div>


        </div>
    </div>

    <div id="right">
    </div>
</div>

</body>

</html>