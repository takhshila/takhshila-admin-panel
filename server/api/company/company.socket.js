/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Company = require('./company.model');

exports.register = function(socket) {
  Company.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Company.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('company:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('company:remove', doc);
}