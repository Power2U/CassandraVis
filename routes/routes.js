var Todo = require('../models/todo');
var Temperature = require('../models/temperature');
const cassandra = require('cassandra-driver');
var database = require('../config/database'); 

const client = new cassandra.Client({ contactPoints: [database.cassandra.url], keyspace : database.cassandra.keyspace });
client.connect(function (err) {
  //if (err) throw err;
    //DEV_MODE:
    if (err) console.log("***ERROR*** \n Could not Connect to Cassandra \n" + err);
    
});



module.exports = function(app) {

	// api ---------------------------------------------------------------------
	// get all todos
	app.get('/api/todos', function(req, res) {

		// use mongoose to get all todos in the database
		Todo.find(function(err, todos) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)

			res.json(todos); // return all todos in JSON format
		});
	});

	// create todo and send back all todos after creation
	app.post('/api/todos', function(req, res) {

		// create a todo, information comes from AJAX request from Angular
		Todo.create({
			text : req.body.text,
			done : false
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			Todo.find(function(err, todos) {
				if (err)
					res.send(err)
				res.json(todos);
			});
		});

	});

	// delete a todo
	app.delete('/api/todos/:todo_id', function(req, res) {
		Todo.remove({
			_id : req.params.todo_id
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			Todo.find(function(err, todos) {
				if (err)
					res.send(err)
				res.json(todos);
			});
		});
	});

	//TODO: these are test purpose methods. Deal with them later

	app.get('/api/temperatures', function(req, res) {

		// use mongoose to get all todos in the database
		Temperature.find(function(err, temperatures) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)
			res.json(temperatures); // return all todos in JSON format
		});
	});

	app.get('/api/randomise', function(req, res) {
		for (var i = 0; i < 100; i++) {
			Temperature.create({
				value : Math.round(Math.random() * 100),
				hour : Math.round(Math.random() * 24)
			}, function(err, todo) {
				if (err)
					res.send(err);
			});
		}
	});
    
    app.get('/api/getcassandradata', function(req, res) {
        client.execute("SELECT * FROM data", function (err, result) {
               if (!err){
                   if ( result.rows.length > 0 ) {
                       console.log("Data accessed sucessfuly")
                       res.json(result)
                   } else {
                       console.log("No results");
                   }
               }
        else {
            throw(err)
        }
           });
	});
    
     app.get('/api/getcassandradata', function(req, res) {
        client.execute("SELECT * FROM data", function (err, result) {
               if (!err){
                   if ( result.rows.length > 0 ) {
                       console.log("Data accessed sucessfuly")
                       res.json(result)
                   } else {
                       console.log("No results");
                   }
               }
        else {
            throw(err)
        }
           });
	});
 	// ------------------------------------- END TODO ----------------------- 
	// a
	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		//res.sendFile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
		res.sendFile('index.html', { root: path.join(__dirname, '../public') });
	});
};
