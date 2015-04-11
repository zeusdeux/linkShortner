var express = require('express');
var router = express.Router();
var u = require('../utils');
var d = require('debug')('linkShortner:routes');
var isUrl = require('valid-url').is_http_uri;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'short.ly'
  });
});

router.post('/shorten', function(req, res, next) {
  d('/shorten: body', req.body);
  if (isUrl(req.body.inputUrl)) {
    u.getNewIdAndPersistObj(function(err, obj) {
      if (err) next(err);
      else res.json({
        id: obj.id,
        useCount: obj.useCount
      });
    }, req.body.inputUrl);
  }
  else {
    res.status(500).send('Invalid url');
  }
});

router.get('/:id', function(req, res, next) {
  d('/:id: id', req.params.id);

  u.updateAndPersistExisting(function(err, url) {
    if (err) next(err);
    else res.redirect(302, url);
  }, req.params.id);
});

module.exports = router;
