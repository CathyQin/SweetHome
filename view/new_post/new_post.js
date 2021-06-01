// var to store filter info
var selected = {};
selected["gender"] = "";
selected["pet"] = "";
selected["room"] = "";
selected["price"] = "";
// get personal preferences from server
// code below need server call
$(".select-list dd").click(function () {
  var className = this.className;

  $(this).addClass("selected").siblings().removeClass("selected");
  if ($(this).hasClass("select-all_gender")) {
    selected["gender"] = "";
    $("#selectGender").remove();
  } else if($(this).hasClass("select-all_pet")){
    selected["pet"] = "";
    $("#selectPet").remove();
  } else if($(this).hasClass("select-all_price")){
    selected["price"] = "";
    $("#selectPrice").remove();
  } else if($(this).hasClass("select-all_room")){
    selected["room"] = "";
    $("#selectRoom").remove();
  } else {
    if(className == "gender"){
      var copyThisA = $(this).clone();
      selected["gender"] = $(this).text();
      if ($("#selectGender").length > 0) {
        $("#selectGender a").html($(this).text());
      } else {
        $(".select-result dl").append(copyThisA.attr("id", "selectGender"));
      }
    }else if(className == "pet"){
      var copyThisB = $(this).clone();
      selected["pet"] = $(this).text();
      if ($("#selectPet").length > 0) {
        $("#selectPet a").html($(this).text());
      } else {
        $(".select-result dl").append(copyThisB.attr("id", "selectPet"));
      }
    }else if(className == "price"){
      var copyThisC = $(this).clone();
      selected["price"] = $(this).text();
      if ($("#selectPrice").length > 0) {
        $("#selectPrice a").html($(this).text());
      } else {
        $(".select-result dl").append(copyThisC.attr("id", "selectPrice"));
      }
    }else if(className == "room"){
      var copyThisC = $(this).clone();
      selected["room"] = $(this).text();
      if ($("#selectRoom").length > 0) {
        $("#selectRoom a").html($(this).text());
      } else {
        $(".select-result dl").append(copyThisC.attr("id", "selectRoom"));
      }
    }
  }
  if ($(".select-result dd").length > 1) {
    $(".select-no").hide();
  } else {
    $(".select-no").show();
  }
});

var files;

//image file preview
$('.file-upload-input').change(function (e){
  $('.image-holder').html('');
  files = e.target.files;
  if (files.length > 6) {
    alert("You can select only upto 6 images");
  } else {
    for (i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = function(event){
        const newimg_holder = document.createElement('div');
        newimg_holder.className = 'newimg-holder';

        const newimg = document.createElement('img');
        newimg.className = 'img-display';
        newimg.src = event.target.result;

        const imgName = document.createElement('p');
        imgName.className = 'img-name';
        imgName.appendChild(document.createTextNode(file.name));

        newimg_holder.appendChild(newimg);
        newimg_holder.appendChild(imgName);
        $('.image-holder').append(newimg_holder);
      }
      reader.readAsDataURL(file);
    }
  }
})

function topbarChecker() {
  const url = '/sessionChecker';
  $.ajax({
    type: "GET",
    url: url,
    cache: false,
    success: function(data, status) {
      if (data.signIn) {
        const imageUrl = data.imageUrl;
        const username = data.username;
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
              <a data-toggle="dropdown"><img src="` + imageUrl + `" id="personalPhoto"></a>
              <div class="dropdown-menu" aria-labelledby="dropdownMenuLink" style="margin-top:15px;">
                <a id="userTopBarID" class="dropdown-item" style="color: #1C8ABE;" href="../personal_info/personal_info.html">`+ username + `</a>
                <a class="dropdown-item" style="color: #1C8ABE;" onclick="logOut()">Log Out</a>
              </div>
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

// cb for google map api
function initAutocomplete() {
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
}

// onclick post function
function post(){
  // address input
  var address = document.getElementById('pac-input').value;
  var geocoder = new google.maps.Geocoder();
  // title input
  const title = document.getElementById('newpost-title').value
  // description input
  const description = document.getElementById('newpost-housediscrib').value
  // empty input checker
  let count = 0;
  if (title.length == 0) {
    $("#error_message_title").html("*Please enter your title*");
    count += 1;
  } else {
    $("#error_message_title").html("");
  }
  
  if (description.length == 0) {
    $("#error_message_description").html("*Please enter your description*");
    count += 1;
  } else {
    $("#error_message_description").html("");
  }

  if(address.length == 0) {
    $("#error_message_address").html("*Please enter your preferred address*");
    count += 1;
  } else {
    $("#error_message_address").html("");
  }
  // only connect to backend when title, description and address input are not empty
  if (count == 0) {
    // construct url for new post
    const userId = document.getElementById('userTopBarID').text
    const url = `/user/` + userId + `/post`
    // filter info
    const pet = selected["pet"]
    const gender = selected["gender"];
    const roomtype =  selected["room"];
    const price = selected["price"];
    // formdata for image files
    var formdata = new FormData()
    if (files) {
      for (var i = 0; i < files.length; i++){
        formdata.append('photo', files[i])
      }
    }
    // using geocoder api to get the latitute and longitute of the input address
    geocoder.geocode({'address': address}, function(results, status) {
      if (status === 'OK') {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        const coordinate = [lat, lng];
        // send data to backend
        $.ajax({
          type: "PUT",
          url: url,
          cache: false,
          data: {'name': title,
                'description': description,
                'address': address,
                'pet': pet,
                'price': price,
                'roomType': roomtype,
                'gender': gender,
                'coordinate': coordinate,
                },
          success: function(data, status) {
            // if the user has upload images
            if (files) {
              // construct url for image upload
              const _id = data._id
              const path = "/imageUpload/" + userId + "/" + _id
              // send image file data to backend
              $.ajax({
                type: "POST",
                url: path,
                data: formdata,
                cache: false,
                processData: false,
                contentType: false,
                success: function(data, status) {
                  if (data === 'nice'){
                    alert('New Post Uploaded Successfully!');
                    window.location.href = '/'
                  } else {
                    alert('Problem with image uploading!')
                  }
                },
                error: function(xhr, textStatus, errorThrown) {
                  console.log('Error!  Status = ' + xhr.status);
                }
              });
            // the user hasn't choose images to upload
            } else { 
              alert('New Post Uploaded Successfully!');
              window.location.href = '/'
            }
          },
          error: function(xhr, textStatus, errorThrown) {
            console.log('Error!  Status = ' + xhr.status);
          }
      });
      // address not valid
      } else {
        alert("*Please enter a valid address*");
      }
    });
  }
}
