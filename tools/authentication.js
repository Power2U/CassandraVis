var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
// Define a middleware function to be used for every secured routes 
module.exports.auth = function (req, res, next) {
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

passport.use(new LocalStrategy(
    function (username, password, done) {
        if (username === "admin" && password === "admin") // stupid example
            return done(null, {
            name: "admin"
        });

        return done(null, false, {
            message: 'Incorrect username.'
        });
    }
));
