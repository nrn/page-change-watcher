#!/usr/local/bin/node
var cluster = require('cluster')
  , cc = require('config-chain')
  , argv = require('optimist').argv
  , server = require('./index')

var config = cc( argv
  , argv.config
  , 'config.json'
  , cc.find('config.json')
  , cc.env('change_')
  , { p: 1234
    , auth: 'foo:bar'
    }
  )

if (cluster.isMaster) {
  cluster.on('disconnect', function () {
    console.error('disconnect')
    cluster.fork()
  })
  cluster.fork()

} else {

  server(config.store)

}

