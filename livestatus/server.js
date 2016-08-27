#!/usr/bin/env node

var app = require("koa")();
var route = require("koa-route");
var r = require("rethinkdb");
var bluebird = require("bluebird");
var rethinkdbStream = require('rethinkdb-stream');
var Readable = require('stream').Readable;
var map = require('map-stream');
var cors = require('koa-cors');
var sse = require("./sse.js");



app.use(createConnection);

app.use(cors({origin: true}));

app.use(route.get("/operations/:id", function *(id) {
  // otherwise node will automatically close this connection in 2 minutes
  this.req.setTimeout(Number.MAX_VALUE);

  this.type = 'text/event-stream; charset=utf-8';
  this.set('Cache-Control', 'no-cache');
  this.set('Connection', 'keep-alive');

  // fetching data

  const cursor = yield r.table("operations")
                        .get(id)
                        .changes({include_initial: true})
                        .run(this._rdbConn);

  var stream = rethinkdbStream(cursor)
                // .pipe(extractNewVal)

  var body = this.body = sse();

  stream.pipe(body);

  // if the connection closes or errors,
  // we stop the SSE.
  var socket = this.socket;
  socket.on('error', close);
  socket.on('close', close);

  function close() {
    stream.unpipe(body);
    stream.close();
    socket.removeListener('error', close);
    socket.removeListener('close', close);
  }
}));


app.listen(8090);
console.log("Listening on http://localhost:8090/");

// helpers

const extractNewVal = map((data, callback) => {
  callback(null, data["new_val"]);
})

const connectOptions = {
  host: process.env.RETHINKDB_HOST || 'localhost',
  password: process.env.RETHINKDB_PASSWORD || '',
  db: process.env.RETHINKDB_DATABASE || 'logsfeed'
};

function* createConnection(next) {
    try{
        var conn = yield r.connect(connectOptions);

        // Save the connection in the current context (will be passed to the next middleware)
        this._rdbConn = conn;

        this.socket.on('close', () => {
          console.log("Closing connection");
          this._rdbConn.close()
        })

        yield next;
    }
    catch(err) {
        this.status = 500;
        this.body = err.message || http.STATUS_CODES[this.status];
    }
}
