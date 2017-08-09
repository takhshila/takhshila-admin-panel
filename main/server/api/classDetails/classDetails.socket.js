/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var ClassDetails = require('./classDetails.model');

exports.register = function(socket) {
  ClassDetails.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  ClassDetails.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('classDetails:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('classDetails:remove', doc);
}