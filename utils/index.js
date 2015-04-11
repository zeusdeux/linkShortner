var path     = require('path');
var base62   = require('base62');
var flatfile = require('flatfile');
var cfg      = require('../config');
var dbPath   = path.join(__dirname, '..', cfg.db);
var d        = require('debug')('linkShortner:utils');

/*
DB looks like this:
{
  id: {
    id: id
    url: 'http://omg.test.com',
    useCount: Int
  }
}
*/

function fixFlatFileEnumerablePropertiesBug(data) {
  Object.defineProperties(data, {
    '_filename': {
      enumerable: false
    },
    'save': {
      enumerable: false
    }
  });
  return data;
}

function getFromId(cb, id) {
  d('getFromId: args', arguments);
  flatfile.db(dbPath, function(err, data) {
    data = fixFlatFileEnumerablePropertiesBug(data);
    d('getFromId: err, data', err, data);
    if (err) return cb(err);
    else {
      if (data[id]) return cb(null, data[id]);
      else return cb(new Error('Did not find any url for that id'));
    }
  });
}

// getId :: (Maybe a -> Base62 -> IO ()) -> Maybe b
function getNewId(cb, url) {
  d('getNewId: args', arguments);
  flatfile.db(dbPath, function(err, data){
    if (err) return cb(err);
    else {
      data = fixFlatFileEnumerablePropertiesBug(data);
      // id is the length of db
      const temp = Object.keys(data);
      d('getNewId: db length', temp.length, temp);
      for (var i = 0; i < temp.length; i++) {
        var obj = data[temp[i]];

        d('getNewId: in loop. obj', data[temp[i]].url, url);
        if (obj.url === url) return cb(null, base62.encode(obj.id), obj.useCount);
      }
      return cb(null, base62.encode(temp.length + 1));
    }
  });
}

function persistIt(cb, obj) {
  d('persistIt: args', arguments);
  flatfile.db(dbPath, function(err, data){
    if (err) return cb(err);
    else {
      data = fixFlatFileEnumerablePropertiesBug(data);
      data[obj.id] = obj;
      data.save(cb);
    }
  });
}

exports.updateAndPersistExisting = function(cb, id) {
  d('updateAndPersistExisting: args', arguments);
  getFromId(function(err, obj){
    if (err) return cb(err);
    else {
      obj.useCount += 1;
      return persistIt(function(err) {
        return cb(err, obj.url);
      }, obj);
    }
  }, id);
}

exports.getNewIdAndPersistObj = function(cb, url){
  d('getNewIdAndPersistObj: args', arguments);
  getNewId(function(err, id, useCount) {
    d('getNewIdAndPersistObj: new id', id);
    if (err) return cb(err);
    else {
      const obj = {
        id: id,
        url: url,
        useCount: useCount || 0
      };

      persistIt(function(err) {
        return cb(err, obj);
      }, obj);
    }
  }, url);
};
