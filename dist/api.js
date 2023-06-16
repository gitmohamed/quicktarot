'use strict';

var express = require("express");
var serverless = require('serverless-http');
var bodyParser = require("body-parser");
var fs = require("fs");
var path = require('path');
var cloneDeep = require("lodash").cloneDeep;
var remove = require("lodash").remove;
var app = express();
var router = express.Router();
var root = process.env.NODE_ENV === "production" ? path.join(__dirname, "..") : __dirname;
app.use(bodyParser.json());
app.use(express["static"](path.join(root, "/static")));
app.get("/", function (_req, res) {
  return res.sendFile("./static/index.html", {
    root: root
  });
});
app.use("/.netlify/functions/api/v1/", router);
router.get("/docs", function (_req, res) {
  return res.sendFile("./static/ekswagger-tarot-api-1.3-resolved.json", {
    root: root
  });
});
router.use(function (_req, res, next) {
  res.locals.rawData = JSON.parse(fs.readFileSync("./static/card_data.json", "utf8"));
  return next();
});
router.use(function (_req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json");
  return next();
});
router.get("/", function (_req, res) {
  return res.redirect("/.netlify/functions/api/v1/cards");
});
router.get("/cards", function (_req, res) {
  var cards = res.locals.rawData.cards;
  return res.json({
    nhits: cards.length,
    cards: cards
  }).status(200);
});
router.get("/cards/search", function (req, res) {
  var cards = res.locals.rawData.cards;
  console.log("req.query:", req.query);
  if (!req.query || Object.keys(req.query).length === 0) return res.redirect("/.netlify/functions/api/v1/cards");
  var filteredCards = [];
  var _loop = function _loop(k) {
    if (k !== "q") {
      if (k === "meaning") {
        filteredCards = cards.filter(function (c) {
          return [c.meaning_up, c.meaning_rev].join().toLowerCase().includes(req.query[k].toLowerCase());
        });
      } else {
        filteredCards = cards.filter(function (c) {
          return c[k] && c[k].toLowerCase().includes(req.query[k].toLowerCase());
        });
      }
    } else if (k === "q") {
      filteredCards = cards.filter(function (c) {
        return Object.values(c).join().toLowerCase().includes(req.query[k].toLowerCase());
      });
    }
  };
  for (var k in req.query) {
    _loop(k);
  }
  return res.json({
    nhits: filteredCards.length,
    cards: filteredCards
  }).status(200);
});
router.get("/cards/random", function (req, res) {
  var cards = res.locals.rawData.cards;
  var n = req.query.n > 0 && req.query.n < 79 ? req.query.n : 78;
  var cardPool = cloneDeep(cards);
  var returnCards = [];
  var _loop2 = function _loop2() {
    var id = Math.floor(Math.random() * (78 - i));
    var card = cardPool[id];
    returnCards.push(card);
    remove(cardPool, function (c) {
      return c.name_short === card.name_short;
    });
  };
  for (var i = 0; i < n; i++) {
    _loop2();
  }
  return res.json({
    nhits: returnCards.length,
    cards: returnCards
  });
});
router.get("/cards/:id", function (req, res, next) {
  var cards = res.locals.rawData.cards;
  var card = cards.find(function (c) {
    return c.name_short === req.params.id;
  });
  if (typeof card === "undefined") return next();
  return res.json({
    nhits: 1,
    card: card
  }).status(200);
});
router.get("/cards/suits/:suit", function (req, res, next) {
  var cards = res.locals.rawData.cards;
  var cardsOfSuit = cards.filter(function (c) {
    return c.suit === req.params.suit;
  });
  if (!cardsOfSuit.length) return next();
  return res.json({
    nhits: cardsOfSuit.length,
    cards: cardsOfSuit
  }).status(200);
});
router.get("/cards/courts", function (_req, res) {
  var cards = res.locals.rawData.cards;
  var courtCards = cards.filter(function (c) {
    return ["queen", "king", "page", "knight"].includes(c.value);
  });
  return res.json({
    nhits: courtCards.length,
    cards: courtCards
  }).status(200);
});
router.get("/cards/courts/:court", function (req, res, next) {
  var cards = res.locals.rawData.cards;
  var court = req.params.court;
  var len = court.length;
  if (len < 4) return next();
  var courtSg = court[len - 1] === "s" ? court.slice(0, len - 1) : court;
  var cardsOfCourt = cards.filter(function (c) {
    return c.value === courtSg;
  });
  if (!cardsOfCourt.length) return next();
  return res.json({
    nhits: cardsOfCourt.length,
    cards: cardsOfCourt
  }).status(200);
});
router.use(function (_req, _res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});
router.use(function (err, _req, res) {
  res.status(err.status || 500);
  res.json({
    error: {
      status: err.status,
      message: err.message
    }
  });
});
var port = process.env.PORT || 8000;
app.listen(port, function () {
  console.log("RWS API Server now running on port", port);
});
module.exports.handler = serverless(app);