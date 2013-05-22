var EE = require('events').EventEmitter
  , shoe = require('shoe')
  , emitStream = require('emit-stream')
  , JSONStream = require('JSONStream')

module.exports = change

function change (url) {
  var sock = shoe(url)
    , toServ = new EE
    , fromServ = emitStream(sock.pipe(JSONStream.parse([true])))

  emitStream(toServ)
    .pipe(JSONStream.stringify())
    .pipe(sock)

  sock.on('end', function () {
    if (!window.closed) fromServ.emit('disconnect')
  })

  fromServ.register = function (page, user) {
    toServ.emit('register', page, user)
  }

  return fromServ
}

