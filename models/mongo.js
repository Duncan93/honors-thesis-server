
var mongodb = require('mongodb');

// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname
var uri = process.env.MONGOLAB_URI;
var mongoDB; // The connected database

mongodb.MongoClient.connect(uri, function(err, db) {
  if (err) throw err;
  console.log("Connected correctly to server");
  // database is now set
  mongoDB = db;
});

// Create
exports.create = function(query, callback) {
  // insert a query into the specific collection
  mongoDB.collection('logs').insert(
    query,
    {safe: true},
    function(e, result) {
      if (e) {
        doError(e);
      }
      callback(result);
    });
}