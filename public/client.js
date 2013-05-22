var change = require('./change')

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
