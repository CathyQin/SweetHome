const contactListTitle = document.querySelector("#contactListTitle");
const contactListTable = document.querySelector("#contactListTable");

let removeButtons = document.querySelectorAll(".remove");

let user, contactList;

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
    user = result[0];
    contactList = [];
    user.contacts.forEach(uid => {
        fetch(`/user/${uid}`).then((res) => {
            if (res.status === 200) {
                return res.json();
            } else {
                window.alert('user not found!');
            }
        }).then((result) => {
            contactList.push(result[0]);
            loadContactList(contactList);
            addRemoveListener();
        });
    });
}).catch((error) => {
    console.log(error);
});




/*====================*/
/* Event listener */

function removeListener(e) {
    const button = e.target;
    const index = button.parentNode.parentNode.rowIndex - 1;
    const uid = contactList[index].id;
    
    const request = new Request(`/user/${user.id}/contact/${uid}`, {
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
        user = result;
        contactList = [];
        loadContactList(contactList);
        user.contacts.forEach(uid => {
            fetch(`/user/${uid}`).then((res) => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    window.alert('user not found!');
                }
            }).then((result) => {
                contactList.push(result[0]);
                loadContactList(contactList);
                addRemoveListener();
            });
        });

    }).catch((error) => {
        console.log(error);
    });

}

function addRemoveListener() {
    removeButtons.forEach(button => button.addEventListener("click", removeListener));
}



/*====================*/
/* DOM manipulation function */

function addContact(person) {
    const newRow = document.createElement("tr");
    contactListTable.children[1].appendChild(newRow);


    const newName = document.createElement("td");
    newName.innerText = person.firstName + " " + person.lastName;
    newRow.appendChild(newName);

    const newEmailAddress = document.createElement("td");
    newEmailAddress.innerText = person.email;
    newRow.appendChild(newEmailAddress);

    const newAction = document.createElement("td");
    const newRemove = document.createElement("button");
    newRemove.className = "btn btn-default remove";
    newRemove.innerText = "Remove";
    newAction.appendChild(newRemove);
    newRow.appendChild(newAction);

    removeButtons = document.querySelectorAll(".remove");
}

function loadContactList(contactList) {
    // Empty the table
    contactListTable.children[1].innerHTML = "";

    contactList.forEach(person => addContact(person));
}
