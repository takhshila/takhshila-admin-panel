/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Bank = require('./bank.model');

exports.register = function(socket) {
  Bank.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Bank.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('bank:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('bank:remove', doc);
}