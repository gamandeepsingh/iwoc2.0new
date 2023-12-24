// Schema and Model for Admin

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    adminname: String,
    email: String,
    sessionid: String,
    hash: String,
    role: {
        type: String,
        enum: ['admin', 'member'],
        required: true
      }
});

const Admin = new mongoose.model('Admin', adminSchema);

module.exports = Admin;