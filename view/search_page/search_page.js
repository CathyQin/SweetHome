var selected = {};
selected["gender"] = "";
selected["pet"] = "";
selected["room"] = "";
selected["price"] = "";

var address_data_obj;

// set return key as the button submit
$(".searchBar").keyup(function(event){
    if(event.keyCode == 13){
      searchFilter();
    }
});

// google api calll
function initAutocomplete() {
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
}

// display all post
function displayPost(posts) {
  var html = ""
  var count = 0;

  if(posts.length == 0) {
    $("#card_details_info").html(`
      <div class="row justify-content-center align-items-center" style="margin-bottom:13%">
        <h1 style="color: #5FA9D5"> NOTHING </h1>
      </div>
    `);
  } else{
    // fake data
    for(var count = 0; count < posts.length; count++) {
      if(count % 3 == 0 && count == 0) {
        html += `<div class="row justify-content-center align-items-center">`;
      }
      if(count != 0 && count % 3 == 0) {
        html += `</div><div class="row justify-content-center align-items-center">`;
      }
      html += `
      <div class="col-sm-4">
        <a onclick="getPost(\'${posts[count][0]._id}\', \'${posts[count][1].id}\')" style="text-decoration:none;"><div class="card form-control">
          <div class="photo_name">
            <img src="${posts[count][1].photo}" class="card_photo">
            <h4 class="name"><b>${posts[count][1].firstName} ${posts[count][1].lastName}</b></h4>
            </div>
            <div class="details">
              <p>${posts[count][0].description}</p>
            </div>
          </div>
          </a>
        </div>`;
    }
    html += "</div>";
    $("#card_details_info").html(html);
  }

}

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

// the following code is filter
function searchFilter() {
  // get value from input value
  var input = document.getElementById('pac-input').value;
  // using google api
  var geocoder = new google.maps.Geocoder();
  // get value from input value
  const dis = $('input[name=optradio]:checked').val();
  // set the default value
  document.getElementById("pac-input").defaultValue = input;

  if(input.length == 0) {
    $("#error_message").html("*Please enter an address*");
  } else{
    // using google api to get the lat and lng
    geocoder.geocode({'address': input}, function(results, status) {
      if (status === 'OK') {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        // using ajax to communicate with backend and get the data from database
        $.ajax({
            type: "GET",
            url: '/search/' + lat + "&" + lng + "&" + input + '&' + dis,
            cache: false,
            success: function(data, status) {
              // get the data
              address_data_obj = data;
              var gender = selected["gender"];
              var pets = selected["pet"];
              var room = selected["room"];
              var price = selected["price"];

              var filterPost = [];
              // loop all choices and get the value
              for(let index in address_data_obj) {

                var genderCompare = false;
                var petsCompare = false;
                var roomCompare = false;
                var priceCompare = false;

                if(gender === "" || gender === address_data_obj[index][0].gender[0]) {
                  genderCompare = true;
                }

                if(pets === "" || (pets === "None" && address_data_obj[index][0].pet.length == 0) || address_data_obj[index][0].pet.indexOf(pets) != -1) {
                  petsCompare = true;
                }

                if(room === "" || address_data_obj[index][0].roomType.indexOf(room) != -1 || address_data_obj[index][0].roomType.length == 0) {
                  roomCompare = true;
                }

                if(address_data_obj[index][0].price[0] === "Below $1000" && price === "Below $1000") {
                  priceCompare = true;
                } else if (address_data_obj[index][0].price[0] === "$1000 - $1499" && price === "$1000 - $1499") {
                  priceCompare = true;
                } else if (address_data_obj[index][0].price[0] === "$1500 - $2000" && price === "$1500 - $2000") {
                  priceCompare = true;
                } else if (address_data_obj[index][0].price[0] === "Above $2000" && price === "Above $2000") {
                  priceCompare = true;
                } else if (price === "") {
                  priceCompare = true;
                }

                if(genderCompare && petsCompare && roomCompare && priceCompare){
                  filterPost.push(address_data_obj[index]);
                }
              }
              // display all posts
              displayPost(filterPost);
              history.pushState(null, null, '/search/' + lat + "&" + lng + "&" + input);
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log('Error!  Status = ' + xhr.status);
            }
        });
      } else {
        $("#error_message").html("*Please enter a valid address*");
      }
    });
  }
}

// get the value from url
var lat = new URLSearchParams(window.location.search).get('lat');
var lng = new URLSearchParams(window.location.search).get('lng');
var add = new URLSearchParams(window.location.search).get('add');
var dis = new URLSearchParams(window.location.search).get('dis');
// set the value of search bar
document.getElementById("pac-input").defaultValue = add;
$("input[name='optradio'][value='"+ dis + "']").prop('checked', true);

// using ajax to get data from backend
$.ajax({
    type: "GET",
    url: '/search/' + lat + "&" + lng + "&" + add + "&" + dis,
    cache: false,
    success: function(data, status) {
      address_data_obj = data;
      // display all posts
      displayPost(data);
    },
    error: function(xhr, textStatus, errorThrown) {
        console.log('Error!  Status = ' + xhr.status);
    }
});

// get the post by using ajax
function getPost(pid, uid) {
  $.ajax({
      type: "GET",
      url: '/sessionChecker',
      cache: false,
      success: function(data, status) {
        if(data.signIn) {
          window.location.href = '../post?id=' + pid + '&owner=' + uid;
        } else {
          alert("PLEASE SIGN IN TO CONTINUE");
        }
      },
      error: function(xhr, textStatus, errorThrown) {
          console.log('Error!  Status = ' + xhr.status);
      }
  });
}
