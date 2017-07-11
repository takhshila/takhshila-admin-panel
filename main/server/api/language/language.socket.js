/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Language = require('./language.model');

exports.register = function(socket) {
  Language.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Language.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('language:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('language:remove', doc);
}