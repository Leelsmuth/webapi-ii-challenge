const express = require("express");
const cors = require("cors");

const db = require("./data/db");
const server = express();

server.use(cors());
server.use(express.json());

server.post("/api/posts", (req, res) => {
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

server.post("/api/posts/:id/comments", (req, res) => {
  let { id } = req.params;
  let comment = req.body;

  comment.post_id = id;

  if (!comment || !comment.text) {
    res
      .status(400)
      .json({ errorMessage: "Please provide text for the comment." });
  }

  db.insertComment(comment)
    .then(data => {
      db.findCommentById(data.id)
        .then(data => {
          res.status(201).json(data);
        })
        .catch(err => {
          res.status(500).json({
            error:
              "Error in sending back newly created comment, but it was created."
          });
        });
    })
    .catch(err => {
      res.status(500).json({
        error: "There was an error while saving the comment to the database"
      });
    });
});

server.get("/api/posts", (req, res) => {
  db.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(() => {
      res
        .status(500)
        .json({ error: "The posts information could not be retrieved." });
    });
});

server.get("/api/posts/:id", (req, res) => {
  db.findById(req.params.id)
    .then(user => {
      if (user) {
        res.status(200).json(user);
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
    })
    .catch(() => {
      res
        .status(500)
        .json({ error: "The comments information could not be retrieved." });
    });
});

server.get("/:id/comments", (req, res) => {
  let { id } = req.params;

  db.findPostByComments(id)
    .then(data => {
      if (!data || data.length == 0) {
        res
          .status(400)
          .json({ message: "The post with the specified ID does not exist." });
      }
      res.status(200).json(data);
    })
    .catch(err =>
      res
        .status(500)
        .json({ error: "The post information could not be retrieved." })
    );
});

server.delete("/api/posts/:id", (req, res) => {
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

server.put("/api/posts/:id", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    res
      .status(400)
      .json({ errorMessage: "Please provide title and content for the post." });
  } else {
    db.update(req.params.id, req.body)
      .then(user => {
        if (user) {
          res.status(200).json(user);
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

server.listen(4400, () => {
  console.log("\n*** Server Running on http://localhost:4400 ***\n");
});
