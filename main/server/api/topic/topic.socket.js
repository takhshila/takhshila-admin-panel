/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Topic = require('./topic.model');

exports.register = function(socket) {
  Topic.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Topic.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('topic:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('topic:remove', doc);
}