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
router.route('/monthly-plan/:year').get(getMonthlyPlan)
router.route('/top-5-tours').get(aliasTopTours, getAllTours)
router.route('/').get(protect, getAllTours).post(createTour)
router.route('/:id').get(getTour).patch(updateTour).delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)


module.exports = router