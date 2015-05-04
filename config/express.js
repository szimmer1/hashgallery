var express = require('express'),
    util = require('util'),
    http = require('http');

module.exports = function() {

    var port = process.env.NODE_ENV == 'development' ? 8000 : 80;

    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('hello world!');
        res.end();
    }).listen(port);

    util.puts('server running on port 8000')

};
