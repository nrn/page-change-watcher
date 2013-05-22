# Page Change Watcher

Simple service to allow users to see who else is looking at an external page,
and notify them if it's changed.

client.js is wraped with UMD so you can require it or just include it in a script
tag and it will attach to the global object as change.

##Usage

To connect to the server:
`var server = change('/path/to/sock')`

Now register:
`server.register(page, user)`

Server is now an event emmitter that will fire these events:

###'users'
fires when the users array changes, gives you the array of users watching
the page, excuding yourself.

###'update'
The page you're watching has been updated.

###'disconnect'
The watcher lost it's connection to the server.

##Example:

```javascript
jQuery(function () { 
  var serv = change('/sock')

  serv.on('users', function (users) {
    console.log(users)
    $('body').append(users)
  })

  serv.on('update', function () {
    console.log('Update!')
  })

  serv.on('disconnect', function () {
    $('body').append('<br>Disconnected from server.')
  })

  serv.register('/test', 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random()*26)])

})
```

Started from https://github.com/nrn/prefab, by Nick Niemeir <nick.niemeir@gmail.com>.

