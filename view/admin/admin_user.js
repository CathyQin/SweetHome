'use strict'


/*====================*/
const search = document.querySelector(".search");
const allPosts = document.querySelector(".allPosts");
const allUsers = document.querySelector(".allUsers");
let display_allPost_flag = false
let display_name_url;

/* Event listeners */
search.addEventListener("click", display_id);
allPosts.addEventListener("click", display_allPost);
allUsers.addEventListener("click", display_allUsers);

// Helper function: genearte a string of the post row html
function generate_post_msg(tmp){
	const 	result = "<tr><td>" + tmp.name + "</td><td>" + tmp.owner+ "</td> <td><button class='btn btn-large btn-primary view_post'\
			id='view-" +  tmp._id + "-" + tmp.owner + "'>Open</button></td><td> \
			<button type='button' id=" + tmp._id + "-" + tmp.owner +" class='btn btn-large btn-primary' data-toggle='modal' data-target=#modal-" + tmp._id + "-" + tmp.owner + ">delete</button>\
			  <div class='modal fade' id=modal-" + tmp._id  + "-" + tmp.owner + " role='dialog>\
			    <div class='modal-dialog'>\
					\
			      <div class='modal-content'>\
			        <div class='modal-header'>\
			          <button type='button' class='close' data-dismiss='modal'>&times;</button>\
			          \
			          <h4 class='modal-title'>Confirm to delete</h4>\
			        </div>\
			        <div class='modal-body'>\
			          <p>Post ID: " + tmp._id + "<br>Post Title: " + tmp.name + "<br>\
			          Post Description: " + tmp.description + "<br>Address: " + tmp.address + "<br> \
						Pets: " + tmp.pet + "<br> Price: " + tmp.price + "<br>Roomtype: " + tmp.roomtype + "<br>Gender: " +
						tmp.gender + "</p></div>\
			        <div class='modal-footer'>\
			          <button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>\
			          <button type='button' class='delete btn btn-default' data-dismiss='modal'>Yes</button>\
			        </div>\
			      </div>\
			      \
			    </div>\
			  </div></td></tr>"

	return result
}

// Shake the search bar
function shake_effect(area){
	$(area).addClass("shake").delay(500).queue(function() {
	$(area).removeClass("shake")
	$("input[type='text']").focus().select();
	$(area).dequeue()
	})
}

// Handle search bar input to display a certain user or post information with the post name that
// user enter
function display_id(e){
	e.preventDefault();

	if(e.target.classList.contains("search_button")){
		const type = document.getElementById('inputState');
		const input = document.getElementById('input_id').value;
		const area = document.getElementsByClassName("search")[0]
		let admin_flag = false


  		var selected_type = type.options[type.selectedIndex].value;
  		const table = document.getElementById('displaytable')
		const all = document.getElementById('all')
		if (table != null) {
			all.removeChild(table)
		}
		const form = document.createElement("table")
		form.id = "displaytable"
		form.className = "table table-bordered"

		if(input != ""){
			if(selected_type === "User ID"){
				form.innerHTML = "<tbody> <tr> <td class='underline' width='25%'>UserID</td> <td class='underline' width='25%'>Name</td> <td class='underline' width='25%'>Status</td><td width='25%'></td></tr>"
				const url = '/user/' + input

				fetch(url)
				.then((res) => {
					if(res.status === 200){
						return res.json()
					} else{
						alert("Can not get users")
					}
				})
				.then((json) => {
					json.map((user) => {

						if(user.admin === false){
							admin_flag = false
							if(user.blocked === false){
								const status = "unblock"
								const status_button = "<td><button class='block'>block</button></td>"
								form.innerHTML += "<tr><td>" + user.id + "</td><td>" + user.firstName + " " +user.lastName + "</td><td>" + status + "</td><td><button class='block btn btn-large btn-primary'>block</button></td> </tr>"
							} else{
								const status = "block"
								const status_button = "<td><button class='unblock'>block</button></td>"
								form.innerHTML += "<tr><td>" + user.id + "</td><td>" + user.firstName + " " + user.lastName + "</td><td>" + status + "</td><td><button class='block btn btn-large btn-primary'>unblock</button></td> </tr>"
							}
					} else {
						admin_flag = true
					}
					})
					if(json.length > 0 && admin_flag === false){
						//found user
						form.innerHTML += "</tbody>"
						all.appendChild(form)
						form.addEventListener("click", block_user)
					}
					else{ //User not found
						shake_effect(area)
					}
				})

			} else{ // display post
				display_name_url = '/posts/' + input
				display_name(true)
			}
		} else{ // nothing typed in the search bar
			shake_effect(area)
		}

	}
}

