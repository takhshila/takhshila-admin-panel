'use strict';

var _ = require('lodash');
var Company = require('./company.model');

// Get list of companys
exports.index = function(req, res) {
  Company.find(function (err, companys) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(companys);
  });
};

// Search for companys
exports.search = function(req, res) {
  var queryObject = {}
  if(!req.query){ return res.status(400).json("Invalid request"); }
  if(req.query.companyName !== undefined){
    queryObject.companyName = new RegExp(req.query.companyName, "i")
  }
  if(req.query.countryCode !== undefined){
    queryObject.countryCode = req.query.countryCode
  }
  if(req.query.state !== undefined){
    queryObject.state = new RegExp(req.query.state, "i")
  }
  Company.find(queryObject, function(err, companyList){
    if(err){ return handleError(res, err) }
    return res.status(200).json(companyList);
  })
};

// Get a single company
exports.show = function(req, res) {
  Company.findById(req.params.id, function (err, company) {
    if(err) { return handleError(res, err); }
    if(!company) { return res.status(404).send('Not Found'); }
    return res.json(company);
  });
};

// Creates a new company in the DB.
exports.create = function(req, res) {
  var userID = req.user._id;

  if(req.body._id) { delete req.body._id; }
  if(!req.body.companyName) { return handleError(res, 'Inavlid data'); }

  req.body.addedByID = userID;

  Company.findOne({
    companyName: req.body.companyName.toLowerCase()
  }, function(err, company){
    if(err) { return handleError(res, err) }
    if(!company){
      Company.create(req.body, function(err, addedCompany) {
        if(err) { return handleError(res, err); }
        return res.status(201).json(addedCompany);
      });
    }else{
      return res.status(201).json(company);
    }
  })
};

// Updates an existing company in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Company.findById(req.params.id, function (err, company) {
    if (err) { return handleError(res, err); }
    if(!company) { return res.status(404).send('Not Found'); }
    var updated = _.merge(company, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(company);
    });
  });
};

// Deletes a company from the DB.
exports.destroy = function(req, res) {
  Company.findById(req.params.id, function (err, company) {
    if(err) { return handleError(res, err); }
    if(!company) { return res.status(404).send('Not Found'); }
    company.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}