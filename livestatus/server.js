#!/usr/bin/env node

var app = require("koa")();
const route = require("koa-route");
const r = require("rethinkdb");
const cors = require('koa-cors');
const rethinkSse = require('./rethink-sse');


const connectOptions = {
  host: process.env.RETHINKDB_HOST || 'localhost',
  password: process.env.RETHINKDB_PASSWORD || '',
  db: process.env.RETHINKDB_DATABASE || 'logsfeed'
};

const connectionPromise = r.connect(connectOptions);
app.use(ensureConnection);
app.use(cors());
app.use(rethinkSse());


app.use(route.get("/operations/:id", function *(id) {
  const cursor = yield r.table("operations")
    .get(id)
    .changes({include_initial: true})
    .run(this._rdbConn);

  this.rethinkSse(cursor, extractNewVal);
}));


app.listen(8090);
console.log("Listening on http://localhost:8090/");

// helpers

function extractNewVal(data) {
  return data["new_val"];
}

function* ensureConnection(next) {
  this._rdbConn = yield connectionPromise;
  yield next;
}
