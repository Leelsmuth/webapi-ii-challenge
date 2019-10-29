const express = require("express");
const db = require("./db");

const router = express.Router();

router.post("/", (req, res) => {
  const { title, contents } = req.body;

  if (!title || !contents) {
    res.status(400).json({
      errorMessage: "Please provide title and contents for the post."
    });
  } else {
    db.insert(req.body)
      .then(post => {
        res.status(201).json({ successMessage: "Created!!" });
      })
      .catch(() => {
        res.status(500).json({
          error: "There was an error while saving the post to the database"
        });
      });
  }
});

router.post("/:id/comments", (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  // check required text
  if (!text) {
    res
      .status(400)
      .json({ errorMessage: "Please provide text for the comment." });
  }
  // find post
  db.findById(id)
    .then(post => {
      if (!post) {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      } else {
        // add comment
        db.insertComment({ text, post_id: id })
          .then(comment => {
            // get comment data
            db.findCommentById(comment.id)
              .then(newComment => {
                res.status(201).json(newComment);
              })
              .catch(err => {
                res.status(500).json({
                  errorMessage: "Could not get newly created comment."
                });
              });
          })
          .catch(err => {
            res.status(500).json({
              error:
                "There was an error while saving the comment to the database"
            });
          });
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: "The post information could not be retrieved." });
    });
});

router.get("/", (req, res) => {
  db.find()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(() => {
      res
        .status(500)
        .json({ error: "The posts information could not be retrieved." });
    });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.findById(id)
    .then(post => {
      if (!post) {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      } else {
        res.status(200).json(post);
      }
    })
    .catch(() => {
      res
        .status(500)
        .json({ error: "The comments information could not be retrieved." });
    });
});

router.get("/:id/comments", (req, res) => {
  const { id } = req.params;
  // get post
  db.findById(id)
    .then(post => {
      if (!post) {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." })
          .end();
      } else {
        // get comments
        db.findPostComments(id)
          .then(comments => {
            res.status(200).json(comments);
          })
          .catch(err => {
            res
              .status(500)
              .json({
                error: "The comments information could not be retrieved."
              })
              .end();
          });
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: "The post information could not be retrieved." })
        .end();
    });
});

router.delete("/:id", (req, res) => {
  db.remove(req.params.id)
    .then(count => {
      if (count && count > 0) {
        res.status(200).json({
          message: "the user was deleted."
        });
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
    })
    .catch(() => {
      res.status(500).json({ errorMessage: "The post could not be removed" });
    });
});

router.put("/:id", (req, res) => {
  const { title, contents } = req.body;
  const { id } = req.params;

  if (!title || !contents) {
    res
      .status(400)
      .json({ errorMessage: "Please provide title and content for the post." });
  } else {
    db.update(id, req.body)
      .then(user => {
        if (user) {
          res.status(200).json({ successMessage: "It worked!!!" });
        } else {
          res.status(404).json({
            message: "The post with the specified ID does not exist."
          });
        }
      })
      .catch(() => {
        res.status(500).json({
          errorMessage: "The post information could not be modified."
        });
      });
  }
});

module.exports = router;
