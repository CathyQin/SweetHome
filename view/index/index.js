'use strict'

// Google Map API
function initAutocomplete() {
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
}

// set the return as same as sign in buttom
$(".searchBar").keyup(function(event){
    if(event.keyCode == 13){
      searchData();
    }
});

// search the data and jump to search page
function searchData() {
  // get the input from frontend
  var input = document.getElementById('pac-input').value;
  // call google api
  var geocoder = new google.maps.Geocoder();
  // get the distance
  var distance = $('input[name=optradio]:checked').val();

  if(input.length == 0) {
    $("#error_message").html("*Please enter an address*");
  } else{
    // jump to another page with the specific values
    geocoder.geocode({'address': input}, function(results, status) {
      if (status === 'OK') {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();

        const data = {lat, lng};

        window.location.href = './search_page?lat=' + lat + '&lng=' + lng + '&add=' + input + '&dis=' +distance;


      } else {
        $("#error_message").html("*Please enter a valid address*");
      }
    });
  }
}
