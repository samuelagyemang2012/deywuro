<?php

/**
 * Created by PhpStorm.
 * User: samuel
 * Date: 12/3/2016
 * Time: 2:37 AM
 */

include_once("Adb.php");

class Location extends Adb
{
    public function get_location($email, $latitude, $longitude, $date, $time)
    {
        $query = "INSERT INTO location(email,latitude,longitude,date,time) VALUES (?,?,?,?,?)";
        $s = $this->prepare($query);
        $s->bind_param('sssss', $email, $latitude, $longitude, $date, $time);
        $bool = $s->execute();
        return $bool;
    }
}