// var sse = require('sse-stream');
// var pipe = require('multipipe');
var map = require('map-stream');
var rethinkdbStream = require('rethinkdb-stream');

module.exports = function(){
  return function*(next){
    this.rethinkSse = function(cursor, transformer){
      this.req.setTimeout(Number.MAX_VALUE);
      this.set('Content-Type', 'text/event-stream');
      this.set('Cache-Control', 'no-cache');
      this.set('Connection', 'keep-alive');

      //https://github.com/dominictarr/event-stream
      var transformerStream = map(function (data, callback) {
        if (transformer) {
          data = transformer(data);
        }
        callback(null, "data: " + JSON.stringify(data) + "\n\n");
      })

      var dbStream = rethinkdbStream(cursor);

      this.body = dbStream.pipe(transformerStream);

      this.body.on('close', function() {
        dbStream.close();
      })
    };

    yield next;
  }
};