// Display all posts name and its owner with a view and delete button in a table
function display_allPost(e){
	if(!e === false){
		e.preventDefault();
	}

  document.getElementById('input_id').value = ""
	const table = document.getElementById('displaytable')
	const all = document.getElementById('all')
	if (table != null) {
		all.removeChild(table)
	}

	const form = document.createElement("table")
	form.id = "displaytable"
	form.className = "table table-bordered"
	form.innerHTML = "<tbody> <tr> <td class='underline' width='25%'>Post Name</td> <td class='underline' width='25%'>owner</td> <td class='underline' width='25%'>View Post</td><td class='underline' width='25%'></td></tr>"

	const url = '/posts'

	fetch(url)
	.then((res) => {
		if(res.status === 200) {
			return res.json()
		} else {
			alert("No Post")
		}
	})
	.then((json) => {

		json.data.map((tmp) => {
			form.innerHTML += generate_post_msg(tmp)
			display_allPost_flag = true
		})

	})

	form.innerHTML += "</tbody>"
	all.appendChild(form)
	form.addEventListener("click", delete_post)
	form.addEventListener("click", viewPost)

}

// Display all users id and name with a blocked status button in a table
function display_allUsers(e){
	e.preventDefault();

	const table = document.getElementById('displaytable')
	const all = document.getElementById('all')
	if (table != null) {
		all.removeChild(table)
	}

	const form = document.createElement("table")
	form.id = "displaytable"
	form.className = "table table-bordered"
	form.innerHTML = "<tbody> <tr> <td class='underline' width='25%'>UserID</td> <td class='underline'width='25%' >Name</td> <td class='underline' width='25%'>Status</td><td width='25%'></td></tr>"


	const url = '/users'

	fetch(url)
	.then((res) => {
		if (res.status === 200) {
			return res.json()

		} else {
			alert("Could not get students")
		}
	})
	.then((json) => {
		json.data.map((user) => {
			if(user.admin === false){

				if (user.blocked === false){
					const status = "unblock"
					const status_button = "<td><button class='block'>block</button></td>"
					form.innerHTML += "<tr><td>" + user.id + "</td><td>" + user.firstName + " " + user.lastName + "</td><td>" + status + "</td><td><button class='block btn btn-large btn-primary'>block</button></td> </tr>"
				}
				else{
					const status = "block"
					const status_button = "<td><button class='unblock'>unblock</button></td>"
									form.innerHTML += "<tr><td>" + user.id + "</td><td>" + user.firstName + " " + user.lastName + "</td><td>" + status + "</td><td><button class='block btn btn-large btn-primary'>unblock</button></td> </tr>"
				}
			}
		})
	}).catch((error) => {
		console.log(error)
	})

	form.innerHTML += "</tbody>"
	all.appendChild(form)
	form.addEventListener("click", block_user)
}

