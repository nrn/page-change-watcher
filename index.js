// server.js
var http = require('http')
  , EE = require('events').EventEmitter
  , qs = require('querystring')
  // dependencies
  , ecstatic = require('ecstatic')
  , ramrod = require('ramrod')
  , browserify = require('browserify')
  , shoe = require('shoe')
  , emitStream = require('emit-stream')
  , JSONStream = require('JSONStream')
  , streamCb = require('stream-cb')

  , index = require('./public/routes/index')

module.exports = server

function server (opts) {
  var routes = 
      { '': null
      , 'client.js': null
      }
    , router = ramrod(routes)
    , app = http.createServer(router.dispatch.bind(router))
    , b = browserify(__dirname + '/public/client.js')
    , sock = shoe(function (client) {
        var toClient = new EE
          , fromClient = emitStream(client.pipe(JSONStream.parse([true])))

        emitStream(toClient).pipe(JSONStream.stringify()).pipe(client)
        fromClient.on('register', function (page, user) {
          client.on('end', register(page, user, toClient))
        })
      })
    , updates = new EE
    , users = new EE

  router.on('', function (req, res) {
    res.statusCode = 200
    res.write(index())
    res.end()
  })

  router.on('client.js', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/javascript')
    b.bundle({ insertGlobals: true, debug: true }).pipe(res)
  })

  router.post('update', function (req, res) {
    var header = req.headers.authorization
    if (header) header = header.split(' ')
    var auth = header[1]
    if (auth) auth = (new Buffer(auth, 'base64')).toString()

    if (auth !== opts.auth) {
      res.statusCode = 401
      return res.end('Not Authorized')
    }

    req.pipe(streamCb(function (e, body) {
      if (e) {
        res.statusCode = 500
        return res.end('Update failed')
      }
      var page = qs.parse(body).page
      res.statusCode = 200
      res.end('ok')
      if (page) updates.emit(page)
    }))
  })

  router.on('*', ecstatic(__dirname + '/public'))

  function register(page, user, toClient) {
    console.log([ 'register', page, user ])
    updates.on(page, update)
    users.on(page, listener)
    function update () {
      toClient.emit('update')
    }
    function listener () {
      toClient.emit('users', users.listeners(page).map(get('user')).filter(out(user)))
    }
    listener.user = user
    users.emit(page)
    return function () {
      updates.removeListener(page, update)
      users.removeListener(page, listener)
      users.emit(page)
    }
  }

  app.listen(opts.p, function (e) {
    if (e) throw e
    console.log('Listening on: ' + opts.p)
  })

  sock.install(app, '/sock')

  return app
}

function get (thing) {
  return function (o) {
    return o[thing]
  }
}

function out (thing) {
  return function (o) {
    return o !== thing
  }
}

