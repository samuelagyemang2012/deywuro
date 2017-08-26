// window.fn = {};
//
// window.fn.toggleMenu = function () {
//     document.getElementById('appSplitter').right.toggle();
// };
//
// window.fn.loadView = function (index) {
//     document.getElementById('appTabbar').setActiveTab(index);
//     document.getElementById('sidemenu').close();
// };
//
// window.fn.loadLink = function (url) {
//     window.open(url, '_blank');
// };
//
// window.fn.pushPage = function (page, anim) {
//     if (anim) {
//         document.getElementById('appNavigator').pushPage(page.id, {data: {title: page.title}, animation: anim});
//     } else {
//         document.getElementById('appNavigator').pushPage(page.id, {data: {title: page.title}});
//     }
// };
//
// ons.ready(function () {
//     const sidemenu = document.getElementById('appSplitter');
//     ons.platform.isAndroid() ? sidemenu.right.setAttribute('animation', 'overlay') : sidemenu.right.setAttribute('animation', 'reveal');
//
//     document.querySelector('#tabbar-page').addEventListener('postchange', function (event) {
//         if (event.target.matches('#appTabbar')) {
//             event.currentTarget.querySelector('ons-toolbar .center').innerHTML = event.tabItem.getAttribute('label');
//         }
//     });
// });
//

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
    
    document.getElementById('myNav').pushPage('page2', {animation: 'slide'});
    // change_page('page2', 'slide');

    // var url, username, password, balance;
    //
    // username = $("#username").val();
    // password = $('#password').val();
    //
    // if (username.length == 0 || password.length == 0) {
    //
    //     popup_show('loginfail');
    //
    // } else {
    //     $.get("http://deywuro.com/api/login",
    //         {
    //             username: username,
    //             password: password
    //         },
    //
    //         function (response) {
    //
    //             if (response.message == "Successful Login") {
    //
    //                 $("#username").val("");
    //                 $("#password").val("");
    //
    //                 $.cookie('username', username);
    //                 $.cookie('password', password);
    //
    //                 change_page('page2', 'slide');
    //
    //                 // load_contacts();
    //                 // get_stats();
    //
    //             }
    //
    //             if (response.message == "Invalid Credential!") {
    //
    //                 popup_show('loginfail');
    //             }
    //         });
    // }
}