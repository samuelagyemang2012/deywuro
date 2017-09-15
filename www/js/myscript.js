//document.addEventListener("deviceready", function () {
//    alert("123");
//    alert(navigator.contacts);
//}, true);

//array to store contacts
var live_contacts = [];
live_contacts = null;
var live_ids = [];
var contacts_array = [];
var duplicate = [];

$(function () {
    $("[data-role=header]").toolbar();
    //$("[data-role=popup]").popup().enhanceWithin();
});

function change_page(page, transition) {
    $.mobile.pageContainer.pagecontainer("change", page, {transition: transition});
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
        $.get("https://deywuro.com/api/login",
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

                    // if (contacts[i].phoneNumbers[j].value.length != 0) {
                    var id = contacts[i].id;
                    var name = contacts[i].displayName;
                    var number = contacts[i].phoneNumbers[j].value;

                    var person = {"id": id, "name": name, "number": number};

                    // build += "<input type='checkbox' id='" + data[i].id + "'>";
                    // build += "<label for='" + data[i].id + "'>" + data[i].name + "</label>";

                    if (number.length != 0) {
                        if (contacts_array.length == 0) {
                            //alert('1st');
                            //console.log('1st');
                            contacts_array.push(person);
                        }
                        else {
                            if (!containsObject(person, contacts_array)) {
                                contacts_array.push(person);
                                //console.log('othrs');
                                // alert(person.id);
                            }
                        }
                    }
                }
            }
        }
    }
    get_contacts();
}

function contacts_failed(msgObject) {
    alert("Failed to access contact list:" + JSON.stringify(msgObject));
}

function select_contacts(num) {

    var new_num = process_num(num);

    insert(new_num);
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

function insert(data) {

    // var new_num = process_num(num);
    //if number doesn't exist in array, add it

    if (live_contacts.indexOf(data) == -1) {
        live_contacts.push(data);

    } else {
        del(data);
    }
}

function done() {
    var numbers = '';

    if (live_contacts.length != 0) {
        for (var i = 0; i < live_contacts.length; i++) {
            numbers += live_contacts[i] + ',';
        }
    }

    $("#numbers").val(numbers);

    // alert(numbers);

    change_page('#messagepage', 'pop');
}

function toast(msg, duration) {

    new $.nd2Toast({ // The 'new' keyword is important, otherwise you would overwrite the current toast instance
        message: msg, // Required
        ttl: duration // optional, time-to-live in ms (default: 3000)
    });
}

function drawGauge(ack, undeliv, del) {

    new Chartist.Pie('.ct-chart', {
        series: [ack, undeliv, del]
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

    $.get("https://deywuro.com/api/stat",
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
                        change_page("#dashboard", "pop");
                    }, 800);

                toast("Fetching your statistics", 1500);

                setTimeout(
                    function () {
                        drawGauge(total_ack, total_undeliv, total_del);
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

    $.get("https://deywuro.com/api/sms/?username=" + $.cookie('username') + "&password=" + $.cookie('password') + "&destination=" + contacts + "&source=" + source + "&message=" + message,

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

function get_contacts() {

    var build = '';

    for (var i = 0; i < contacts_array.length; i++) {
        console.log(contacts_array[i].id);

        build += "<input type='checkbox' id='" + contacts_array[i].id + "' onclick='" + select_contacts(contacts_array[i].number) + "'>";
        build += "<label for='" + contacts_array[i].id + "'>" + contacts_array[i].name + "</label>";
    }

    // $(build).appendTo("#mycontacts").enhanceWithin();
    $("#mycontacts").html(build).enhanceWithin();
}

function containsObject(obj, list) {

    for (var i = 0; i < list.length; i++) {
        if (list[i].id == obj.id) {
            return true;
        }
    }

    return false;
}

function make_payment() {

    var network = $("#networks").val();
    var msisdn = $("#msisdn").val();
    var amount = $("#amount").val();
    var voucher = $("#voucher_number").val();

    if (msisdn.length == 0 || amount.length == 0) {
        toast("Please fill all the neccessary fields", 3000);
    } else {
        if (network == "mtn") {
            toast('You will soon receive an sms for confirmation', 4000);
        }

        if (network == "tigo") {

            $.get("http://5.9.86.210/pay/tigo/tigocash1.php",
                {
                    phone: msisdn,
                    amount: amount,
                    merchantName: 'DeywuroMobile',
                    description: "DeywuroMobileCredit",
                    //user_id:
                },

                function (response) {
                    toast('You will soon receive an sms for confirmation', 4000);
                });
        }

        if (network == "airtel") {
            toast('You will soon receive an sms for confirmation', 4000);
        }
    }
}

function vodafone_payment() {

    var msisdnx = $("#msisdnx").val();
    var amountx = $("#amountx").val();
    var voucher = $("#voucher_number").val();

    if (msisdnx.length == 0 || amountx.length == 0 || voucher.length == 0) {
        toast("Please fill all the neccessary fields", 3000);
    } else {

        $.post("http://5.9.61.79/pay/vodafone/deywuro_live.php",
            {
                msisdn: msisdnx,
                amount: amountx,
                voucher_number: voucher,
                description: 'Deywuro_credit_transaction',
                user_id: "npdeywuro",
                password: "hdgt2314"
            },

            function (response) {
                if (response == '00000-Done0') {
                    toast(response, 3000);
                }
                else {
                    toast('Transaction failed', 4000);
                }
            });
    }
}

function vodafone() {
    var network = $("#networks").val();

    if (network == "vodafone") {

        change_page("#vodafonepage", 'pop');
    }
}

