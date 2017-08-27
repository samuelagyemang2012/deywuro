function popup_show(id) {
    document.getElementById(id).show();
}

function popup_close(id) {
    document.getElementById(id).hide();
}

function change_page(page, animation) {
    document.getElementById('myNav').pushPage(page, {animation: animation});
}

function login() {

    // change_page('page2','slide');
    // document.getElementById('myNav').pushPage('page2', {animation: 'slide'});
    // change_page('page2', 'slide');
    //
    var url, username, password, balance;

    username = $("#username").val();
    password = $('#password').val();

    if (username.length == 0 || password.length == 0) {

        popup_show('loginfail');

    } else {
        $.get("http://deywuro.com/api/login",
            {
                username: username,
                password: password
            },

            function (response) {

                if (response.message == "Successful Login") {

                    $("#username").val("");
                    $("#password").val("jkjkjkjk");

                    $.cookie('username', username);
                    $.cookie('password', password);

                    // change_page('page2', 'slide');

                    // load_contacts();
                    get_stats();
                    //
                }

                if (response.message == "Invalid Credential!") {

                    popup_show('loginfail');
                }
            });
    }
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

                // alert(bal);
                // $("#d").html("jasjdjadjas");
                // document.getElementById('bal').innerHTML = "sads";
                // $("#bal").html('');

                $("#ttl").html(total_sent);
                $("#exp").html(total_exp);
                $("#del").html(total_del);
                $("#undeliv").html(total_undeliv);
                $("#ack").html(total_ack);

                setTimeout(
                    function () {
                        change_page("page2", "slide");
                        alert($("#dd").val());
                    }, 800);
            }
        });
}