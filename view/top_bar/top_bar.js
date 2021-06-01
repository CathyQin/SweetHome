// check the user type in order to update the top bar
function topbarChecker() {
  url = '/sessionChecker';
  // check the server type from backend
  $.ajax({
    type: "GET",
    url: url,
    cache: false,
    success: function(data, status) {
      // expected data to be {signIn, type, imageUrl}
      // check if the user type is user and the status is sign in
      if (data.signIn && data.type === 'user') {
        $(".topbar").html(`
          <div class="top-left">
            <a href="/">
              <img id="logoImageTop" src="../../Images/logo.png">
            </a>
          </div>
          <div class="top-right">
            <div class="loginTopBar">
              <a class="menu" id="newPost" onclick="newPost()"><strong>NEW POST</strong></a>
              <a class="menu" id="searchPage" href="/"><strong>SEARCH</strong></a>
              <a data-toggle="dropdown"><img src="` + data.imageUrl + `" id="personalPhoto"></a>
              <div class="dropdown-menu" aria-labelledby="dropdownMenuLink" style="margin-top:15px;">
                <a id="" class="dropdown-item" style="color: #1C8ABE;" href="../personal_info/personal_info.html">`+ data.username + `</a>
                <a class="dropdown-item" style="color: #1C8ABE;" onclick="logOut()">Log Out</a>
              </div>
            </div>
          </div>
        `);
        // check if the user is admin and is signin
      } else if(data.signIn && data.type === 'admin') {
        $(".topbar").html(`
            <div class="top-left">
                <a class="navbar-header" href="/admin">
                    <img id="logoImageTop" src="../../Images/logo.png">
                </a>
                <div class="top-right">
                    <p class="button" onclick="logOut()"><strong>Log Out</strong></p>
                </div>
            </div>
        `);
      }
      // check if there is no user
      else {
        $(".topbar").html(`
          <div class="top-left">
            <a href="/">
              <img src="../../Images/logo.png" style="height: 35px; margin-top: 5px; float: left; cursor: pointer;">
            </a>
          </div>
          <div class="top-right">
            <p class="button" data-toggle="modal" data-target="#signInModal"><strong>Sign in</strong></p>
            <p class="button" data-toggle="modal" data-target="#registerModal"><strong>Register</strong></p>
          </div>
        `);
        // the following code is the modal of sign in
        $("#signInModal").html(`
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="signInModalTitle">Sign In</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true" class="titleButton">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form action="" id="signInForm">
              <div id="errorUser" class="error-message"></div>
              <div class="block">
                <label for="username">Username:</label>
                <input type="text" name="email" placeholder="Username"><br>
              </div>
              <div class="block">
                <label for="password">Password:</label>
                <input type="password" name="password" placeholder="Password">
                <div id="errorPassword"></div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <p class="modal-button" data-dismiss="modal">Close</p>
            <p class="modal-button" onclick="signIn()">Sign In</p>
          </div>
        </div>
      </div>`);
        // the following code is the modal of register
        $("#registerModal").html(`
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="registerModalTitle">Register</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true" class="titleButton">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form action="" id="registerForm">
              <div id="formCheck"> </div>
              <div class="block">
                <label for="firstName">First Name:</label>
                <input type="text" name="firstName" placeholder="First Name" required>
                <div class="error-message" id="firstName-error"></div>
              </div>
              <div class="block">
                <label for="lastName">Last Name:</label>
                <input type="text" name="lastName" placeholder="Last Name" required>
                <div class="error-message" id="lastName-error"></div>
              </div>
              <div class="block">
                <label for="loginID">Login ID:</label>
                <input type="text" name="loginID" placeholder="Login ID" required>
                <div class="error-message" id="ID-error"></div>
              </div>
              <div class="block">
                <label for="password">Password:</label>
                <input type="password" name="password" placeholder="Password" required>
                <div class="error-message" id="password-error"></div>
              </div>
              <div class="block">
                <label for="email">Email:</label>
                <input type="email" name="email" placeholder="Email" require="required">
                <div class="error-message" id="email-error"></div>
              </div>
              <div class="block">
                <label for="gender">Gender:</label>
                <select id='gender'>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="female">Other</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <p class="modal-button" data-dismiss="modal">Close</p>
            <p class="modal-button" id="register" onclick="register()">Register & Sign In</p>
          </div>
        </div>
      </div>
    `);
      }
    },
    // check if there is a error from backend
    error: function(xhr, textStatus, errorThrown) {
        console.log('Error!  Status = ' + xhr.status);
    }
  });
}

// auto call the topbarChecker everytime
topbarChecker();

