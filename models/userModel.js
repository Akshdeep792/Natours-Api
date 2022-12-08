const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        requried: [true, 'Please provide password'],
        minLength: 8,
        select: false
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
    },
    passwordChangedAt: Date
})

userSchema.pre('save', async function (next) {
    //only run when password is modified
    if (!this.isModified('password')) return next();
    // hashing password
    this.password = await bcrypt.hash(this.password, 12) // asynchronous version
    //delete passwordConfirm before saving user to database
    this.passwordConfirm = undefined
    next()
})

//instance method --> method available on all documents
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}
userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        )
        // console.log(changedTimestamp, JWTTimestamp)
        return JWTTimestamp < changedTimestamp
    }

    return false;
}
const User = mongoose.model('User', userSchema)
module.exports = User