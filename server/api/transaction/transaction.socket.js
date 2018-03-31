/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Transaction = require('./transaction.model');

exports.register = function(socket) {
  Transaction.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Transaction.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('transaction:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('transaction:remove', doc);
}