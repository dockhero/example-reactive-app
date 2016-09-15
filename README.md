RethinkDB + NodeJS as ActionCable alternative
================================================

An example Rails app which uses RethinkDB + NodeJS microservice to push background operation progress to the front-end.
The progress is updated in the DB via NoBrainer ORM, and RethinkDB's changefeed is delivered to the front-end
using Server-Sent Events (SSE) and rendered in the UI with RiotJS.

Try it yourself
---------------

The Ruby part of this example can be deployed to Heroku with the standard Git deployment flow.
Once deployed, set `RETHINKDB_PASSWORD` heroku config var to something random

```bash
heroku config:set RETHINKDB_PASSWORD="some-random-secret-582"
```

Setting up RethinkDB + NodeJS microservice at Heroku can be done via Dockhero addon (see [docs](
https://devcenter.heroku.com/articles/dockhero?preview=1) ).
Please sign up for free alpha access at [dockhero.io](https://dockhero.io/)


```bash
heroku plugins:install dockhero
heroku addons:create dockhero
heroku dh:wait
heroku dh:compose up -d
```

Now everything should be up and running, and you can test the app:

```bash
heroku open
```

How it Works
---------------

In this example all the "magic" is happening in `livestatus/server.js` file,
which acts as a "cable" between the Ruby-on-Rails back-end and RiotJS front-end.
It streams a sequence of changes from RethinkDB database to front-end via SSE.

```js
// livestatus/server.js
app.use(route.get("/operations/:id", function *(id) {
  const cursor = yield r.table("operations")
    .get(id)
    .changes({include_initial: true})
    .run(this._rdbConn);

  this.sse(cursor, extractNewVal);
}));
```

On the Rails back-end, the changes are initiated with the following code in `WelcomeController`
which updates an instance of Operation record in RethinkDB

```ruby
# app/controllers/welcome_controller.rb
def do_something
  operation.progress += 1
  operation.save!
  render json: {status: 'OK'}
end
```

On the client, the SSE stream is consumed in `app/assets/javascripts/progressor.tag`
using `Rx.DOM.fromEventSource` RxJS extension.

```js
// app/assets/javascripts/progressor.tag
var source = Rx.DOM.fromEventSource(opts.feed_url).map(function(data) {
  return JSON.parse(data);
});

var subscription = source.subscribe(function(data) {
  this.update({progress: data.progress})
}.bind(this));
```


