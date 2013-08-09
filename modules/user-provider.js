var Phantom = require('phantom'),
    Redis = require('redis').createClient();


/**
 * Return short user info.
 *
 * @param {String} username
 * @param {Function} cb
 * @api private
 */
exports.getShortInfo = function(username, cb) {
  _getUserInfo(username, 'short', function(err, data) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, data);
    }
  });
};

/**
 * Return full user info.
 *
 * @param {String} username
 * @param {Function} cb
 * @api private
 */
exports.getFullInfo = function(username, cb) {
  _getUserInfo(username, 'full', function(err, data) {
    if(err) {
      cb(err, null);
    } else {
      cb(null, data);
    }
  });
};

/**
 * Get user info from DB.
 *
 * @param {String} username
 * @param {String} type
 */
function _getUserInfo(username, type, cb) {
  Redis.hmget(username, type, function(err, data) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, JSON.parse(data[0]));
    }
  });
}

