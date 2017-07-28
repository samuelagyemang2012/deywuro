<?php

/**
 * Created by PhpStorm.
 * User: samuel
 * Date: 12/5/2016
 * Time: 1:50 PM
 */
include_once('Adb.php');

class Rating extends Adb
{

    public function check_if_rated($email)
    {
        $query = "SELECT email FROM ratings WHERE email=?";
        $s = $this->prepare($query);
        $s->bind_param('s', $email);
        $s->execute();
        $data = $s->get_result();
        $int = $data->num_rows;
        return $int;
    }

    public function rate($email, $rating, $comments)
    {
        $query = "INSERT INTO ratings (email, rating, comments) VALUES (?,?,?)";
        $s = $this->prepare($query);
        $s->bind_param('sis', $email, $rating, $comments);
        $bool = $s->execute();
        return $bool;
    }

    public function get_sum()
    {
        $query = "SELECT SUM(rating) FROM ratings";
        $s = $this->prepare($query);
        $s->execute();
        $data = $s->get_result();
        $row = $data->fetch_assoc();
        $sum = $row['SUM(rating)'];
        return $sum;
    }

    public function get_count()
    {
        $query = "SELECT COUNT(email) FROM ratings";
        $s = $this->prepare($query);
        $s->execute();
        $data = $s->get_result();
        $row = $data->fetch_assoc();
        $count = $row['COUNT(email)'];
        return $count;
    }

    public function get_rating()
    {
        $sum = $this->get_sum();
        $count = $this->get_count();
        $avg = $sum / $count;
        return $avg;
    }

    public function get_comments(){
        $query = "SELECT email,comments FROM ratings";
        $s = $this->prepare($query);
        $s->execute();
        return $s->get_result();
    }
}

//$r = new Rating();
//$b = $r->get_count();
//echo $b;