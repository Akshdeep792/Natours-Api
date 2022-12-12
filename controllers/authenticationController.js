const { promisify } = require('util')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const jwt = require("jsonwebtoken")
const AppError = require('./../utils/appError')
const sendEmail = require("../utils/email")
const crypto = require("crypto")
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
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
        );
    }
    // validate the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET) // return payload

    // user still exists or not
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
        return next(new AppError('The user belonging to token no longer exist', 401))
    }
    //check if user changed password after the token was issued
    if (currentUser.changesPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please login again.', 401))
    }
    //grant access to protected route
    req.user = currentUser
    next()
})

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        next();
    }
}
const forgotPassword = catchAsync(async (req, res, next) => {
    //1. get user
    const user = await User.findOne({ email: req.body.email })
    // console.log(user)
    if (!user) {
        return next(new AppError('There is no user with email address', 404))
    }
    //2. generate the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false })
    console.log(user)
    //3 send it to user's email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetUrl}.\nIf you didn't forgot your password, please ignore this email`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('There was an error sending the email. Try again later!'),
            500
        );
    }

})
const resetPassword = catchAsync(async (req, res, next) => {
    // get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })
    // if token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()
    // update changedPasswordAt property of user // see model folder for this

    // log the user in, send JWT
    const token = signToken(user._id)

    res.status(200).json({
        status: 'success',
        token
    })
})
module.exports = { signup, login, protect, restrictTo, forgotPassword, resetPassword }