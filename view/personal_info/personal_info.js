/* Get the DOM objects */
const title = document.querySelector("#personalInfoTitle");

const nameInputs = document.querySelectorAll("#nameForm input");
const pwdInput = document.querySelector("#pwdInput");
const emailInput = document.querySelector("#emailInput");
const genderInput = document.querySelector("#genderInput");
const descInput = document.querySelector("#descInput");

const nameEdit = document.querySelector("#nameForm .edit");
const nameSave = document.querySelector("#nameForm .save");
const nameCancel = document.querySelector("#nameForm .cancel");
const pwdSave = document.querySelector("#pwdForm .save");
const showPwd = document.querySelector("#showPwd");
const emailEdit = document.querySelector("#emailForm .edit");
const emailSave = document.querySelector("#emailForm .save");
const emailCancel = document.querySelector("#emailForm .cancel");
const genderEdit = document.querySelector("#genderForm .edit");
const genderSave = document.querySelector("#genderForm .save");
const genderCancel = document.querySelector("#genderForm .cancel");
const descEdit = document.querySelector("#descForm .edit");
const descSave = document.querySelector("#descForm .save");
const descCancel = document.querySelector("#descForm .cancel");

const photo = document.querySelector("#photo");
const updatePhotoButton = document.querySelector("#updatePhoto");
const imageInput = document.querySelector('#updatePhoto input');

/*====================*/

/* Initialization after the page loaded */

let person = null;

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
    loadPerson(person);
}).catch((error) => {
    console.log(error);
});


/*====================*/

/* Event listeners */
nameEdit.addEventListener("click", editName);
emailEdit.addEventListener("click", editEmail);
genderEdit.addEventListener("click", editGender);
descEdit.addEventListener("click", editDesc);

nameSave.addEventListener("click", changeAll);
pwdSave.addEventListener("click", changePwd);
emailSave.addEventListener("click", changeAll);
genderSave.addEventListener("click", changeAll);
descSave.addEventListener("click", changeAll);

nameCancel.addEventListener("click", cancelChange);
emailCancel.addEventListener("click", cancelChange);
genderCancel.addEventListener("click", cancelChange);
descCancel.addEventListener("click", cancelChange);

showPwd.addEventListener("click", changePwdState);

imageInput.addEventListener("change", changPhoto);



/*====================*/

/* Functions for event listeners */
function cancelChange(e) {
    e.preventDefault();
    // No change made, just restore everything for simplicity
    unEditAll();
    loadPerson(person);
}

function changeAll(e) {
    e.preventDefault();
    unEditAll();
    // Get the new values
    person.firstName = nameInputs[0].value;
    person.lastName = nameInputs[1].value;
    person.email = emailInput.value;
    person.gender = genderInput.selectedOptions[0].value;
    person.selfDescription = descInput.value;

    uploadChange(person);
}

function changPhoto(e) {
    e.preventDefault();
    const photo = imageInput.files[0];

    uploadPhoto(photo);
}

function changePwd(e) {
    e.preventDefault();
    pwd = pwdInput.value;

    uploadPwd(pwd);
}


/*====================*/

/* DOM manipulation functions */

/* Functions for loading data */
function loadId(person) {
    title.innerText = "Personal Information: " + person.id;
}

function loadName(person) {
    nameInputs[0].value = person.firstName;
    nameInputs[1].value = person.lastName;
}

function loadEmail(person) {
    emailInput.value = person.email;
}

function loadGender(person) {
    let gender = person.gender;

    if (gender === "male") {
        genderInput.options[0].selected = 'selected';
    } else if (gender === "female") {
        genderInput.options[1].selected = 'selected';
    } else {
        genderInput.options[2].selected = 'selected';
    }
}

function loadDesc(person) {
    descInput.value = person.selfDescription;
}

function loadPhoto(person) {
    photo.src = person.photo;
}

function loadPerson(person) {
    loadId(person);
    loadName(person);
    loadEmail(person);
    loadGender(person);
    loadDesc(person);
    loadPhoto(person);
}

/* Functions for editing and stop editing */

function editName(e) {
    e.preventDefault();
    nameInputs[0].disabled = false;
    nameInputs[1].disabled = false;
    nameEdit.disabled = true;
    nameSave.disabled = false;
    nameCancel.disabled = false;
}

function editEmail(e) {
    e.preventDefault();
    emailInput.disabled = false;
    emailEdit.disabled = true;
    emailSave.disabled = false;
    emailCancel.disabled = false;
}

function editGender(e) {
    e.preventDefault();
    genderInput.disabled = false;
    genderEdit.disabled = true;
    genderSave.disabled = false;
    genderCancel.disabled = false;
}

function editDesc(e) {
    e.preventDefault();
    descInput.disabled = false;
    descEdit.disabled = true;
    descSave.disabled = false;
    descCancel.disabled = false;
}

function editAll(e) {
    e.preventDefault();
    editName(e);
    editEmail(e);
    editGender(e);
    editDesc(e);
}

function unEditName() {
    nameInputs[0].disabled = true;
    nameInputs[1].disabled = true;
    nameEdit.disabled = false;
    nameSave.disabled = true;
    nameCancel.disabled = true;
}

function unEditEmail() {
    emailInput.disabled = true;
    emailEdit.disabled = false;
    emailSave.disabled = true;
    emailCancel.disabled = true;
}

function unEditGender() {
    genderInput.disabled = true;
    genderEdit.disabled = false;
    genderSave.disabled = true;
    genderCancel.disabled = true;
}

function unEditDesc() {
    descInput.disabled = true;
    descEdit.disabled = false;
    descSave.disabled = true;
    descCancel.disabled = true;
}

function unEditAll() {
    unEditName();
    unEditEmail();
    unEditGender();
    unEditDesc();
}

/* Fucntions for showing and hiding password */
function changePwdState() {
    if (pwdInput.type === "password") {
        // The password is not shown, show password and change the button text
        pwdInput.type = "text";
        showPwd.innerText = "Hide password";
    } else {
        // The password in shown, hide password and change the button text
        pwdInput.type = "password";
        showPwd.innerText = "Show password";
    }
}




/*====================*/

// Upload the change to the server and load the new change
function uploadChange(person) {
    const request = new Request(`/user/${person.id}/info`, {
        method: 'post',
        body: JSON.stringify(person),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    });


    fetch(request).then((res) => {
        if (res.status === 200) {
            return res.json();
        } else {
            window.alert("Update unsuccessful!");
        }
    }).then((result) => {
        person = result;
        loadPerson(person);
    }).catch((error) => {
        console.log(error);
    });
}

function uploadPhoto(photo) {
    const form = new FormData();
    form.append("photo", photo, `${person.id}`);
    const request = new Request(`/user/photo/${person.id}`, {
        method: 'post',
        body: form
    });

    fetch(request).then((res) => {
        if (res.status === 200) {
            return res.json();
        } else {
            window.alert("Upload photo failed");
        }
    }).then((result) => {
        person = result;
        window.location.href = "/personal_info";
    }).catch((error) => {
        console.log(error);
    });
}

function uploadPwd(password) {
    // Hash the password
    const request = new Request(`/user/${person.id}/pwd/${password}`, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
        },
    });

    fetch(request).then((res) => {
      window.alert("Password Updated Successfully.")
    }).catch((error) => {
        console.log(error);
    });
}
