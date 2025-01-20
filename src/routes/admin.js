const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Admin login page
router.get('/admin/login', (req, res) => {
    res.render('admin/login');
});

// Admin login handle
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt:', { username }); // Debug log
        
        // Find user
        const user = await User.findOne({ username });
        console.log('User found:', user ? 'yes' : 'no'); // Debug log
        
        if (!user || !user.isAdmin) {
            console.log('User not found or not admin'); // Debug log
            return res.render('admin/login', { 
                error: 'Invalid admin credentials' 
            });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch); // Debug log
        
        if (!isMatch) {
            return res.render('admin/login', { 
                error: 'Invalid admin credentials' 
            });
        }
        
        // Set admin session
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.isAdmin = true;
        
        res.redirect('/admin');
    } catch (error) {
        console.error('Login error:', error); // Debug log
        res.render('admin/login', { 
            error: 'Server error' 
        });
    }
});

// Admin dashboard
router.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    try {
        const selectedDay = req.query.day || 'monday';
        const editIndex = req.query.edit;
        const editMode = editIndex !== undefined;
        
        const workoutPlans = {
            monday: {
                plans: [
                    {
                        name: "Tập Ngực",
                        description: "4 hiệp x 12 lần, nghỉ 90 giây giữa các hiệp",
                        duration: 90,
                        image: "/images/chest.jpg"
                    }
                ]
            },
            tuesday: { plans: [] },
            wednesday: { plans: [] },
            thursday: { plans: [] },
            friday: { plans: [] },
            saturday: { plans: [] },
            sunday: { plans: [] }
        };

        const workout = editMode ? workoutPlans[selectedDay].plans[editIndex] : null;

        res.render('admin/index', {
            selectedDay,
            editMode,
            editIndex,
            workout,
            workoutPlans,
            username: req.session.username
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Add new workout plan
router.post('/plans', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { day, name, description, duration } = req.body;
        // Handle image upload and save plan to database
        res.redirect('/admin?day=' + day);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Update workout plan
router.post('/plans/:day/:index', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { day, index } = req.params;
        const { name, description, duration } = req.body;
        // Update plan in database
        res.redirect('/admin?day=' + day);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Delete workout plan
router.post('/plans/:day/:index/delete', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { day, index } = req.params;
        // Delete plan from database
        res.redirect('/admin?day=' + day);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 