#!/usr/bin/env node

var app = require("koa")();
var route = require("koa-route");
var r = require("rethinkdb");
var bluebird = require("bluebird");
var rethinkdbStream = require('rethinkdb-stream');
var sse = require('koa-sse');
var Readable = require('stream').Readable;
var map = require('map-stream');
var cors = require('koa-cors');

// http://stackoverflow.com/questions/8313628/node-js-request-how-to-emitter-setmaxlisteners
require('events').EventEmitter.prototype._maxListeners = 30;

const connectOptions = {
  host: process.env.RETHINKDB_HOST || 'localhost',
  password: process.env.RETHINKDB_PASSWORD || '',
  db: process.env.RETHINKDB_DATABASE || 'logsfeed'
};

const extractNewVal = map((data, callback) => {
  callback(null, data["new_val"]);
})

bluebird.coroutine(function*() {
  console.log("Connecting to RethinkDB...");
  const conn = yield r.connect(connectOptions);

  app.use(cors());
  app.use(sse());

  app.use(route.get("/operations/:id", function *(id) {
    const cursor = yield r.table("operations").get(id).changes({include_initial: true}).run(conn);
    this.sse(rethinkdbStream(cursor).pipe(extractNewVal));
  }));

  app.listen(8090);
  console.log("Listening on http://localhost:8090/");
})();
