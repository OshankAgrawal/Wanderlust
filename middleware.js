const Listing = require('./models/listing');
const Review = require('./models/review'); // Adjust the path as necessary
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be logged in to create a listing');
    return res.redirect('/login');
  }
  next();
};

const saveRedirectUrl = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.redirectUrl = req.session.returnTo;
  }
  next();
};

const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!res.locals.currentUser || !listing.owner.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not the owner of the listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

 // Adjust the path as necessary
const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!res.locals.currentUser || !review.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

const validateListing = (req, res, next) =>{
  let { error } = listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
};

const validateReview = (req, res, next) =>{
  let { error } = reviewSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
};

// ✅ Export all middleware functions in one object
module.exports = {
  isLoggedIn,
  saveRedirectUrl,
  isOwner,
  isReviewAuthor,
  validateListing,
  validateReview
};

