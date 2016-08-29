RethinkDB + NodeJS as ActionCable alternative
================================================

In this example the "magic" is happening in `livestatus/server.js` file,
which acts as a "cable" between the Ruby-on-Rails back-end and RiotJS front-end.
It streams a sequence of changes from RethinkDB database to front-end via SSE.

```js
app.use(route.get("/operations/:id", function *(id) {
  const cursor = yield r.table("operations")
    .get(id)
    .changes({include_initial: true})
    .run(this._rdbConn);

  this.sse(cursor, extractNewVal);
}));
```

On the server, the changes are initiated with the following code in `WelcomeController`
which updates an instance of Operation record in RethinkDB

```ruby
def do_something
  operation.progress += 1
  operation.save!
  render json: {status: 'OK'}
end
```

On the client, the SSE stream is consumed in `app/assets/javascripts/progressor.tag`
using `Rx.DOM.fromEventSource` RxJS extension.
