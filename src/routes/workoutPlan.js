const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Get workout plans page
router.get('/workout-plans', isAuthenticated, (req, res) => {
    res.render('workout-plan/index', {
        workoutPlan: {
            monday: { plans: [] },
            tuesday: { plans: [] },
            wednesday: { plans: [] },
            thursday: { plans: [] },
            friday: { plans: [] },
            saturday: { plans: [] },
            sunday: { plans: [] }
        }
    });
});

module.exports = router; 