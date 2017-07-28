function loadMap() {
    window.open("map.html", "_parent");
}

function send_request(url) {
    "use strict";
    var obj, result;
    obj = $.ajax({
        url: url,
        async: false
    });
    result = $.parseJSON(obj.responseText);
    return result;
}

function change_page(page, transition) {
    $.mobile.pageContainer.pagecontainer("change", page, {transition: transition});
}

function fake_sign_up() {
    var username, password, email, phone, url, result;

    username = $("#s_username").val();
    password = $("#s_password").val();
    email = $("#s_email").val();
    phone = $("#s_phone").val();

    url = "./phpscripts/controller.php?cmd=1&username=" + username + "&password=" + password + "&email=" + email + "&phone=" + phone;

    result = send_request(url);
    //change_page("#verifypage", "slide");

    if (result.result == 1) {
        change_page("#verifypage", "slide");
    }
}

function true_sign_up() {
    var code, url, result;

    code = $("#code").val();

    url = "./phpscripts/controller.php?cmd=2&code=" + code;

    result = send_request(url);

    if (result.result == 1) {
        $("#verified").popup("open", {transition: "pop"});

        setTimeout(
            function () {
                change_page("#loginpage", "slide")
            }, 800);

    } else {
        $("#notverified").popup("open", {transition: "pop"});
    }
    //alert("dadsadsa");
}

function login() {
    var email, password, url, result;

    email = $("#email").val();
    password = $("#password").val();

    url = "./phpscripts/controller.php?cmd=3&email=" + email + "&password=" + password;

    result = send_request(url);

    if (result.result == 1) {
        $.cookie('email', email);
        loadMap();
    }
    else {
        $("#ll").popup("open", {transition: "pop"});
    }
}

function getLocation() {
    var latitude, longitude, email, url;

    email = $.cookie('email');
    latitude = $.cookie('latitude');
    longitude = $.cookie('longitude');

    url = "./phpscripts/controller.php?cmd=4&email=" + email + "&latitude=" + latitude + "&longitude=" + longitude;

    send_request(url);
}

function rate() {
    var result, rating, comment, url, email;
    rating = $("#slider").val();
    comment = $("#comments").val();
    email = $.cookie('email');

    url = "./phpscripts/controller.php?cmd=5&rating=" + rating + "&comments=" + comment + "&email=" + email;
    result = send_request(url);

    if (result.result == 1) {
        $("#ratingdone").popup("open", {transition: "pop"});

        setTimeout(
            function () {
                change_page("#loginpage", "slide")
            }, 800);
    }
    else {
        $("#ratingfailed").popup("open", {transition: "pop"});
    }
}

function get_rating() {
    var url, result, build;

    url = "./phpscripts/controller.php?cmd=6";

    result = send_request(url);

    build = "";

    if (result.result == 0) {
        document.getElementById("usernum").innerHTML = 0;
        document.getElementById("numrating").innerHTML = 0;
        build += "<p>No comments yet</p>";

        $("#content").html(build);
        change_page("#viewratingspage", "slide");
    } else {
        document.getElementById("usernum").innerHTML = result.count;
        document.getElementById("numrating").innerHTML = result.rating;

        for (var i in result.comment) {
            build += "<blockquote>";
            build += "<h5>" + result.comment[i].email + "</h5>";
            build += "<p style='color: #3498DB'>" + result.comment[i].comments + "</p>";
            build += "</blockquote>";
        }

        $("#content").html(build);

        change_page("#viewratingspage", "slide");
    }
}



