const cassandra = require('cassandra-driver');

var database = require('../config/database'); 

const client = new cassandra.Client({ contactPoints: [database.cassandra.url], keyspace : database.cassandra.keyspace });
client.connect(function (err) {
  //if (err) throw err;
    //DEV_MODE:
    if (err) console.log("***ERROR*** \n Could not Connect to Cassandra \n" + err);
    
});



module.exports.getData = function (req, res, params) {

    
    
    client.execute("SELECT * FROM data WHERE id= '12109435EL' AND ts < '2015-04-01' AND ts > '2015-03-31'", function (err, result) {
               if (!err){
                   if ( result.rows.length > 0 ) {
                       console.log("Data accessed sucessfuly this")
                       res.json(result)
                   } else {
                       console.log("No results");
                   }
               }
        else {
            throw(err)
        }
           });
}

module.exports.getApartmentsIDs = function (req,res) {
    console.log("Appartment is here!!!!")
    client.execute("SELECT * FROM apartments", function (err, result) {
               if (!err){
                   if ( result.rows.length > 0 ) {
                       console.log("Appartments accessed sucessfuly");
                       console.log(result);
                       res.json(result)
                   } else {
                       console.log("No results");
                   }
               }
        else {
            throw(err)
        }
           });
}