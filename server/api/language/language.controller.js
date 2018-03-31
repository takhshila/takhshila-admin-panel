'use strict';

var _ = require('lodash');
var Language = require('./language.model');

// Get list of languages
exports.index = function(req, res) {
  Language.find(function (err, languages) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(languages);
  });
};

// Get a single language
exports.show = function(req, res) {
  Language.findById(req.params.id, function (err, language) {
    if(err) { return handleError(res, err); }
    if(!language) { return res.status(404).send('Not Found'); }
    return res.json(language);
  });
};

// Search for language
exports.search = function(req, res) {
  var queryObject = {}
  
  if(req.query.name === undefined){ return res.status(400).json("Invalid request"); }

  queryObject.name = new RegExp(req.query.name, "i");

  Language.find(queryObject, function(err, languageList){
    if(err){ return handleError(res, err) }
    return res.status(200).json(languageList);
  });
};

// Creates a new language in the DB.
exports.create = function(req, res) {
  Language.create(req.body, function(err, language) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(language);
  });
};

// Updates an existing language in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Language.findById(req.params.id, function (err, language) {
    if (err) { return handleError(res, err); }
    if(!language) { return res.status(404).send('Not Found'); }
    var updated = _.merge(language, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(language);
    });
  });
};

// Deletes a language from the DB.
exports.destroy = function(req, res) {
  Language.findById(req.params.id, function (err, language) {
    if(err) { return handleError(res, err); }
    if(!language) { return res.status(404).send('Not Found'); }
    language.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}