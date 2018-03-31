/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Transactionhistory = require('./transactionhistory.model');

exports.register = function(socket) {
  Transactionhistory.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Transactionhistory.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('transactionhistory:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('transactionhistory:remove', doc);
}