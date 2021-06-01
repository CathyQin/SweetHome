const postingTitle = document.querySelector("#personalPostTitle");
const postingTable = document.querySelector("#postingTable");
let deleteButtons = document.querySelectorAll("#postingTable .delete");

let person, posting; 

fetch('/sessionChecker').then((res) => {
    if (res.status === 200) {
        return res.json();
    } else {
        window.location.href = "/";
    }
}).then((result) => {
    return fetch(`/user/${result.username}`);
}).then((res) => {
    if (res.status === 200) {
        return res.json();
    } else {
        window.location.href = "/";
    }
}).then((result) => {
    person = result[0];
    posting = person.posts;
    loadPosting(posting);
}).catch((error) => {
    console.log(error);
});



function loadPosting(posting) {
    postingTitle.innerText = "Posting: " + person.id;
    postingTable.children[1].innerHTML = "";
    posting.forEach(post => addPosting(post));
    deleteButtons = document.querySelectorAll("#postingTable .delete");
    addDeleteListeners();
}

function deleteListener(e) {
    const button = e.target;
    const index = button.parentNode.parentNode.rowIndex - 1;
    const postId = posting[index]._id;
    
    const request = new Request(`/user/${person.id}/${postId}`, {
        method: 'delete', 
        headers: {
            'Accept': 'application/json, text/plain, */*'
        },
    });

    fetch(request).then((res) => {
        if (res.status === 200) {
            return res.json();
        } else {
            window.alert("Delete failed!");
        }
    }).then((result) => {
        person = result.user;
        posting = person.posts;
        postingTable.children[1].innerHTML = "";
        loadPosting(posting);
    }).catch((error) => {
        console.log(error);
    });

}

function addDeleteListeners() {
    deleteButtons.forEach(button => button.addEventListener("click", deleteListener));
}




/*====================*/

/* DOM manipulation functions */

function addPosting(post) {
    // Add a posting to the table
    const newRow = document.createElement("tr");

    const newName = document.createElement("td");
    newName.innerText = post.name;
    newRow.appendChild(newName);

    const newAddress = document.createElement("td");
    newAddress.innerText = post.address;
    newRow.appendChild(newAddress);

    const newAction = document.createElement("td");
    const newView = document.createElement("button");
    newView.className = "btn btn-default view";
    newView.innerHTML = `<a href='/post/?id=${post._id}&owner=${post.owner}'>View</a>`;
    newAction.appendChild(newView);
    const newDelete = document.createElement("button");
    newDelete.className = "btn btn-default delete";
    newDelete.innerText = "Delete";
    newAction.appendChild(newDelete);
    newRow.appendChild(newAction);
    
    postingTable.children[1].appendChild(newRow);
}

