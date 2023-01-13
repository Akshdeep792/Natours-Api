const mongoose = require('mongoose')
const validator = require('validator')
// const User = require('./userModel')
const tourSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxLength: [40, 'A tour name must have less or equal then 40 characters'],
        minLength: [10, 'A tour name must have greater then 10 characters'],
        // validate: [validator.isAlpha, 'Tour name must contain alphabets.']
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Diffuculty is either easy, medium, or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.66666 46.6 = 47/10 = 4.7

    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {

            validator: function (val) {
                //does not work with update function. Only work when new document is being created. Point to new document
                return val < this.price
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    startDates: [Date],
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    // guides: Array child referencing
    guides: [
        {
            type: mongoose.Schema.ObjectId, //object ids
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//indexes  - make read performace of database much much better
// tourSchema.index({ price: 1 })
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })


tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

// virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

//document middleware
// tourSchema.pre('save', function (next) {
//     this.slug = slugify(this.name, { lower: true })

//     next()
// })

// embedding tours
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await URLSearchParams.findById(id));
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })
// tourSchema.post('save', function (doc, next) {
//     console.log(doc)
//     next()
// })


//Query Middleware
// tourSchema.pre('find', function (nexts) {
//     this.find({ secretTour: { $ne: true } })
//     next()
// })

// tourSchema.pre(/^find/, function (nexts) {
//     this.find({ secretTour: { $ne: true } })
//     next()
// })

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next()
})

//aggregate middleware
// tourSchema.pre('aggregate', function () {
//     console.log(this.pipeline())
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//     next()
// })
const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour