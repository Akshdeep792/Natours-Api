const fs = require('fs')
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

const getAllUsers = (req, res) => {
    res.status(500).json({
        message: "Route not defined"
    })
}
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