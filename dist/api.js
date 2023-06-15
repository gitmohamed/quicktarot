"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _express = _interopRequireWildcard(require("express"));
var _serverlessHttp = _interopRequireDefault(require("serverless-http"));
var _bodyParser = _interopRequireDefault(require("body-parser"));
var _fs = require("fs");
var _path = _interopRequireDefault(require("path"));
var _lodash = _interopRequireDefault(require("lodash.clonedeep"));
var _lodash2 = _interopRequireDefault(require("lodash.remove"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var app = (0, _express["default"])();
var router = (0, _express.Router)();
var root = process.env.NODE_ENV === "production" ? _path["default"].join(__dirname, "..") : __dirname;
app.use(_bodyParser["default"].json());
app.use(_express["default"]["static"](_path["default"].join(root, "/static")));
app.get("/", function (_req, res) {
  return res.sendFile("./index.html", {
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
  res.locals.rawData = JSON.parse((0, _fs.readFileSync)("./static/card_data.json", "utf8"));
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
  var cardPool = (0, _lodash["default"])(cards);
  var returnCards = [];
  var _loop2 = function _loop2() {
    var id = Math.floor(Math.random() * (78 - i));
    var card = cardPool[id];
    returnCards.push(card);
    (0, _lodash2["default"])(cardPool, function (c) {
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
var handler = (0, _serverlessHttp["default"])(app);
exports.handler = handler;