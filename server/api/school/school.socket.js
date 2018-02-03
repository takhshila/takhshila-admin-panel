/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var School = require('./school.model');

exports.register = function(socket) {
  School.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  School.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('school:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('school:remove', doc);
}