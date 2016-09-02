<progressor>

  <p>Current progress: { progress }</p>

  <script>
    this.progress = "Loading..."

    var source = Rx.DOM.fromEventSource(opts.feed_url).map(function(data) {
      return JSON.parse(data);
    });

    var subscription = source.subscribe(function(data) {
      this.update({progress: data.progress})
    }.bind(this));

    this.on("unmount", function() {
      subscription.unsubscribe();
    })
  </script>
</progressor>
