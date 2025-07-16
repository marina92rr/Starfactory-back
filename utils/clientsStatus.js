
const mongoose = require('mongoose')


function isActive(dateCancellation) {
  return dateCancellation === null;
}

function isCancelled(dateCancellation) {
  if (!dateCancellation) return false;
  const today = new Date().setHours(0, 0, 0, 0);
  const cancelDate = new Date(dateCancellation).setHours(0, 0, 0, 0);
  return cancelDate <= today;
}

function isScheduledCancellation(dateCancellation) {
  if (!dateCancellation) return false;
  const today = new Date().setHours(0, 0, 0, 0);
  const cancelDate = new Date(dateCancellation).setHours(0, 0, 0, 0);
  return cancelDate > today;
}

module.exports = {
    isActive,
    isCancelled,
    isScheduledCancellation
    };