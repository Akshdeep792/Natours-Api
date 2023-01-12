const express = require('express')
const router = express.Router()
const { getAllUsers, getUser, createUser, updateUser, deleteUser, updateMe, deleteMe, getMe } = require('../controllers/userController')
const { signup, login, forgotPassword, resetPassword, protect, updatePassword } = require('../controllers/authenticationController')
router.post('/signup', signup)
router.post('/login', login)

router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

router.get('/me', protect, getMe, getUser)
router.delete('/deleteMe', protect, deleteMe)
router.patch('/updateMyPassword', protect, updatePassword)
router.patch('/updateMe', protect, updateMe)
router.route('/').get(getAllUsers).post(createUser)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

module.exports = router