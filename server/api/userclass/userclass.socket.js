/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Userclass = require('./userclass.model');

exports.register = function(socket) {
  Userclass.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Userclass.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('userclass:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('userclass:remove', doc);
}