// Change the user's blocking status
function block_user(e){

	e.preventDefault();
	parent = e.target.parentElement.parentElement

	if(e.target.classList.contains("block") || e.target.classList.contains("unblock")){
		let blocked_status;
		let blocked_flag;
		let body;

		const blocked_url = '/users/' + parent.children[0].innerHTML + "/block"
		const url = '/user/' +  parent.children[0].innerHTML

		// find the particular user that need to be blocked or unblocked
		fetch(url)
		.then((res) => {
			if (res.status === 200) {
				return res.json()

			} else {
				alert("No such user id found")
			}
		})
		.then((json) => {
			const user = json[0]
			if (user.blocked === true){
				blocked_flag = false
			} else {
				blocked_flag = true
			}

			// Change block or unblock status
			const request = new Request(blocked_url, {
				method: "post",
				body: JSON.stringify({blocked_flag}),
				headers: {
	            'Accept': 'application/json, text/plain, */*',
	            'Content-Type': 'application/json'
	        	}
			})
			fetch(request)
			.then(function(res) {
				if(res.status === 200){
					return res.json()
				} else {
					console.log("not updated successfully")
				}
			})
			.then((json) => {
				const user = json.data

				if(user.blocked === false){
					const status = "unblock"
					parent.children[2].innerText = "unblock"
					parent.children[3].innerHTML = "<td><button class='block btn btn-large btn-primary'>block</button></td>"

				}else{
					const status = "block"
					parent.children[2].innerText = "blocked"
					parent.children[3].innerHTML = "<td><button class='unblock btn btn-large btn-primary'>unblock</button></td>"
				}

			}).catch((error) => {
				console.log(error)
			})

		}).catch((error)=> {
			console.log(error)
		})
	}
}

// Redirect to home page after clicking log out on the top bar
function logOut() {

  const url = '/logout';

  $.ajax({
    type: "get",
    url: url,
    cache: false,
    success: function(data, status) {
      if(data.data == "success") {
			window.location.replace("/")
      }
    },
    error: function(xhr, textStatus, errorThrown) {
        console.log('Error!  Status = ' + xhr.status);
    }
  });
}

// Redirect to the post page that user clicks
function viewPost(e){
	e.preventDefault();
	if(e.target.classList.contains("view_post")){
		const tmp = e.target.id
		const pid = tmp.split("-")[1]
		const uid = tmp.split("-")[2]

  	$.ajax({
      	type: "GET",
      	url: '/sessionChecker',
      	cache: false,
      	success: function(data, status) {
      		if(data.signIn) {
      			window.open('../post?id=' + pid + '&owner=' + uid);
        	} else {
          		alert("PLEASE SIGN IN TO CONTINUE");
        	}
      	},
      	error: function(xhr, textStatus, errorThrown) {
          	console.log('Error!  Status = ' + xhr.status);
      	}
  	});

	}
}

// given a post name, display all posts that have this name
function display_name(flag){
	const area = document.getElementsByClassName("search")[0]
	const table = document.getElementById('displaytable')
	const all = document.getElementById('all')
	if (table != null) {
		all.removeChild(table)
	}

	const form = document.createElement("table")
	form.id = "displaytable"
	form.className = "table table-bordered"
	form.innerHTML = "<tbody> <tr> <td class='underline' width='25%'>Post Name</td> <td class='underline' width='25%'>owner</td> <td class='underline' width='25%'>View Post</td><td class='underline' width='25%'></td></tr>"
	fetch(display_name_url)
	.then((res) => {
		if(res.status === 200){
			return res.json()
		} else{
			alert("Can not get posts")
		}
	})
	.then((json) => {
		json.map((tmp) => {
			form.innerHTML += generate_post_msg(tmp)
			display_allPost_flag = false
		})

		if(json.length > 0 || flag === false){
			form.innerHTML += "</tbody>"
			all.appendChild(form)
			form.addEventListener("click", delete_post)
			form.addEventListener("click", viewPost)
		}else{
			if(flag === true){
				shake_effect(area)
			}
		}
	})

}

// Delete the choosen post from database and display the remaining post table
function delete_post(e){
	e.preventDefault();

	if(e.target.classList.contains("delete")){
		parent = e.target.parentElement.parentElement.parentElement
		const parent_id = parent.id
		const postId = parent_id.split("-")[1]
		const uid = parent_id.split("-")[2]

		///user/:id/:pid
		const url = "/user/" + uid + "/" + postId
		fetch(url, {method:"delete"})
		.then((res) => {
			if(res.status === 200){
				if(display_allPost_flag === true){
					display_allPost()
					display_allPost_flag = false
				} else {
					display_name(false)
				}

			} else{
				alert("delete failed")
			}
		}).catch((error) => {
			console.log(error)
		})
	}
}
