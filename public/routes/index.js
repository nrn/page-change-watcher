var f = require('flates')

var scripts =
  [ '/dep/jquery.min.js'
  , '/test.js'
  , '/client.js'
  ]

module.exports = function () {
  return f.d() + scripts.map(function (script) {
    return f.script({ src: script })
  }).join('')
}
