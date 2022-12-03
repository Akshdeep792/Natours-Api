const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const jwt = require("jsonwebtoken")
const AppError = require('./../utils/appError')

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TIME
    })
}
const signup = catchAsync(async (req, res, next) => {
    // this is preffered to ensure that nobody can register as admin
    const newUser = await User.create({ // only data need to create user
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const token = signToken(newUser._id)
    // console.log(token)
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    //1.) Check if email and password exist
    if (!email || !password) {
        return next(new AppError("please provide email and password", 400))
    }
    //2. Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }
    //3. If everything ok, send token to client
    const token = signToken(user._id)

    res.status(200).json({
        status: 'success',
        token
    })
}
)

const protect = catchAsync(async (req, res, next) => {
    //get the token if its there or not --> this can be send using headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
        return next(new AppError('You are not logged in! Please login to get access', 401))
    }
    // validate the token
    // user still exists or not

    //check if user changed password after the token was issued
})
module.exports = { signup, login, protect }