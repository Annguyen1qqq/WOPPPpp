const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const weightRoutes = require('./routes/weight');
const workoutPlanRoutes = require('./routes/workoutPlan');

const app = express();

// Set the port
const port = process.env.PORT || 3000;

// Create MongoDB session store
const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
});

// Catch errors
store.on('error', function(error) {
    console.log('Session Store Error:', error);
});

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: false,
    saveUninitialized: false
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connection with retry logic
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Use routes
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', weightRoutes);
app.use('/', workoutPlanRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});