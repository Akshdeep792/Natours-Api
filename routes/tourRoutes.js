const express = require('express')
const router = express.Router()

const { getAllTours, getTour, deleteTour, updateTour, createTour, aliasTopTours, getTourStats, getMonthlyPlan } = require('../controllers/tourController')
const { protect } = require('../controllers/authenticationController')
// router.param('id', checkId)

router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)
router.route('/top-5-tours').get(aliasTopTours, getAllTours)
router.route('/').get(protect, getAllTours).post(createTour)
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

module.exports = router