<?php
/**
 * Created by PhpStorm.
 * User: samuel
 * Date: 12/2/2016
 * Time: 6:30 AM
 */
session_start();
$email = "";

include_once "User.php";
include_once "Location.php";
include_once "Rating.php";

if (isset($_REQUEST['cmd'])) {

    $command = $_REQUEST['cmd'];

    switch ($command) {
        case 1:
            temporal_sign_up();
            break;

        case 2:
            sign_up();
            break;

        case 3:
            login();
            break;

        case 4:
            getLocation();
            break;

        case 5:
            rate();
            break;

        case 6:
            view_rating();
            break;

        default:
            break;
    }
}

function temporal_sign_up()
{
    $user = new User();

    //generate code
    $code = $user->generate_code();

    //get data
    $username = $_GET['username'];
    $password = $_GET['password'];
    $email = $_GET['email'];
    $phone = $_GET['phone'];

    //session data
    $_SESSION['username'] = $username;
    $_SESSION['password'] = $password;
    $_SESSION['email'] = $email;
    $_SESSION['phone'] = $phone;
    $_SESSION['code'] = $code;

    $bool = $user->fake_sign_up($email, $code);
    if ($bool == true) {
        $user->send_code($code, $phone);
        echo '{"result": 1}';
    } else {
        echo '{"result": 0}';
    }
}

function sign_up()
{
    $user = new User();

    $usercode = $_GET['code'];

    $user_email = $user->get_email_from_code($usercode);

    if ($user_email == $_SESSION['email']) {

        $bool = $user->sign_up($_SESSION['username'], $_SESSION['password'], $_SESSION['email'], $_SESSION['phone'], "null", "null");

//        if ($bool == true) {
        echo '{"result":1}';
//        }
    } else {
        echo '{"result":0}';
    }
}

function login()
{
    $user = new User();

    $email = $_GET['email'];
    $password = $_GET['password'];

    $data = $user->login($email, $password);

    $row = $data->fetch_assoc();

    $r_email = $row['email'];
    $r_pass = $row['password'];

    if ($email == $r_email && $password === $r_pass) {
        echo '{"result":1}';
    } else {
        echo '{"result":0}';
    }
}

function getLocation()
{
    $loc = new Location();
    $user = new User();

    date_default_timezone_set('UTC');
    $date = date('Y-m-d');
    $time = date("h:i:sa");

    $email = $_GET['email'];
    $latitude = $_GET['latitude'];
    $longitude = $_GET['longitude'];
    $user->set_last_seen($email, $date, $time);
    $loc->get_location($email, $latitude, $longitude, $date, $time);

}

function rate()
{
    $rating = new Rating();

    $email = $_GET['email'];
    $rate = $_GET['rating'];
    $com = $_GET['comments'];

    $has_rated = $rating->check_if_rated($email);

    if ($has_rated <= 0) {
        $rating->rate($email, $rate, $com);
        echo '{"result":1}';
    } else {
        echo '{"result":0}';
    }
}

function view_rating()
{
    $rating = new Rating();

    $co = $rating->get_count();

    if ($co == 0) {
        echo '{"result": 0}';
    } else {
        $ra = $rating->get_rating();
        $results = $rating->get_comments();
        $rows = $results->fetch_assoc();

        echo '{"result": 1,"rating":' . $ra . ',"count":' . $co . ', "comment":[';

        while ($rows) {
            echo json_encode($rows);
            $rows = $results->fetch_assoc();

            if ($rows) {
                echo ",";
            }
        }
        echo "]}";
    }
}
