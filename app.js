const fs = require('fs')
const express = require("express")
const morgan = require('morgan')

const app = express()
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
//middlewares
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json()) //middleware
app.use(express.static(`${__dirname}/public`)) // to server static files
// app.use((req, res, next) => {
//     console.log("Hello from the middleware 👋")
//     next()
// })


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

//this is a middleware for making requests to invalid paths
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHandler)
module.exports = app