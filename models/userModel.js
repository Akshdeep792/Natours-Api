const mongoose = require('mongoose')
const validator = require('validator')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide valid email']
    },
    photo: String,
    password: {
        type: String,
        requried: [true, 'Please provide password'],
        minLength: 8
    },

    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //this only work on Save()
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords are not the same'
        }
    }
})

const User = mongoose.model('User', userSchema)
module.exports = User