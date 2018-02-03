/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Wallet = require('./wallet.model');

exports.register = function(socket) {
  Wallet.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Wallet.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('wallet:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('wallet:remove', doc);
}