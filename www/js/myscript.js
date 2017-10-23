//document.addEventListener("deviceready", function () {
//    alert("123");
//    alert(navigator.contacts);
//}, true);

var contacts_array = [];
var groups = [];
var group_names = [];
var new_array = [];

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
                    $.cookie('user_id', response.user_id);

                    load_contacts();

                    get_stats();

                    get_sms_groups();
                }

                if (response.message == "Invalid Credential!") {

                    toast("Wrong username or password", 5000);
                }
            });
    }
}

function register() {
    var username, name, email, number, password, cpassword;

    username = $("#rusername").val();
    name = $("#rname").val();
    email = $("#remail").val();
    number = $("#rnumber").val();
    password = $("#rpassword").val();
    cpassword = $("#rcpassword").val();

    if (username.length == 0 || password.length == 0 || name.length == 0 || number.length == 0 || cpassword.length == 0) {
        toast("Please fill all the required fields", 4000);
    } else if (password != cpassword) {
        toast("Passwords do not match", 4000);
    } else {

        $.post("https://deywuro.com/api/register?name=" + name + "&email=" + email + "&phone_number=" + number + "&username=" + username + "&password=" + password,

            function (response) {

                if (response.code == 0) {

                    $("#rusername").val('');
                    $("#rname").val('');
                    $("#remail").val('');
                    $("#rnumber").val('');
                    $("#rpassword").val('');
                    $("#rcpassword").val('');

                    toast(response.message, 5000);

                    change_page("#loginpage", "pop")

                } else {

                    toast(response.message, 5000);

                }
            }
        );
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

                    number = number.replace(/\s+/g, '');
                    number = number.replace(/\(|\)/g, '');
                    number = number.replace(/\+/g, " ");
                    number = number.replace(/\-/g, " ");

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
                            if (!containsId(person, contacts_array) && !containsNumber(person, contacts_array)) {
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

    var test = '';
    var new_num = process_num(num);

    insert(new_num);
}

function select_groups(num, data) {
    insert_group(num);
    insert_group_name(data);
}

function del(data) {

    //Get index of that number
    var index = new_array.indexOf(data);

    //remove it from the live_contacts array
    new_array.splice(index);

}

function insert(data) {

    // var new_num = process_num(num);
    //if number doesn't exist in array, add it

    if (new_array.indexOf(data) == -1) {
        // alert("number-add: " + data);
        new_array.push(data);

    } else {


        var p = $("#numbers").val();
        var warray = p.split(",");
        var new_num = '';

        var num_index = warray.indexOf(data);
        warray.splice(num_index, 1);

        for (var i = 0; i < warray.length; i++) {
            new_num += warray[i] + ',';
        }
        // alert(new_num);
        $("#numbers").val(new_num);

        var index = new_array.indexOf(data);
        new_array.splice(index, 1);

    }
}

function insert_group(data) {

    if (groups.indexOf(data) == -1) {
        // alert("number-add: " + data);
        groups.push(data);

    } else {

        // var p = $("#numbers").val();
        // var warray = p.split(",");
        // var new_num = '';
        //
        // var num_index = warray.indexOf(data);
        // warray.splice(num_index, 1);
        //
        // for (var i = 0; i < warray.length; i++) {
        //     new_num += warray[i] + ',';
        // }
        // // alert(new_num);
        // $("#numbers").val(new_num);

        var index = groups.indexOf(data);
        groups.splice(index, 1);

    }
}

function insert_group_name(data) {
    if (group_names.indexOf(data) == -1) {
        // alert("number-add: " + data);
        group_names.push(data);

    } else {

        // var p = $("#numbers").val();
        // var warray = p.split(",");
        // var new_num = '';
        //
        // var num_index = warray.indexOf(data);
        // warray.splice(num_index, 1);
        //
        // for (var i = 0; i < warray.length; i++) {
        //     new_num += warray[i] + ',';
        // }
        // // alert(new_num);
        // $("#numbers").val(new_num);

        var index = group_names.indexOf(data);
        group_names.splice(index, 1);

    }
}

function done() {
    var numbers = '';
    var pre = $("#numbers").val();

    var pret = pre.trim();

    if (new_array.length != 0) {
        for (var i = 0; i < new_array.length; i++) {
            numbers += new_array[i] + ',';
        }
    }

    var new_string = pre + "," + numbers;

    var cu = new_string.split(",");
    var cud = Array.from(new Set(cu));


    // let fruits = ['apple','banana','orange','apple','mango','banana'];
    // let fruits_without_duplicates = Array.from(new Set(fruits));


    $("#numbers").val(cud);


    change_page('#messagepage', 'pop');
}

function group_done() {
    var gnumbers = '';
    var gname = '';

    if (group_names.length != 0) {
        for (var s = 0; s < group_names.length; s++) {
            gname += group_names[s] + ',';
        }
    }

    $("#gnumbers").val(gname);
    // alert(gnumbers);
    // alert(gname);

    change_page("#gmessagepage", "pop");

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

function convert_num() {

    var num = $("#msisdnx").val();

    var first = num.charAt(0);

    if (first == '0') {

        first = '233';
        var substring = num.substring(1, 10);
        num = first + substring;

        $("#msisdnx").val(num);

    }
}

function convert_num2() {

    var num = $("#msisdn").val();

    var first = num.charAt(0);

    if (first == '0') {

        first = '233';
        var substring = num.substring(1, 10);
        num = first + substring;

        $("#msisdn").val(num);

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
        // console.log(contacts_array[i].number);

        build += "<input onclick='select_contacts(" + contacts_array[i].number + ")' type='checkbox' id='" + contacts_array[i].id + "'>";

        // build += "<input onclick='select_contacts(" + contacts_array[i].number + ")' type='checkbox' id='" + contacts_array[i].id + "'>";
        build += "<label for='" + contacts_array[i].id + "'>" + contacts_array[i].name + "</label>";
    }

    // $(build).appendTo("#mycontacts").enhanceWithin();
    $("#mycontacts").html(build).enhanceWithin();
    // change_page("#contactspage","pop");
}

function containsId(obj, list) {

    for (var i = 0; i < list.length; i++) {
        if (list[i].id == obj.id) {
            return true;
        }
    }

    return false;
}

function containsNumber(obj, list) {

    for (var i = 0; i < list.length; i++) {
        if (list[i].number == obj.number) {
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
        toast("Please fill all the neccessary fields", 4000);
    } else {
        if (network == "mtn") {
            //$("#msisdn").val('');
            $("#amount").val('');
            toast("You will receive an sms shortly", 10000);

            $.post("http://5.9.86.210/pay/mtn/deywuro_live.php",
                {
                    msisdn: msisdn,
                    amount: amount,
                    description: 'DMC',
                    user_id: "npdeywuro",
                    password: "hdgt2314",
                    username: $.cookie('username')

                },

                function (response) {
                    // alert(response);
                    if (response == '00000-Done') {

                        setTimeout(
                            function () {
                                get_balance();
                            }, 800);
                    }
                    else {
                        toast('Transaction failed', 4000);
                    }
                }
            );
        }

        if (network == "tigo") {
            //$("#msisdn").val('');
            $("#amount").val('');
            toast("You will receive an sms shortly", 5000);

            $.post("http://5.9.86.210/pay/tigo/deywuro_live.php",
                {
                    msisdn: msisdn,
                    amount: amount,
                    description: 'DMC',
                    user_id: "npdeywuro",
                    password: "hdgt2314",
                    username: $.cookie('username')
                },

                function (response) {
                    // alert(response);
                    if (response == '00000-Done') {

                        setTimeout(
                            function () {
                                get_balance();
                            }, 800);
                    }
                    else {
                        toast('Transaction failed', 4000);
                    }
                }
            );
        }

        if (network == "airtel") {
            //$("#msisdn").val('');
            $("#amount").val('');
            toast("You will receive an sms shortly", 5000);

            $.post("http://5.9.86.210/pay/airtel/deywuro_live.php",
                {
                    msisdn: msisdn,
                    amount: amount,
                    description: 'DMC',
                    user_id: "npdeywuro",
                    password: "hdgt2314",
                    username: $.cookie('username'),
                },

                function (response) {
                    // alert(response);
                    // if (response == '00000-Done') {

                    setTimeout(
                        function () {
                            get_balance();
                        }, 800);
                    // }
                    // else {
                    // toast('Transaction failed', 4000);
                    // }
                }
            );
        }
    }
}

function vodafone_payment() {

    var num;
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
                description: 'DMC',
                user_id: "npdeywuro",
                password: "hdgt2314",
                username: $.cookie('username')
            },

            function (response) {
                // alert(response);
                if (response == '00000-Done') {
                    toast("Your request is being processed.", 6000);

                    $("#msisdnx").val('');
                    $("#amountx").val('');
                    $("#voucher_number").val('');

                    setTimeout(
                        function () {
                            get_balance();
                        }, 800);
                }
                else {
                    toast('Transaction failed', 8000);
                }
            }
        );
    }
}

function vodafone() {
    var network = $("#networks").val();

    if (network == "vodafone") {

        change_page("#vodafonepage", 'pop');
    }
}

function get_balance() {

    var bal, rounded;

    toast("Fecthing your balance", 4000);

    $.get("https://deywuro.com/api/stat",
        {
            username: $.cookie('username'),
            password: $.cookie('password')
        },

        function (response) {

            if (response.code == 0) {

                bal = response.total_balance;

                rounded = Math.round(bal * 100) / 100;

                $("#balance").html("GHC" + " " + rounded);

                setTimeout(
                    function () {
                        change_page("#paymentspage", "pop");
                    }, 800);
            }
        });
}

function get_sms_groups() {
    var build;

    build = '';

    $.post("https://deywuro.com/api/get_groups",
        {
            id: $.cookie('user_id'),
        },

        function (response) {


            if (response.count > 0) {

                for (var i in response.data) {

                    build += "<input onclick='select_groups(" + response.data[i].id + ',' + '"' + response.data[i].name + '"' + ")' type='checkbox' id='" + response.data[i].id + "'>";

                    build += "<label for='" + response.data[i].id + "'>" + response.data[i].name + "</label>";

                    $("#mysmsgrouppage").html(build).enhanceWithin();

                }

            } else {
                build += "<div class='align-center'>";
                build += "<p>No SMS Groups yet</p>";
                build += "</div>";

                $("#mysmsgrouppage").html(build).enhanceWithin();

            }
        });

    // change_page("#smsgrouppage", "pop");
}

function send_group_sms() {

    var gnumbers, source, message;

    gnumbers = '';


    if (groups.length != 0) {
        for (var i = 0; i < groups.length; i++) {
            gnumbers += groups[i] + ',';
        }
    }

    source = $("#gsource").val();
    message = $("#gmessage").val();

    // alert("ids: " + gnumbers + " source: " + source + " message:" + message);

    $.post("https://deywuro.com/api/send_group_sms",
        {
            ids: gnumbers,
            source: source,
            message: message,
            username: $.cookie('username'),
            password: $.cookie('password')

        },

        function (response) {


            if (response.contacts > 0) {

                toast("Sending your message to " + response.contacts + " contacts", "3500");

            } else {

                toast("Sending your message to " + response.contacts + " contacts", "3500");
            }
        });
}