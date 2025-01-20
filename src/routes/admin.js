const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Admin login page
router.get('/admin/login', (req, res) => {
    res.render('admin/login', { error: null });
});

// Admin login handle
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt:', { username }); // Debug log

        // Basic validation
        if (!username || !password) {
            return res.render('admin/login', {
                error: 'Please enter both username and password',
                username
            });
        }

        // Find user
        const user = await User.findOne({ username });
        console.log('User found:', !!user); // Debug log

        if (!user) {
            return res.render('admin/login', {
                error: 'Invalid credentials',
                username
            });
        }

        // Check if user is admin
        if (!user.isAdmin) {
            console.log('User is not admin'); // Debug log
            return res.render('admin/login', {
                error: 'Access denied: Not an admin user',
                username
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch); // Debug log

        if (!isMatch) {
            return res.render('admin/login', {
                error: 'Invalid credentials',
                username
            });
        }

        // Set session
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.isAdmin = true;

        // Save session explicitly
        await new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.redirect('/admin');

    } catch (error) {
        console.error('Login error:', error);
        res.render('admin/login', {
            error: 'Server error occurred',
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
router.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
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

        res.render('admin', {
            selectedDay,
            editMode,
            editIndex,
            workout,
            workoutPlans,
            username: req.session.username
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
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

// Create test admin account
router.get('/admin/setup', async (req, res) => {
    try {
        // Delete existing admin
        await User.deleteOne({ username: 'admin' });

        // Create new admin
        const hashedPassword = await bcrypt.hash('admin', 10);
        const admin = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            isAdmin: true
        });

        await admin.save();

        res.json({
            message: 'Admin account created',
            credentials: {
                username: 'admin',
                password: 'admin'
            }
        });
    } catch (error) {
        console.error('Setup error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 