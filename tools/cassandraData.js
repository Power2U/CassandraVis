const cassandra = require('cassandra-driver');

var database = require('../config/database');

const client = new cassandra.Client({
    contactPoints: [database.cassandra.url],
    keyspace: database.cassandra.keyspace
});
client.connect(function(err) {
    //if (err) throw err;
    //DEV_MODE:
    if (err) console.log("***ERROR*** \n Could not Connect to Cassandra \n" + err);

});

function ntos(n) {
    return n > 9 ? "" + n : "0" + n;
}

//<<<<<<< HEAD
module.exports.getData = function(req, res, params) {
    var parameters = params.split(",");
    var apartmentID = "'" + parameters[0] + "'";
    var viewMode = parameters[1];
    var dateFrom = parameters[2];
    var dateTo = parameters[3];
    console.log("Parameters :" + parameters);
    console.log("SELECT * FROM " + viewMode + " WHERE");
                //var dateStart = "'2015-" + ntos(curMonth) + "-01'";
                //var dateEnd = "'2015-" + ntos(++curMonth) + "-01'";
    client.execute("SELECT * FROM " + viewMode + " WHERE id=" + apartmentID + " AND ts>='" + dateFrom + "' AND ts<='" + dateTo + "'", function(err, result) {
//                client.execute("SELECT * FROM " + viewMode + " WHERE id=" + apartmentID + " AND ts='2015-06-01'", function(err, result) {
                    if (!err) {
                        if (result.rows.length > 0) {
                            console.log("Data accessed sucessfuly");
                            console.log(result.rows);
                            //console.log(" ***** Data IS: ****** \n" + result.rows[0].id);
                            res.json(result)
                        } else {
                            console.log("No results");
                        }
                    } else {
                        //throw (err)
                        console.log("Could not retrieve data. Check database connection");
                    }
                });
}
//||||||| merged common ancestors
//=======
//module.exports.getData = function(req, res, params) {
//    var parameters = params.split(",");
//    var apartmentID = "'" + parameters[0] + "'";
//    var viewMode = parameters[1];
//    var curMonth = 1;
//    switch (viewMode) {
//        case 'monthly':
//            for (var curMonth = 1; curMonth <= 12; curMonth++) {
//                var dateStart = "'2015-" + ntos(curMonth) + "-01'";
//                var dateEnd = "'2015-" + ntos(++curMonth) + "-01'";
//                client.execute("SELECT * FROM data WHERE id=" + apartmentID + " AND ts > " + dateStart + " AND ts < " + dateEnd, function(err, result) {
//                    if (!err) {
//                        if (result.rows.length > 0) {
//                            console.log("Data accessed sucessfuly")
//                            res.json(result)
//                        } else {
//                            console.log("No results");
//                        }
//                    } else {
//                        throw (err)
//                    }
//                });
//            }
//>>>>>>> 2bd86114f2319e0ce73014a71128712f20819b79
//
//            break;
//        case 'weekly':
//            break;
//        default:
//    }
//
//<<<<<<< HEAD
module.exports.getApartmentsIDs = function(req, res) {
    client.execute("SELECT * FROM apartments", function(err, result) {
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