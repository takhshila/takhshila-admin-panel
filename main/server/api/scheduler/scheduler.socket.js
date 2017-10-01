/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Scheduler = require('./scheduler.model');

exports.register = function(socket) {
  Scheduler.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Scheduler.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('scheduler:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('scheduler:remove', doc);
}