// the function of signIn in order to sign in
function signIn() {
  var signInForm = document.querySelector("#signInForm");
  var userOrEmail = signInForm.email.value;
  var password = signInForm.password.value;

  const url = '/login';

  // by calling the backend to sign in using post
  $.ajax({
    type: "POST",
    url: url,
    cache: false,
    data: {'user': userOrEmail, 'password': password},
    success: function(data, status) {
      // expected data to be {data}
      if (data.data === 'user') {
        // reset the value of html value
        signInForm.email.value = "";
        signInForm.password.value = "";
        $("#errorPassword").html("");
        $("#errorUser").html("");
        $('#signInModal').modal('hide');
        topbarChecker();
      } else if (data.data === 'admin') {
        // reset the value of html value
        signInForm.email.value = "";
        signInForm.password.value = "";
        $("#errorPassword").html("");
        $("#errorUser").html("");
        $('#signInModal').modal('hide');
        signInForm.email.value = "";
        window.open("/admin", "_self");
      }
      else{
        if (data.data === 'error') {
          $("#errorPassword").html("");
          $("#errorUser").html("*Please check user name and password*");
        }
      }
    },
    error: function(xhr, textStatus, errorThrown) {
        console.log('Error!  Status = ' + xhr.status);
    }
  });
}

function logOut() {
  url = '/logout';

  // by calling the backend to log out using get
  $.ajax({
    type: "get",
    url: url,
    cache: false,
    success: function(data, status) {
      // expected data to be {data}
      // creplace the window
      if(data.data == "success") {
        window.location.replace("/");
      }
    },
    error: function(xhr, textStatus, errorThrown) {
        console.log('Error!  Status = ' + xhr.status);
    }
  });
}

// the function is for registering
function register() {
  // get the value from input
  var registerForm = document.querySelector("#registerForm");
  var email = registerForm.email.value;
  var password = registerForm.password.value;
  var firstName = registerForm.firstName.value;
  var lastName = registerForm.lastName.value;
  var loginID = registerForm.loginID.value;
  var g = document.getElementById('gender');
  var gender = g.options[g.selectedIndex].value;
  var check = true;

  // the following code is check the restriction of register and add error
  if(email === ""){
    $("#email-error").html("*Email is a required field.*");
    check = false;
  } else if(!validateEmail(email)) {
    $("#email-error").html("*Email is not validated.*");
    check = false;
  } else{
    $("#email-error").html("");
  }
  if(password === ""){
    $("#password-error").html("*Password is a required field.*");
    check = false;
  } else if(password.length < 8) {
    $("#password-error").html("*Password must be no less than 8 digits.*");
    check = false;
  }
  else{
    $("#password-error").html("")
  }
  if(firstName === ""){
    $("#firstName-error").html("*First name is a required field.*");
    check = false;
  } else{
    $("#firstName-error").html("")
  }
  if(lastName === ""){
    $("#lastName-error").html("*Last name is a required field.*");
    check = false;
  } else{
    $("#lastName-error").html("")
  }
  if(loginID === ""){
    $("#ID-error").html("*Login ID is a required field.*");
    check = false;
  } else{
    $("#ID-error").html("")
  }
  // if no error occurs, then calling backend to register
  // store the data to database
  if(check){
    const url = "/register"
    if(email != "" && password != "" && firstName != "" && lastName != "" && loginID != "" && gender != "") {
      // calling the backend to insert user info
      $.ajax({
        type: "POST",
        url: url,
        cache: false,
        data: {'loginID': loginID,
              'password': password,
              'firstName': firstName,
              'lastName': lastName,
              'email': email,
              'gender': gender
              },
        success: function(data, status) {
          // expected data to be {data} to indicate the status of register
          // check if the user is Successfully registered
          if(data.data === "registered"){
            document.querySelector("#registerForm").email.value = "";
            document.querySelector("#registerForm").password.value = "";
            document.querySelector("#registerForm").firstName.value = "";
            document.querySelector("#registerForm").lastName.value = "";
            document.querySelector("#registerForm").loginID.value = "";
            $("#formCheck").html("");
            $('#registerModal').modal('hide');
            $("#ID-error").html("")
            $("#lastName-error").html("")
            $("#firstName-error").html("")
            $("#password-error").html("")
            $("#email-error").html("");
            // update the topbar
            topbarChecker();
            // check if the id is existed
          } else if(data.data === "id is not unique"){
            $("#ID-error").html("*ID has been used*");
            // check if the email is existed
          } else if(data.data === "email is not unique") {
            $("#email-error").html("*Email has been used*");
          }
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log('Error!  Status = ' + xhr.status);
        }
      });
    }
  }
}

// set the return as same as sign in buttom
$("#signInModal").keyup(function(event){
    if(event.keyCode == 13){
      signIn();
    }
});

// set the return as same as register buttom
$("#registerModal").keyup(function(event){
    if(event.keyCode == 13){
      register();
    }
});

// check if the email is validated
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

// check if the user type is correct to view the new post
function newPost() {
  $.ajax({
    type: "GET",
    url: "/newPostCheck",
    cache: false,
    success: function(data, status) {
      // expected data to be {data} to indicate the status of the user
      // check if the user is bloacked
      if(data.data == "blocked"){
        alert("You have been block. Please contact admin.")
        // check if the user is user
      } else if(data.data == "user"){
        window.location.replace("/newPost");
        // otherwise the admin account
      } else {
        alert("This is admin account. Please switch account to view page.");
      }
    },
    error: function(xhr, textStatus, errorThrown) {
        console.log('Error!  Status = ' + xhr.status);
    }
  });
}
