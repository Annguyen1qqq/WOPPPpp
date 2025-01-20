const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Get workout plans page
router.get('/workout-plans', isAuthenticated, (req, res) => {
    try {
        const workoutPlans = {
            monday: {
                plans: [
                    {
                        name: "Tập Ngực",
                        description: "4 hiệp x 12 lần, nghỉ 90 giây giữa các hiệp",
                        duration: 90,
                        image: "/images/chest.jpg"
                    },
                    {
                        name: "Tập Vai",
                        description: "3 hiệp x 15 lần, nghỉ 60 giây giữa các hiệp",
                        duration: 60,
                        image: "/images/shoulder.jpg"
                    }
                ]
            },
            tuesday: {
                plans: [
                    {
                        name: "Tập Chân",
                        description: "5 hiệp x 10 lần, nghỉ 120 giây giữa các hiệp",
                        duration: 120,
                        image: "/images/legs.jpg"
                    }
                ]
            },
            wednesday: {
                plans: [
                    {
                        name: "Tập Lưng",
                        description: "4 hiệp x 12 lần, nghỉ 90 giây giữa các hiệp",
                        duration: 90,
                        image: "/images/back.jpg"
                    }
                ]
            },
            thursday: { plans: [] },
            friday: {
                plans: [
                    {
                        name: "Tập Tay",
                        description: "3 hiệp x 15 lần, nghỉ 60 giây giữa các hiệp",
                        duration: 60,
                        image: "/images/arms.jpg"
                    }
                ]
            },
            saturday: { plans: [] },
            sunday: { plans: [] }
        };
        
        res.render('workout-plan/index', { workoutPlans });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 