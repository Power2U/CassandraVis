var mongoose = require('mongoose');

module.exports = mongoose.model('Temperature', {
	value : String,
	date : {type: Date, default: Date.now}
});
