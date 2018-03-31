/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var BankAccount = require('./bankAccount.model');

exports.register = function(socket) {
  BankAccount.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  BankAccount.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('bankAccount:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('bankAccount:remove', doc);
}