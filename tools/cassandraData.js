const cassandra = require('cassandra-driver');

var database = require('../config/database');

const client = new cassandra.Client({
    contactPoints: [database.cassandra.url],
    keyspace: database.cassandra.keyspace
});
client.connect(function (err) {
    if (err) console.log("***ERROR*** \n Could not Connect to Cassandra \n" + err);
});

function ntos(n) {
    return n > 9 ? "" + n : "0" + n;
}

//<<<<<<< HEAD
module.exports.getData = function (req, res, params) {
    //splitting the request string in ','. Parameters go like this: ApartmentID + ViewMode (monthly, daily...) + dateFrom + dateTo
    var parameters = params.split(",");
    var apartmentID = "'" + parameters[0] + "'";
    var viewMode = parameters[1];
    var dateFrom = parameters[2];
    var dateTo = parameters[3];
    //    console.log("Parameters :" + parameters);
    //    console.log("SELECT * FROM " + viewMode + " WHERE");

    //send query to cassandra database.
    client.execute("SELECT * FROM " + viewMode + " WHERE id=" + apartmentID + " AND ts>='" + dateFrom + "' AND ts<='" + dateTo + "'", function (err, result) {
        if (!err) {
            if (result.rows.length > 0) {
                console.log("Data accessed sucessfuly");
                //console.log(result.rows);
                //console.log(" ***** Data IS: ****** \n" + result.rows[0].id);
                //Pass the result to the front end.
                res.json(result)
            } else {
                console.log("No results");
            }
        } else {
            //throw (err)
            console.log("Could not retrieve data. Check database connection");
            console.log("*** ERROR ***: \n " + err);
        }
    });
}
module.exports.getApartmentsIDs = function (req, res) {
    client.execute("SELECT * FROM apartments", function (err, result) {
        if (!err) {
            if (result.rows.length > 0) {
                console.log("Apartments accessed sucessfuly");
                res.json(result)
            } else {
                console.log("No Apartments results");
            }
        } else {
            //throw (err);
            console.log("Could not retrieve data. Check database connection");
        }
    });
}
