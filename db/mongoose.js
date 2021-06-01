'use strict';

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:csc309@ds229373.mlab.com:29373/csc309-sweethome', { useNewUrlParser: true, useCreateIndex: true});

module.exports = {mongoose};
