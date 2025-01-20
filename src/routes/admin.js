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
        
        // Debug logs
        console.log('Login attempt for:', username);
        
        // Find user with explicit admin check
        const user = await User.findOne({ 
            username: username,
            isAdmin: true 
        });

        if (!user) {
            console.log('Admin user not found');
            return res.render('admin/login', { 
                error: 'Invalid admin credentials',
                username: username // Preserve the username in the form
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            console.log('Password incorrect');
            return res.render('admin/login', { 
                error: 'Invalid admin credentials',
                username: username // Preserve the username in the form
            });
        }

        // Set session with explicit admin flag
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.isAdmin = true;
        
        // Save session before redirect
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.render('admin/login', { 
                    error: 'Session error',
                    username: username
                });
            }
            res.redirect('/admin');
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.render('admin/login', { 
            error: 'Server error, please try again',
            username: req.body.username
        });
    }
});

// Test route to verify admin session
router.get('/admin/test-session', (req, res) => {
    res.json({
        session: {
            userId: req.session.userId,
            username: req.session.username,
            isAdmin: req.session.isAdmin
        }
    });
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
module.exports = router; 