var express = require('express')
var path = require("path")
var app = express()

app.set('port', (process.env.PORT || 3000))
app.use(express.static(__dirname + '/public')) // this will serve index.html

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
