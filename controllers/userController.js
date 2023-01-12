const fs = require('fs')
const User = require('../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el]
        }
    })
    return newObj
}

const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next()
}


const getUser = factory.getOne(User);
const getAllUsers = factory.getAll(User);
const createUser = (req, res) => {
    // console.log(req.body)
    res.status(500).json({
        message: "Route not defined"
    })
    // res.send("Done") not allowed
}
const updateMe = catchAsync(async (req, res, next) => {
    // error if user tries to update password
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400))
    }
    //update user document
    const filteredBody = filterObj(req.body, 'name', 'email')
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { //x is used to avoid changing of restricted data
        new: true,
        runValidators: true
    })
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

const deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })
    res.status(204).json({
        status: 'success',
        data: null
    })
})
const updateUser = (req, res) => {
    res.status(500).json({
        message: "Route not defined"
    })
}

const deleteUser = (req, res) => {
    res.status(500).json({
        message: "Route not defined"
    })
}

module.exports = { getMe, createUser, getAllUsers, getUser, deleteUser, updateUser, updateMe, deleteMe }