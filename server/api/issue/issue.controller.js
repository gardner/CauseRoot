'use strict';

var _ = require('lodash');
var Issue = require('./issue.model');
var request = require('request');
request.debug = true;

var endpoint = 'http://localhost:7474/db/data';

// set stream true by default
//request = request.defaults({ headers: {'X-Stream': true, 'Content-Type': 'application/json', 'Accept': 'application/json' }});

// CREATE CONSTRAINT ON (issue:Issue) ASSERT issue.title IS UNIQUE

function getReq(uri, q, method) {
  method = method || 'GET';
  q = q || {};

  return {
    url: endpoint + uri,
    method: method,
    headers: {
        'X-Stream': true,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(q)
  }
}

function runStatement(statement, callback) {
  var r = getReq('/transaction/commit/', { statements: [ { statement: statement } ] }, 'POST');
  request(r, function(err,res,body) {
    if(err) { return handleError(res, err); }
    console.log(body);
    return callback(err,res,body);
  });
}

// Get list of issues
exports.index = function(req, res) {  
  runStatement('MATCH (issues:Issue) RETURN issues', function(err,httpResponse,body) {
    var data = JSON.parse(body);
    var issues = [];
    data.results[0].data.forEach(function(n) {
      var issue = {
        title: n.row[0].title,
      };
      issues.push(issue);
    });  
    return res.json(200, issues);
  });
};

// Get a single issue
exports.show = function(req, res) {
  Issue.findById(req.params.id, function (err, issue) {
    if(err) { return handleError(res, err); }
    if(!issue) { return res.send(404); }
    return res.json(issue);
  });
};

// Creates a new issue in the DB.
exports.create = function(req, res) {
  // whitelist properties
  var title = req.body.title;
  runStatement('CREATE (issue:Issue { title : \'' + title + '\' }) RETURN issue', function(err,httpResponse,body) {
    if(err) { return handleError(res, err); }
    var data = JSON.parse(body);
    return res.json(201, data.results[0].data[0].row[0]);
  });
};

// Updates an existing issue in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Issue.findById(req.params.id, function (err, issue) {
    if (err) { return handleError(res, err); }
    if(!issue) { return res.send(404); }
    var updated = _.merge(issue, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, issue);
    });
  });
};

// Deletes a issue from the DB.
exports.destroy = function(req, res) {
  Issue.findById(req.params.id, function (err, issue) {
    if(err) { return handleError(res, err); }
    if(!issue) { return res.send(404); }
    issue.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}