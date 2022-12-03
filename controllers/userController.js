const fs = require('fs')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')


const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})
const getUser = (req, res) => {
    res.status(500).json({
        message: "Route not defined"
    })
}
const createUser = (req, res) => {
    // console.log(req.body)
    res.status(500).json({
        message: "Route not defined"
    })
    // res.send("Done") not allowed
}

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

module.exports = { createUser, getAllUsers, getUser, deleteUser, updateUser }