var express = require('express'),
    util = require('util'),
    http = require('http');

module.exports = function() {

    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('hello world!');
        res.end();
    }).listen(8000);

    util.puts('server running on port 8000')

};
