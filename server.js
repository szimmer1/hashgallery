var path = require('path'),
    app = require(path.resolve('./config/express.js'))(),
    _ = require('underscore');

var port = process.env.NODE_ENV == 'development' ? 3000 : 80;

app.listen(port);
console.log('server running on port ' + port);

exports = module.exports = app;
