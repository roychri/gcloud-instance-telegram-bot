const debug = require( 'debug' )( 'express:debug' );
const error = require( 'debug' )( 'express:error' );
const express = require( 'express' );
const app = express();
const port = process.env.PORT || 3000;
app.get( '/healthz', ( req, res ) => {
    res.send( 'OK' );
});

app.use( function ( err, req, res, next ) {
    error( err );
    res.status( 500 ).send( 'Something broke!' );
});

app.listen( port, err => {
    if ( err ) {
        return error( 'something bad happened', err );
    }

    debug( `server is listening on ${port}` );
});
