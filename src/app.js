const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const authRoutes = require('./routes/auth');
// ... other imports ...

const app = express();

// Set the port
const port = process.env.PORT || 3000;

// ... your middleware and route setup ...

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});