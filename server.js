'use strict';
const log = console.log;

const express = require('express');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser'); // middleware for parsing HTTP body from client
const session = require('express-session');
const hbs = require('hbs');
const { ObjectID } = require('mongodb');
const {SHA256} = require('crypto-js');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require("fs");

const { mongoose } = require('./db/mongoose');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const userId = req.session.user
    const path = `./Images/` + userId + `/`
    cb(null, path)
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});
const photoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.session.user;
        const path = __dirname + "/Images/photo";
        cb(null, path);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});
const photoUpload = multer({
    storage: photoStorage,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
})

// Import the models
const { User } = require('./model/schema');

// express
const app = express();
// body-parser middleware setup.  Will parse the JSON and convert to object
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

// set the view library
app.set('view engine', 'hbs');

// Add express sesssion middleware
app.use(session({
    secret: 'oursecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000,
        httpOnly: true
    }
}));


app.use(express.static(__dirname + "/view"));
app.use(express.static(__dirname + "/view/index"));
app.use("/Images", express.static(__dirname + "/Images"));
app.use(express.static(__dirname + "/Images/photo"));
app.use(express.static(__dirname + "/view/top_bar"));
app.use(express.static(__dirname + "/view/search_page"));
app.use(express.static(__dirname + "/view/new_post"));
app.use(express.static(__dirname + "/view/Help"));
app.use(express.static(__dirname + "/view/admin"));
app.use(express.static(__dirname + "/view/footer"));
app.use(express.static(__dirname + "/view/AboutUs"));
app.use(express.static(__dirname + "/view/post"));
app.use(express.static(__dirname + "/view/personal_info"));
app.use(express.static(__dirname + "/view/personal_posts"));
app.use(express.static(__dirname + "/view/personal_contacts"));

const sessionChecker = (req, res, next) => {
  if(!req.session) {
    res.redirect("/");
  } else if (req.session.type === "admin") {
      res.redirect("/admin");
  } else if (req.session.type === "user"){
      next();
  }
}

// Routes for users
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/view/index/index.html");
})

app.get('/admin', (req, res) => {
  if (req.session.type == "admin"){
    res.sendFile(__dirname + "/view/admin/admin_user.html");
  } else {
    res.redirect("/")
  }
})

app.get('/help', (req, res) => {
    res.sendFile(__dirname + "/view/Help/help.html");
})

app.get('/aboutUs', (req, res) => {
    res.sendFile(__dirname + "/view/AboutUs/aboutus.html");
})

app.get('/newPost', sessionChecker, (req, res) => {
  res.sendFile(__dirname + "/view/new_post/new_post.html");
})

app.get('/newPostCheck', (req, res) => {
    if(req.session.type == "user" && !req.session.block) {
        res.send({data: "user"});
    } else if(req.session.type == "admin") {
      res.send({data: "admin"})
    }
    else {
        res.send({data: "blocked"});
    }
})

app.get('/personal_info', sessionChecker, (req, res) => {
    res.sendFile(__dirname + '/view/personal_info/personal_info.html');
});

app.get('/personal_posts', sessionChecker, (req, res) => {
    if (req.session.type == 'user') {
        res.sendFile(__dirname + '/view/personal_posts/personal_posts.html');
    } else {
        res.redirect("/");
    }
});

app.get('/personal_contacts', sessionChecker, (req, res) => {
    if (req.session.type == 'user') {
        res.sendFile(__dirname + '/view/personal_posts/personal_posts.html');
    } else {
        res.redirect("/");
    }
});

// Change the info of a user
app.post("/user/:id/info", (req, res) => {
    const id = req.params.id;

    const {firstName, lastName, email, gender, selfDescription} = req.body;
    const change = {firstName, lastName, email, gender, selfDescription};

    User.findOneAndUpdate(
        {"id": id},
        {$set: change},
        {new: true}
    ).then((user) => {
        if (!user) {
            res.status(404).send();
        } else {
            res.send(user);
        }
    }).catch((error) => {
        res.status(404).send(error);
    });
});

