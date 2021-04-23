var GoogleStrategy = require("passport-google-oauth2").Strategy;
var passport = require("passport");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/google-callback",
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, {
        googleId: profile.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }
  )
);

module.exports = passport;
