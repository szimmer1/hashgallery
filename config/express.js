var express = require('express'),
    path = require('path'),
    api = require(path.resolve('./config/routes/api'));
    _ = require('underscore');

module.exports = function() {

    var app = express();

    app.use(express.static(path.resolve('./public')));
    app.use(express.static(path.resolve('./proposal')));

    app.use('/api/keys', api.keys);

    app.get('/', function(req,res) {
        res.sendFile(path.resolve('./public/views/index.html'));
    });

    app.get('/proposal', function(req,res) {
        res.sendFile(path.resolve('./proposal/views/index.html'));
    });

    return app;

};