// Change the password of a user
app.post("/user/:id/pwd/:password", (req, res) => {
    const id = req.params.id;
    const password = req.params.password;

    bcrypt.genSalt(10, (error, salt) => {
        bcrypt.hash(password, salt, (error, hash) => {
            User.findOneAndUpdate(
                {"id": id},
                {$set: {"password": hash}},
                {new: true}
            ).then((user) => {
                if (!user) {
                    res.status(404).send();
                } else {
                    res.send(user);
                }
            }).catch((error) => {
                res.statusCode(404).send(error);
            })
        })
    });
})

app.post("/imageUpload/:uid/:pid", upload.array('photo', 6), (req, res) => {
    const files = req.files
    let post;
    let images = [];
    User.findOne({"id": req.params.uid}).then((user) => {
        if (!user) {
            res.status(404).send();
        } else {
            for (var i = 0; i < user.posts.length; i++) {
                if (user.posts[i]._id == req.params.pid) {
                    post = user.posts[i]
                    for (var j = 0; j < files.length; j++) {
                        const path = files[j].path
                        images.push(path)
                    }
                    User.findOneAndUpdate({"id": req.params.uid, posts: {$elemMatch: {"_id": req.params.pid}}},
                        {$push: {"posts.$.images": images}}, {new: true}).then((user) => {
                            res.send('nice')
                        }).catch((error) => {
                        res.status(404).send(error);
                    });
                    break
                }
            }

        }
    }).catch((error) => {
        res.status(404).send(error);
    });



});

// Add a post to a user
app.put("/user/:id/post", (req, res) => {
    const id = req.params.id;
    const {name, description, address, pet, price, roomType, gender, coordinate} = req.body;

    const post = { "owner": id, "images": [], name, description, address, pet, price, roomType, gender, coordinate};

    User.findOneAndUpdate(
        {"id": id},
        {$push: {posts: post}},
        {new: true}
    ).then((user) => {
        if (!user) {
            res.status(404).send();
        } else {
            const i = user.posts.length - 1
            const _id =  user.posts[i]._id
            res.send({"_id": _id});
        }
    }).catch((error) => {
        res.status(404).send(error);
    });

});

// Delete a person from contact list
app.delete("/user/:id/contact/:uid", (req, res) => {
    const id = req.params.id;
    const uid = req.params.uid;

    User.findOneAndUpdate(
        {"id": id},
        {$pull: {"contacts": uid}},
        {new: true}
    ).then((user) => {
        if (!user) {
            res.status(404).send();
        } else {
            res.send(user);
        }
    }).catch((error) => {
        res.status(404).send(error);
    });
});

// Add a person to contact list
app.post("/user/:id/contact/:uid", (req, res) => {
    const id = req.params.id;
    const uid = req.params.uid;

    User.findOneAndUpdate(
        {"id": id},
        {$push: {contacts: uid}},
        {new: ture}
    ).then((user) => {
        if (!user) {
            res.status(404).send();
        } else {
            res.send(user);
        }
    }).catch((error) => {
        res.status(404).send(error);
    });
});

// Store photo for a user
app.post("/user/photo/:id", photoUpload.array('photo', 1), (req, res) => {
    const id = req.params.id;
    const photo = req.files[0];

    User.findOneAndUpdate({"id": id}, {$set: {"photo": `/Images/photo/${photo.filename}`}}, {new: true}).then((user) => {
        if (!user) {
            res.status(404).send();
        } else {
          req.session.photo = user.photo;
          res.status(200).send(user);
        }
    }).catch((error) => {
      console.log(error);
        res.status(404).send(error);
    });
});

// Get photo of a user
app.get("/Images/photo/:id", (req, res) => {
    const id = req.params.id;

    res.sendFile(__dirname + `/Images/photo/${id}`);
});

