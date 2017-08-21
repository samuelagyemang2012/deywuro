//document.addEventListener("deviceready", function () {
//    alert("123");
//    alert(navigator.contacts);
//}, true);

//array to store contacts
var live_contacts = [];

$(function () {
    $("[data-role=header]").toolbar();
    //$("[data-role=popup]").popup().enhanceWithin();
});

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

function popout(id, transition) {
    $("#" + id).popup("open", {transition: transition});
}

function popout_close(id, transition) {
    $("#" + id).popup("close", {transition: transition});
}

function login() {

    var url, username, password, balance;

    //get user's username and password
    username = $("#username").val();
    password = $("#password").val();

    if (username.length == 0 || password.length == 0) {
        toast('Please enter a username and password', 5000)
    }

    if (username.length > 0 && password.length > 0) {

        //login api
        $.get("http://deywuro.com/api/login",
            {
                username: username,
                password: password
            },

            function (response) {

                if (response.message == "Successful Login") {

                    $("#username").val("");
                    $("#password").val("");

                    $.cookie('username', username);
                    $.cookie('password', password);

                    load_contacts();
                    get_stats();

                }

                if (response.message == "Invalid Credential!") {

                    toast("Wrong username or password", 5000);
                }
            });
    }
}

function load_contacts() {

    var obj = new ContactFindOptions();
    obj.filter = "";
    obj.multiple = true;

    toast("Fetching your contacts", 8000);
    navigator.contacts.find([navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.phoneNumbers], contacts_success, contacts_failed, obj);
}

function contacts_success(contacts) {

    toast("Fetching your contacts", 5000);

    var build;
    build = '';

    contacts.sort(function (a, b) {
        var nameA = a.displayName; // ignore upper and lowercase
        var nameB = b.displayName;  // ignore upper and lowercase

        if (nameA < nameB) {
            return -1;
        }

        if (nameA > nameB) {
            return 1;
        }

        // names must be equal
        return 0;
    });

    for (var i = 0; i < contacts.length; i++) {
        // display phone numbers
        if (contacts[i].phoneNumbers != null) {
            for (var j = 0; j < contacts[i].phoneNumbers.length; j++) {

                if (contacts[i].phoneNumbers[j] != null) {

                    var name = contacts[i].displayName;
                    var number = contacts[i].phoneNumbers[j].value;

                    build += "<div class='col-xs-12' id='" + contacts[i].id + "' onclick='select_contacts(" + contacts[i].phoneNumbers[j].value + "," + contacts[i].id + ")'>";
                    build += "<input style='opacity: 0' hidden value='false' id='i" + contacts[i].id + "'>";
                    // build += "<input type='text' name='checkbox-1a' id='i" + contacts[i].id + "' checked=''>";
                    build += "<p><b style=''>" + name + "</b></p>";
                    build += "<p><b style=''>" + number + "</b></p>";
                    build += " <p hidden class='align-right' id='s" + contacts[i].id + "'><i class='zmdi zmdi-check'></i></p>";
                    build += "</div>";

                }
            }
        }
    }

    build += "</ul>";
    alert("done");
    // build += "</div>";

    $("#mycontacts").html(build);
}

function contacts_failed(msgObject) {
    alert("Failed to access contact list:" + JSON.stringify(msgObject));
}

function select_contacts(num, id) {

    // var first = num.charAt(0);
    //
    // if (first != 0 && num.length == 9) {
    //     num = "0" + num;
    // }

    var bool = $("#i" + id).val();

    if (bool == "false") {

        $("#s" + id).show();
        $("#i" + id).val("true");

        alert(num);

        //insert into the live_contacts array
        insert("" + num + "");

    } else {

        $("#s" + id).hide();
        $("#i" + id).val("false");


        del("" + num + "");

    }
}

function insert(data) {

    //if number doesn't exist in array, add it
    if (live_contacts.indexOf(data) == -1) {
        live_contacts.push(data);
    }
}

function del(data) {

    //Get index of that number
    var index = live_contacts.indexOf(data);

    //remove it from the live_contacts array
    live_contacts.splice(index);

}

function get_numbers() {
    var numbers = '';

    for (var i = 0; i < live_contacts.length; i++) {
        numbers += live_contacts[i] + ',';
    }

    $("#numbers").val(numbers);

    change_page('#messagepage', 'pop');
}

function toast(msg, duration) {

    new $.nd2Toast({ // The 'new' keyword is important, otherwise you would overwrite the current toast instance
        message: msg, // Required
        ttl: duration // optional, time-to-live in ms (default: 3000)
    });
}

function drawGauge(total, del, ack, undel, exp) {

    new Chartist.Pie('.ct-chart', {
        series: [del, ack, undel, exp]
    }, {
        donut: true,
        donutWidth: 60,
        donutSolid: true,
        startAngle: 0,
        total: total,
        showLabel: true
    });
}

function get_stats() {

    var total_sent, total_del, total_ack, total_undeliv, total_exp, bal;

    $.get("http://deywuro.com/api/stat",
        {
            username: $.cookie('username'),
            password: $.cookie('password')
        },

        function (response) {

            if (response.code == 0) {

                total_sent = response.total_sms_sent;
                total_del = response.total_sms_delivered;
                total_ack = response.total_sms_ack;
                total_undeliv = response.total_sms_undelivered;
                total_exp = response.total_sms_expired;
                bal = response.total_balance;

                $("#ttl").html(total_sent);
                $("#exp").html(total_exp);
                $("#del").html(total_del);
                $("#undeliv").html(total_undeliv);
                $("#ack").html(total_ack);

                setTimeout(
                    function () {
                        change_page("#dashboard", "pop");
                    }, 800);

                toast("Fetching your statistics", 1500);

                setTimeout(
                    function () {
                        drawGauge(total_sent, total_del, total_ack, total_undeliv, total_exp);
                    }, 1500);

            }

            if (response.message == "Invalid Credential!") {

                toast("Wrong username or password", 5000);
                // popout("loginfail", "pop");
            }
        });
}

function home() {

    $("#mycontacts").html("");
    var cookies = $.cookie();
    for (var cookie in cookies) {
        $.removeCookie(cookie);
    }
    change_page('#loginpage');
}

function send_sms() {

    var message, contacts, from;

    message = encodeURI($("#message").val());
    from = $("#from").val();
    contacts = $("#numbers").val();


    $.get("http://api.deywuro.com/bulksms/?username=" + $.cookie('username') + "&password=" + $.cookie('password') + "&destination=" + contacts + "&source=" + from + "&message=" + message,

        function (response) {
            alert(response);
        });
}



