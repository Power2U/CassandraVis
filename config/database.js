// Here we define the variables required for the current configuration.
module.exports = {
    mongodb: {
        url: 'mongodb://rustam:qwerty@ds011870.mlab.com:11870/passportusers'
    },
    cassandra: {
        url: 'ec2-52-31-85-51.eu-west-1.compute.amazonaws.com',
        keyspace: 'test'
    }
}
