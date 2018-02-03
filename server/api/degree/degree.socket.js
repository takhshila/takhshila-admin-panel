/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Degree = require('./degree.model');

exports.register = function(socket) {
  Degree.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Degree.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('degree:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('degree:remove', doc);
}