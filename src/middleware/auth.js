const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

const isAdmin = (req, res, next) => {
    if (req.session.userId && req.session.isAdmin === true) {
        return next();
    }
    res.status(403).render('error', {
        error: 'Access denied. Admin privileges required.'
    });
};

module.exports = { isAuthenticated, isAdmin }; 