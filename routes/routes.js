var cassandraData = require('../tools/cassandraData');

module.exports = function (app) {

    //TODO: these are test purpose methods. Deal with them later

    app.get('/api/temperatures', function (req, res) {

        // use mongoose to get all todos in the database
        Temperature.find(function (err, temperatures) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            res.json(temperatures); // return all todos in JSON format
        });
    });

    app.get('/api/randomise', function (req, res) {
        for (var i = 0; i < 100; i++) {
            Temperature.create({
                value: Math.round(Math.random() * 100),
                hour: Math.round(Math.random() * 24)
            }, function (err, todo) {
                if (err)
                    res.send(err);
            });
        }
    });
    // END of Test code.


    // Main route. 'viewMode' is sent as parameter into our database handler funciton.
    app.get('/api/getcassandradata/:viewMode', function (req, res) {
        cassandraData.getData(req, res, req.params.viewMode);
    });

    //Route that handles Get Apartments request
    app.get('/api/getapartmentsids', function (req, res) {
        console.log("We are getting request");
        cassandraData.getApartmentsIDs(req, res);
    });
    // Injects index.html on every request that is made to the Node.js server, apart from the ones mentioned above.
    app.get('*', function (req, res) {
        res.sendFile('index.html', {
            root: path.join(__dirname, '../public')
        });
    });
};
