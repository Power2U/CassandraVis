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

module.exports.getData = function(req, res, params) {
    var parameters = params.split(",");
    var apartmentID = "'" + parameters[0] + "'";
    var viewMode = parameters[1];
    console.log("**** View Mode:" + viewMode);
    var curMonth = 1;
    switch (viewMode) {
        case 'monthly':
                //var dateStart = "'2015-" + ntos(curMonth) + "-01'";
                //var dateEnd = "'2015-" + ntos(++curMonth) + "-01'";
                client.execute("SELECT * FROM monthly WHERE id=" + apartmentID , function(err, result) {
                    if (!err) {
                        if (result.rows.length > 0) {
                            console.log("Data accessed sucessfuly");
                            //console.log(apartmentID);
                            //console.log(" ***** Data IS: ****** \n" + result.rows[0].id);
                            res.json(result)
                        } else {
                            console.log("No results");
                        }
                    } else {
                        throw (err)
                    }
                });

            break;
        case 'weekly':
            break;
        default:
    }


    //console.log("Current month: " + dateStart) + "End Date: " + dateEnd;
    //
    //    client.execute("SELECT * FROM data WHERE id=" + apartmentID + " AND ts > " + dateStart + " AND ts < " + dateEnd, function (err, result) {
    //               if (!err){
    //                   if ( result.rows.length > 0 ) {
    //                       console.log("Data accessed sucessfuly")
    //                       res.json(result)
    //                   } else {
    //                       console.log("No results");
    //                   }
    //               }
    //        else {
    //            throw(err)
    //        }
    //           });
}

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
            throw (err)
        }
    });
}