const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['summary', 'document'], required: true },

    title: { type: String, required: true },

    fileUrl: { type: String, required: true },

    referenceId: { type: String },   // summaries only (e.g. PCH-260904-AB12)
    docType: { type: String },       // documents only (e.g. "Kidney imaging report")
    fileName: { type: String },      // documents only (original upload filename)
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);