//document.addEventListener("deviceready", function () {
//    alert("123");
//    alert(navigator.contacts);
//}, true);

//array to store contacts
var live_contacts = [];
var live_ids = [];

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
                    // drawGauge(100, 100, 100)
                    // change_page('#dashboard', 'slide');

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

                    var id = contacts[i].id;
                    var name = contacts[i].displayName;
                    var number = contacts[i].phoneNumbers[j].value;

                    build += "<div>";
                    build += "<input type='checkbox' id='" + id + "' onclick='add_number(" + number + "," + id + ")'>";
                    build += "<label for='" + id + "'>" + name + "</label>";
                    build += "</div>";

                }
            }
        }
    }

    $("#mycontacts").html(build);
}

function contacts_failed(msgObject) {
    alert("Failed to access contact list:" + JSON.stringify(msgObject));
}

function select_contacts(num, id) {

    var new_num = process_num(num);

    var bool = $("#i" + id).val();

    if (bool == "false") {

        $("#s" + id).show();
        $("#i" + id).val("true");

        //insert into the live_contacts array
        insert(new_num);
        insert_ids(id);

    } else {

        $("#s" + id).hide();
        $("#i" + id).val("false");

        del(new_num);
        del_id(id);

    }
}

function insert(data) {

    //if number doesn't exist in array, add it
    if (live_contacts.indexOf(data) == -1) {
        live_contacts.push(data);
    }
}

function insert_ids(id) {
    if (live_ids.indexOf(id) == -1) {
        live_ids.push(id);
    }
}

function del(data) {

    //Get index of that number
    var index = live_contacts.indexOf(data);

    //remove it from the live_contacts array
    live_contacts.splice(index);

}

function del_id(id) {
    var index = live_ids.indexOf(id);

    live_ids.splice(index)
}

function get_numbers() {
    var numbers = '';

    for (var i = 0; i < live_contacts.length; i++) {
        numbers += live_contacts[i] + ',';
    }

    $("#numbers").val(numbers);

    change_page('#messagepage', 'pop');
}

function clear_numbers() {
    
    // $('#gg').checked(true);
    // alert('hgj');
}

function toast(msg, duration) {

    new $.nd2Toast({ // The 'new' keyword is important, otherwise you would overwrite the current toast instance
        message: msg, // Required
        ttl: duration // optional, time-to-live in ms (default: 3000)
    });
}

function drawGauge(del, ack, undel) {

    new Chartist.Pie('.ct-chart', {
        series: [del, ack, undel]
    }, {
        donut: true,
        donutWidth: 60,
        donutSolid: true,
        startAngle: 0,
        // total: total,
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

                $("#bal").html(bal);
                $("#ttl").html(total_sent);
                $("#exp").html(total_exp);
                $("#del").html(total_del);
                $("#undeliv").html(total_undeliv);
                $("#ack").html(total_ack);

                setTimeout(
                    function () {
                        change_page("#dashboard", "slide");
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

    // $("#mycontacts").html("");
    var cookies = $.cookie();
    for (var cookie in cookies) {
        $.removeCookie(cookie);
    }
    change_page('#loginpage');
}

function send_sms() {

    var message, contacts, source;

    contacts = $("#numbers").val();
    source = encodeURI($("#source").val());
    message = encodeURI($("#message").val());

    if (contacts.length == 0) {
        toast("Please enter at least one phone number", 3000);
        return;
    }

    if (source.length == 0) {
        toast("Please enter the source of the message", 3000);
        return;
    }

    if (message.length == 0) {
        toast("Please enter a message to be sent", 3000);
        return;
    }


    $.get("http://api.deywuro.com/bulksms/?username=" + encodeURI($.cookie('username')) + "&password=" + $.cookie('password') + "&destination=" + contacts + "&source=" + source + "&message=" + message,

        function (response) {
            toast("Sending your SMS", 1000);
            get_stats();
        });

    clear_sms();
}

function process_num(number) {
    // var num = number;

    number = "" + number;

    if (number.charAt(0) != 0 && number.length == 9) {
        number = "0" + number;
        return number;
    } else {
        return number;
    }
}

function clear_sms() {
    $("#numbers").val("");
    $("#message").val("");
    $("#contacts").val("");
}

function add_number(num, id) {

    var new_num;

    if ($("#" + id).is(':checked')) {

        new_num = process_num(num)
        insert(new_num);
        insert_ids(id);
        // document.getElementById(id).click();

    } else {

        del(new_num);
        del_id(id);

    }
}



