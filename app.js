const fs = require('fs')
const express = require("express")
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const app = express()
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
//middlewares
app.use(helmet())//set security headers

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000, //100req/hour
    message: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter) //affects all routes containing /api

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })) //middleware


//data sanitization "email" : {"$gt" : ""} to prevent from these attacks
app.use(mongoSanitize()) //against NoSQL query injection

//data sanitization against xss
app.use(xss()) // against html attacks

app.use(hpp({
    whitelist: [
        'duration',
        'ratingQuantity',
        'ratingAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
})) // parameter polution handeling

//serving static files
app.use(express.static(`${__dirname}/public`)) // to server static files
// app.use((req, res, next) => {
//     console.log("Hello from the middleware 👋")
//     next()
// })


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

//this is a middleware for making requests to invalid paths
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHandler)
module.exports = app