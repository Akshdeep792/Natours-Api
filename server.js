const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

//error came synchronisely
process.on('uncaughtException', err => {
    console.log(err.name, err.message)
    console.log("Uncaught Exception 💥, Shutting down...")
    process.exit(1)

})
const app = require('./app')


const DB = process.env.DATABASE_URI.replace('<password>', process.env.DATABASE_PASSWORD)

// console.log(process.env)
mongoose.connect(DB)
    .then(() => console.log("Connection to database is successfull...."))

const port = 3000

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is listening on the port: ${port}`)
})

// Error outside the express
process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})

