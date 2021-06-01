// get the post id and owner of the post from the url
var postid = new URLSearchParams(window.location.search).get('id');
var postowner = new URLSearchParams(window.location.search).get('owner');
// construct the new url for getpost
const postUrl = '/eachPost/' + postid + '&' + postowner;
// get specific post info from backend
$.ajax({
    type: "GET",
    url: postUrl,
    cache: false,
    success: function(data, status) {
      // expected data to be [post, user]
      const post = data[0]
      const user = data[1]
      // using jQuery to update post info
      $('#title').text(post.name);
      $('.userName').text(`${user.firstName} ${user.lastName}`);
      $('#address').text(post.address);
      $('#Personal-info .card-body').text(user.selfDescription);
      $('#describtion').text(post.description);
      $('#pet').text(post.pet);
      $('#price').text(post.price);
      $('#gender').text(post.gender);
      $('#roomType').text(post.roomType);
      $('#headshot').attr('src', user.photo);
      const images = post.images;
      if(images.length > 0){
      for (i = 0; i < images.length; i++) {
          const id = `#${i}`;
          $(id).attr('src', "/" + images[i]);
        }
        $('#houseImageIndicators').show();
      }
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log('Error!  Status = ' + xhr.status);
    }
});

// onclick email sender function
function send() {
  const url = postUrl +`/sendEmial`
  const content = $('#email-content').val()
  // send email content to backend
  $.ajax({
      type: "POST",
      url: url,
      cache: false,
      data: {
        "content": content
      },
      success: function(data, status) {
        // expected data to be {'flag': 'success'}
        if (data.flag === 'success') {
          $('#email-content').val("");
          alert('Email has send successfully!');
        } else if(data.flag === 'block') {
          alert('You have been block. Please contact admin.');
        } else {
          alert('Email sending failed, please try again!');
        }
      },
      error: function(xhr, textStatus, errorThrown) {
        console.log('Error!  Status = ' + xhr.status);
      }
  });
}

// topbar checker to update the signed-in user info
function topbarChecker() {
  const url = '/sessionChecker';
  $.ajax({
    type: "GET",
    url: url,
    cache: false,
    success: function(data, status) {
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
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log('Error!  Status = ' + xhr.status);
    }
  });
}

topbarChecker();

// onclick logout function
function logOut() {
  const url = '/logout';
  $.ajax({
    type: "get",
    url: url,
    cache: false,
    success: function(data, status) {
      if(data.data == "success") {
        window.location.href = '/'
      }
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log('Error!  Status = ' + xhr.status);
    }
  });
}

// onclick new post function
function newPost() {
  $.ajax({
    type: "GET",
    url: "/newPostCheck",
    cache: false,
    success: function(data, status) {
      if(data.data == "blocked"){
        alert("You have been block. Please contact admin.")
      } else if(data.data == "user"){
        window.location.replace("/newPost");
      } else {
        alert("This is admin account. Please switch account to view page.");
      }
    },
    error: function(xhr, textStatus, errorThrown) {
        console.log('Error!  Status = ' + xhr.status);
    }
  });
}
