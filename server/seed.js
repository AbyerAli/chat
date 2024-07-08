const mongoose = require('mongoose');
const srvConfig = require('./config');
const db = mongoose.connection;
const {DB_HOST} = srvConfig;
require('./database/model/users');
const Users = mongoose.model('Users');

mongoose.connect(DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    return seedUsers();
}).catch(err => {
    console.log(err);
}).then(() => {
    console.log('Database successfully seeded!')
    db.close();
});

async function seedUsers() {
    await Users.deleteMany();
    await Users.insertMany([
        {   
            "name": "John Doe",
            "username": "john",
            "password": "$2a$10$KPtehsbArEr3XlIbNOOHOu7/N4s6ha31ZZ2jDngQ.jvFToDs5mNdO" //password123
        },
        {
            "name": "Jane Roe",
            "username": "jane",
            "password": "$2a$10$M8R.EalzDPC.ZNz4K.SqMO87KQp0Paq3Qv9xyTG6LHJobNyViWFHi" //securepassword1
        },
    ])
}