app.post("/login", (req, res) => {
    const userID = req.body.user;
    const password = req.body.password;

    User.findOne({"id": userID}).then((user) => {
            if (!user) {
                    res.send({data: "error"});
            } else {
              bcrypt.compare(password, user.password, (error, result) => {
                if(!result) {
                  res.send({data: "error"});
                } else {
                  if(user.admin) {
                      req.session.user = userID;
                      req.session._id = user._id;
                      req.session.email = user.email;
                      req.session.type = "admin";
                      req.session.sign = true;
                      req.session.photo = user.photo;
                      res.send({data: "admin", 'imageUrl': user.photo});
                  }
                  else {
                      req.session.user = userID;
                      req.session._id = user._id;
                      req.session.email = user.email;
                      req.session.type = "user";
                      req.session.sign = true;
                      req.session.photo = user.photo;
                      if(user.blocked) {
                        req.session.block = true;
                      } else{
                        req.session.block = false;
                      }
                      res.send({data: "user", 'imageUrl': user.photo});
                  }
                }
              });
            }
    }).catch((error) => {
        res.status(404).send(error);
    });
})

app.post("/register", (req, res) => {
    const userID = req.body.loginID;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const gender = req.body.gender;

    User.findOne({"id": userID}).then((user) => {
      if(user){
        res.send({data: 'id is not unique'});
      } else {
        User.findOne({"email": email}).then((user) => {
          if(user) {
            res.send({data: 'email is not unique'});
          } else{
            bcrypt.genSalt(10, (error, salt) => {
                bcrypt.hash(password, salt, (error, hash) => {
                const newData = new User({
                    id: userID,
                    password: hash,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    gender: gender
                });

                newData.save().then((result) => {
                    req.session.user = userID;
                    req.session._id = result._id;
                    req.session.email = result.email;
                    req.session.type = "user";
                    req.session.sign = true;
                    req.session.block = false;
                    req.session.photo = result.photo;
                    fs.mkdirSync("./Images/"+userID);
                    app.use("./Images/"+userID, express.static(__dirname + "./Images/"+userID))
                    res.send({data: 'registered'});
                }, (error) => {
                    res.status(400).send(error);
                });

                });
            });
          }
        })
      }
    }, (error) => {
      res.status(400).send(error);
    });
})


app.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        if(error) {
            res.status(500).send(error);
        } else {
            res.send({data:"success"});
        }
    })
})


app.get('/search/:lat&:lng&:add&:dis', (req, res) => {
    // want req to be [lat, lng]
    const lat = Number(req.params.lat)
    const lng = Number(req.params.lng)
    const dis = Number(req.params.dis)
    let posts = []
    User.find().then((users) => {
        for (var i = 0; i < users.length; i++) {
            const user = users[i]
            if(!user.blocked) {
              for (var j = 0; j < user.posts.length; j++) {
                  const post = user.posts[j]
                  let d = distance(lat, lng, post.coordinate[0], post.coordinate[1]);
                  if (d <= dis) {
                      posts.push([post, user])
                  }
              }
          }
        }
        res.send(posts)
    }, (error) => {
        res.status(400).send(error)
    })
})

function distance(lat1, lon1, lat2, lon2) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;
        return dist;
    }
}

app.get('/sessionChecker', (req, res) => {
    if(req.session.sign) {
        res.send({signIn: true, 'imageUrl': req.session.photo, 'username': req.session.user, 'type': req.session.type});
    }
    else {
        res.send({signIn: false});
    }
})

app.post('/eachPost/:id&:owner/sendEmial', (req, res) => {
    // find user of post
    const postID = req.params.id
    const owner = req.params.owner
    let postuser; // toUser
    const senderId = req.session._id
    let sender;
    const content = req.body.content
    if(req.session.block) {
      res.send({flag: 'block'});
    } else{
      User.find().then((users) => {
        for (var i = 0; i < users.length; i++) {
            let user = users[i]
            let flag = false;
            for (var j = 0; j < user.posts.length; j++) {
                const post = user.posts[j]
                if (post._id == postID) {
                    flag = true
                    break
                }
            }
            if (flag === true) {
                postuser = user
                break
            }
        }

        User.findById(senderId).then((user) => {
            sender = user
            // send email
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: "SweetHome.csc309@gmail.com", // generated ethereal user
                    pass: "sweethome309" // generated ethereal password
                }
            });
            // setup email data with unicode symbols
            let mailOptions = {
                from: '"SweetHome" <sweethome.csc309@gmail.com>', // sender address
                to: postuser.email, // list of receivers
                subject: `sent from sweetHome user ` + sender.firstName + ` ` + sender.lastName +
                 `with email: ` + sender.email, // Subject line
                text: content, // plain text body
                html: `<p>`+ content +`</p>` // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                // Preview only available when sending through an Ethereal account
                User.findByIdAndUpdate(senderId, {$push: {"contacts": owner}}).then((user) => {
                    res.send({flag: 'success'})
                }).catch((error) => {
                    res.status(404).send(error);
                })

                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });

        }).catch((error) => {
            res.status(404).send(error);
        });
      }).catch((error) => {
          res.status(404).send(error);
      });
    }
})

app.get('/eachPost/:id&:owner', (req, res) => {
    const postId = req.params.id

    const loginId = req.params.owner
    let post;
    User.findOne({"id": loginId}).then((user) => {
        for (var i = 0; i < user.posts.length; i++) {
            if (user.posts[i]._id == postId) {
                post = user.posts[i]
                break
            }
        }
        const info = [post, user]
        res.send(info)
    })

})


// Delete a user's post by matching user's login id and postid
app.delete('/user/:id/:pid', (req, res) => {
    const uid = req.params.id
    const pid = req.params.pid

    User.findOneAndUpdate({id: uid}, {$pull: {"posts" : {"_id": pid}}}, {new:true}).then((user) => {
        if (!user) {
            res.status(404).send()
        } else {
            res.send({user})
        }
    }).catch((error) => {
        res.status(400).send(error)
    })
})


// Get all posts with the provided post name
app.get('/posts/:name', (req, res) => {
    const name = req.params.name
    let posts = []
    User.find({posts:{$elemMatch: {"name": name}}}).then((user) => {

        if (!user) {
            res.status(404).send()
        } else{
            for(let i=0; i<user.length; i++){
                for(let j=0; j<user[i].posts.length; j++){
                    if(user[i].posts[j].name === name){
                        posts.push(user[i].posts[j])
                    }
                }
            }
            res.send(posts)
        }
    }).catch((error) => {
        res.status(400).send(error)
    })

})


// Get all posts
app.get('/posts', (req, res) => {
    User.find().then((users) => {
        let posts = []
        for(let i=0; i<users.length; i++){
            for(let j=0; j<users[i].posts.length; j++){
                posts.push(users[i].posts[j])
            }
        }
        res.send({data: posts})
    }).catch((error) => {
        res.status(400).send(error)
    })
})


// Update a particular user's blocked status to true or false
app.post("/users/:id/block", (req, res) => {
    const uid = req.params.id;
    const {blocked_flag} = req.body

    User.findOneAndUpdate({"id":uid}, {$set:{"blocked":blocked_flag}}, {new:true}).then((user)=> {
        if(!user){
            res.status(404).send()
        } else {
            res.send({data: user})
        }
    }).catch((error) => {
        res.status(400).send()
    })


})

// Get all users
app.get('/users', (req, res) => {
    User.find().then((users) => {
        res.send({data: users })
    }, (error) => {
        res.status(400).send(error)
    })
})


// Get a user object, if user cannot be found,
// empty list will be returned, else return list
// of users
app.get("/user/:id", (req, res) => {
    const id = req.params.id;
    let result = []
    User.findOne({"id": id}).then((user) => {
        if (!user) {
            res.send(result)
        } else {
            result.push(user)
            res.send(result)
        }
    }).catch((error) => {
        res.status(404).send(error);
    });
});

app.use(function (req, res, next) {
    res.status(404);
    res.redirect('/');
});

app.listen(port, () => {
    log(`Listening on port ${port}...`);
});
