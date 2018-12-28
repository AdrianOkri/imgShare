const express = require('express');
const config = require('./server/config');

require('./database'); // DB Address
const app = config(express()); // Init port

app.listen(app.get('port'), () => { // Starting the server
    console.log('Server on port', app.get('port'));
})