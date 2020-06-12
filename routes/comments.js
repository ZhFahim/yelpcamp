var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// Show new comment form
router.get("/new", middleware.isLoggedIn, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    if (err || !foundCampground) {
      req.flash("error", "No campground found");
      res.redirect("/campgrounds");
    } else {
      res.render("comments/new", { campground: foundCampground });
    }
  });
});

// Comment Create
router.post("/", middleware.isLoggedIn, function(req, res) {
  Campground.findById(req.params.id, function(err, campground) {
    if (err || !campground) {
      req.flash("error", "No campground found");
      res.redirect("back");
    } else {
      Comment.create(req.body.comment, function(err, comment) {
        if (err) {
          console.log(err);
        } else {
          // Add User info to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          campground.comments.push(comment);
          campground.save(function(err) {
            if (err) {
              console.log(err);
            } else {
              req.flash("success", "Comment Added!");
              res.redirect("/campgrounds/" + campground._id);
            }
          });
        }
      });
    }
  });
});

// Show edit comment form
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    if (err || !foundCampground) {
      req.flash("error", "No campground found");
      return res.redirect("back");
    }
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        res.render("comments/edit", {
          campground_id: req.params.id,
          comment: foundComment
        });
      }
    });
  });
});

// Update comment
router.put("/:comment_id", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
    err,
    updatedComment
  ) {
    if (err) {
      console.log(err);
      req.redirect("back");
    } else {
      req.flash("success", "Comment updated!");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// Destroy comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Comment.findByIdAndDelete(req.params.comment_id, function(err) {
    if (err) {
      console.log(err);
      req.redirect("back");
    } else {
      req.flash("success", "Comment removed!");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

module.exports = router;
