const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,Price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}



const getAllTours = catchAsync(async (req, res) => {
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate()
    const tours = await features.query;

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })
})
const getTour = catchAsync(async (req, res, next) => {
    // console.log(req.params)
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id })
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})


const createTour = catchAsync(async (req, res) => {
    // console.log(req.body)
    const newTour = await Tour.create(req.body)
    res.status(201).json({
        status: "success",
        data: {
            tours: newTour
        }
    })
})

const updateTour = catchAsync(async (req, res) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true

    })
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404))
    }
    res.status(200).json({
        status: "success",
        data: {
            tour
        }
    })
})

const deleteTour = catchAsync(async (req, res) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404))
    }
    res.status(200).json({
        status: "success",
        data: null
    })
})

const getTourStats = catchAsync(async (req, res) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                num: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ]);
    res.status(200).json({
        status: "success",
        data: stats
    })
})

const getMonthlyPlan = catchAsync(async (req, res) => {
    const year = req.params.year * 1
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        }, {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        }, {
            $group: {
                _id: { $month: '$startDates' },
                numTourStats: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        }, {
            $sort: {
                numTourStats: -1
            }
        }, {
            $limit: 12
        }
    ])
    res.status(200).json({
        status: "success",
        data: plan
    })
})

module.exports = { getAllTours, getTour, deleteTour, updateTour, createTour, aliasTopTours, getTourStats, getMonthlyPlan }