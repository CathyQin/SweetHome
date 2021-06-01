'use strict';

const mongoose = require('mongoose');
const validater = require('validator');

const PostSchema = new mongoose.Schema({
    owner: {
        type: String, // id of user
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        required: true
    },
    images: {
        type: [String] // list of paths
    },
    pet: {
        type: [String] // list of pets
    },
    price: {
        type: [String] // list of 2 float, i.e. [lowerBound, upperBound]
    },
    roomType: {
        type: String
    },
    gender: {
        type: [String]
    },
    coordinate: {
        type: [Number] // list of 2 float for the coordinate of the room
    }
});

const User = mongoose.model('User', {
    id: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minlength: 1
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minlength: 1,
        validate: {
            validator: validater.isEmail,
            message: 'Not valid email'
        }
    },
    gender: {
        type: String,
        required: true,
        validate: {
            validator: (g => ['male', 'female', 'other'].includes(g)),
            message: 'Not valid gender'
        }
    },
    selfDescription: {
        type: String,
        default: ""
    },
    blocked: {
        type: Boolean,
        default: false
    },
    posts: {
        type: [PostSchema],
        default: []
    },
    contacts: {
        type: [String], // list of ids of users
        default: []
    },
    photo: {
        type: String, // path of image
        default: "/Images/photo/default_photo.jpeg"
    },
    admin: {
      type: Boolean,
      default: false
    }
});


module.exports = {
    User
};
