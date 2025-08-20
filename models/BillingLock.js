// models/BillingLock.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const BillingLockSchema = Schema({
  key: { type: String, required: true, unique: true }, // sub:{idSuscriptionClient}:{YYYY-MM}
  period: { type: String, required: true },            // 'YYYY-MM'
  idSuscriptionClient: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

//BillingLockSchema.index({ key: 1 }, { unique: true });

module.exports = model('BillingLock', BillingLockSchema)