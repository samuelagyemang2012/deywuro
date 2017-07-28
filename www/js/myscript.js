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

/*
 Changes a page
 page: id of page eg. #loginpage
 transition: animation to play when changing page eg. slide
 */
function change_page(page, transition) {
    $.mobile.pageContainer.pagecontainer("change", page, {transition: transition});
}

/*
 Displays a popout
 page: id of popout eg. loginpagepopout
 transition: animation to play when displaying the pop up eg. slide
 */
function popout(id, transition) {
    $("#" + id).popup("open", {transition: transition});
}

function popout_close(id, transition) {
    $("#" + id).popup("close", {transition: transition});
}

/*
 Logs the user in

 */
function login() {

    var url, username, password, balance;

    //get user's username and password
    username = $("#username").val();
    password = $("#password").val();

    if (username.length == 0 || password.length == 0) {
        popout('loginfail2', 'pop');
    }

    ////not null
    if (username.length > 0 && password.length > 0) {

        //login api
        $.get("http://deywuro.com:12111/api/login",
            {
                username: username,
                password: password
            },

            function (response) {

                if (response.message == "Successful Login") {

                    load_contacts();

                    //store details in cookies
                    $.cookie('username', username);
                    $.cookie('password', password);
                    $.cookie('balance', response.bal);
                    balance = $.cookie('balance');

                    //update balance section of dashboard page
                    $("#mybalance").html('<h4 id="bal" style="font-family: Quicksand" class="align-center"><b style="color: #8E0D0E">Balance: &nbsp; </b>' + balance + '</h4><hr>');

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

/*
 load contacts from phone
 */
function load_contacts() {

    var obj = new ContactFindOptions();
    obj.filter = "";
    obj.multiple = true;

    //alert("start");
    navigator.contacts.find([navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.phoneNumbers], contacts_success, contacts_failed, obj);
}

/*
 Sucess function
 */
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

                    build += "<div class='col-xs-12' id='" + contacts[i].id + "' onclick='select_contacts(" + contacts[i].phoneNumbers[j].value + "," + contacts[i].id + ")'>";
                    build += "<input style='opacity: 0' hidden value='false' id='i" + contacts[i].id + "'>";
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

/*
 error functions
 */
function contacts_failed(msgObject) {
    alert("Failed to access contact list:" + JSON.stringify(msgObject));
}

//function to_contacts_page() {
//    change_page("#contacts", "pop");
//}

/*
 Gets a particular number, highlights it and pushes it to the live_contacts array
 */
function select_contacts(num, id) {

    //alert("number: " + num + "id: " + id);

    var bool = $("#i" + id).val();
    //
    if (bool == "false") {

        //if number is not selected, highlight background of number field and insert it into the live_contacts array
        $("#" + id).css("background-color", "#EF9E9A");
        $("#i" + id).val("true");

        //insert into the live_contacts array
        insert(num);

    } else {
        //if number is selected, unhighlight the number field and delete it from the live_contacts array
        $("#" + id).css("background-color", "#EEEEEE");
        $("#i" + id).val("false");

        //delete from the live_contacts array
        del(num);

    }
}

/*
 Inserts a number into the live_contacts array
 data: number
 */
function insert(data) {

    //if number doesn't exist in array, add it
    if (live_contacts.indexOf(data) == -1) {
        live_contacts.push(data);
    }
}

/*
 Deletes a number from the live_contacts array
 data: number
 */
function del(data) {

    //Get index of that number
    var index = live_contacts.indexOf(data);

    //remove it from the live_contacts array
    live_contacts.splice(index);

}

/*
Fetch all numbers from the live_contacts array and paste it in the numbers textarea. Change page back to the dashboard page
 */
function get_numbers() {
    var numbers = '';

    for (var i = 0; i < live_contacts.length; i++) {
        numbers += live_contacts[i] + ';';
    }

    $("#numbers").val(numbers);

    change_page('#dashboard', 'pop');
}
