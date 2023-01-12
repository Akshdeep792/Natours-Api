const express = require('express')
const router = express.Router()

const { getAllTours, getTour, deleteTour, updateTour, createTour, aliasTopTours, getTourStats, getMonthlyPlan } = require('../controllers/tourController')
const { protect, restrictTo } = require('../controllers/authenticationController')
// const { createReview, setTourUserIds } = require('../controllers/reviewController')
const reviewRoutes = require('../routes/reviewRoutes')
// router.param('id', checkId)


// // /tour/847djh39/reviews
// //nested routes
// router.route('/:tourId/reviews').post(protect, restrictTo('user'), setTourUserIds, createReview)

router.use('/:tourId/reviews', reviewRoutes)

router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan)
router.route('/top-5-tours').get(aliasTopTours, getAllTours)
router.route('/').get(getAllTours).post(protect, restrictTo('admin', 'lead-guide'), createTour)
router.route('/:id').get(getTour).patch(protect, restrictTo('admin', 'lead-guide'), updateTour).delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)


module.exports = router