const express = require("express");
const cors = require("cors");

const router = require("./data/posts-router");
const server = express();

server.use('/api/posts', router);

server.use(cors());
server.use(express.json());


module.exports = server;