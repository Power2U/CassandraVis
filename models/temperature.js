var mongoose = require('mongoose');

module.exports = mongoose.model('Temperature', {
	value : String,
	hour : Number,
	date : {type: Date, default: Date.now}
});
