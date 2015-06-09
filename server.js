var path = require('path'),
    app = require(path.resolve('./config/express.js'))(),
    _ = require('underscore');

var port = process.argv[2] || 4000;
port = process.env.NODE_ENV == 'development' ? port : 80;

app.listen(port);
console.log('server running on port ' + port);

exports = module.exports = app;