/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Countries = require('./countries.model');

exports.register = function(socket) {
  Countries.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Countries.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('countries:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('countries:remove', doc);
}