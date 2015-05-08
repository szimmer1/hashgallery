var fs = require('fs');
var path = require('path');

module.exports = {
    keys : function(req, res, next) {
        fs.readFile(path.resolve('./keys.json'), function(err, data) {
            if (err) throw err;
            else {
                res.json(data.toString())
            }
            next();
        })
    }
}
