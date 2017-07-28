//document.addEventListener("deviceready", function () {
//    alert("123");
//    alert(navigator.contacts);
//}, true);

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

    username = $("#username").val();
    password = $("#password").val();

    if (username.length == 0 || password.length == 0) {
        popout('loginfail2', 'pop');
    }

    ////not null
    if (username.length > 0 && password.length > 0) {

        $.get("http://deywuro.com:12111/api/login",
            {
                username: username,
                password: password
            },

            function (response) {

                if (response.message == "Successful Login") {

                    load_contacts();

                    $.cookie('username', username);
                    $.cookie('password', password);
                    $.cookie('balance', response.bal);
                    balance = $.cookie('balance');

                    $("#mybalance").html('<h4 id="bal" style="font-family: Quicksand" class="align-center"><b style="color: #8E0D0E">Balance: &nbsp; </b>GHC 1200</h4><hr>');

                    setTimeout(
                        function () {
                            change_page("#dashboard", "pop");
                        }, 800);
                }

                if (response.message == "Invalid Credential!") {

                    popout("loginfail", "pop");
                }
            });
    } else {
        popout("loginfail2", "pop");
    }
}

function load_contacts() {

    var obj = new ContactFindOptions();
    obj.filter = "";
    obj.multiple = true;

    //alert("start");
    navigator.contacts.find([navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.phoneNumbers], contacts_success, contacts_failed, obj);
}

function contacts_success(contacts) {

    var build;
    build = "";
    build += "<div class='container'>";
    build += "<div class='row'>";

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

                    //$.cookie('i' + contacts[i].id, '' + contacts[id].id);

                    build += "<div class='col-xs-12' id='" + contacts[i].phoneNumbers[j].value + "'onclick='select_contacts(" + contacts[i].phoneNumbers[j].value + ")'>";
                    build += "<input style='opacity: 0' hidden value='false' id='i" + contacts[i].phoneNumbers[j].value + "'>";
                    //build += "<input type='text' name='checkbox-1a' id='i" + contacts[i].id + "' checked=''>";
                    build += "<p><b style='color: #8E0D0E'>" + name + "</b></p>";
                    build += "<p><b style='color: #8E0D0E'>" + number + "</b></p>";
                    build += "</div>";

                }
            }
        }
    }

    build += "</div>";
    build += "</div>";

    $("#mycontacts").html(build);
}

function contacts_failed(msgObject) {
    alert("Failed to access contact list:" + JSON.stringify(msgObject));
}

function to_contacts_page() {
    change_page("#contacts", "pop");
}

function select_contacts(num) {

    var bool = $("#i" + num).val();

    if (bool == "false") {

        $("#" + num).css("background-color", "#EF9E9A");
        $("#i" + num).val("true");
        insert(num);

    } else {

        $("#" + num).css("background-color", "#EEEEEE");
        $("#i" + num).val("false");
        del(num);

    }
}

function insert(data) {

    if (live_contacts.indexOf(data) == -1) {
        live_contacts.push(str1);
    }
}

function del(data) {

    var index = live_contacts.indexOf(data);

    live_contacts.splice(index);

}
