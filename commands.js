const debug    = require( 'debug' )( "commands:debug" );
const error    = require( 'debug' )( "commands:error" );
const server = require( './instance' );

const instanceName = process.env.INSTANCE_NAME;
const instanceZone = process.env.INSTANCE_ZONE;

module.exports = {
    startCommand,
    helpCommand,
    authCommand,
    runCommand,
    stopCommand,
    statusCommand
};

function startCommand( ctx ) {
    debug( 'started:', ctx.from );
    if ( ctx.from.is_bot ) return;
    return ctx.reply( 'Welcome ' + ctx.from.username + '! You can start with /help' );
}

function helpCommand( ctx ) {
    if ( ctx.from.is_bot ) return;
    ctx.replyWithMarkdown( 'First, authenticate using `/auth PASSWORD` (with PASSWORD being your actual password)' );
    ctx.reply( 'Once authenticated, the commands are /run, /status and /stop' );
}

var authList = {};

function authCommand( ctx ) {
    if ( process.env.PASSWORD == "" || !process.env.PASSWORD )
        return ctx.reply( 'Bot is misconfigured, missing PASSWORD.' );
    ctx.reply( 'Checking password, one moment...' );
    if ( ctx.state.command.args[0] == process.env.PASSWORD ) {
        setTimeout( () => {
            authList[ctx.from.id] = true;
            ctx.reply( 'You are now authorized. The commands are /run, /status and /stop' );
        }, 5000 );
    } else {
        setTimeout( () => {
            ctx.reply( 'Wrong password!' );
        }, 5000 );
    }
}
function isAuthorized( from ) {
    return authList[from.id] == true;
}

function handleUnauthorized( ctx ) {
    ctx.reply( "You are not authorized. See /help" );
}

function runCommand( ctx ) {
    if ( ctx.from.is_bot ) return;
    if ( !isAuthorized( ctx.from ) ) return handleUnauthorized( ctx );
    ctx.reply( "Getting server status..." );
    server.describeInstance( instanceName, instanceZone ).then( instance => {
        debug( instance.status );
        if ( instance.isRunning() ) {
            ctx.reply( "Instance already running. Use /status to get IP." );
        } else if ( instance.isTerminated() ) {
            ctx.reply( "Server starting... Please wait..." );
            return server.startInstance( instanceName, instanceZone ).then( () => {
                return server.describeInstance( instanceName, instanceZone );
            }).then( instance => {
                debug( instance.status );
                let ip = instance.ip;
                ctx.replyWithMarkdown(
                    "Instance running. You can connect using the IP `" + ip + "`\n"+
                    "When your done, you can use /stop to stop the instance."
                );
            });
        } else {
            ctx.reply( "Server cannot be started, current status is: " + instance.status );
        }
    }).catch( handleError( ctx ) );
}

function statusCommand( ctx ) {
    if ( ctx.from.is_bot ) return;
    if ( !isAuthorized( ctx.from ) ) return handleUnauthorized( ctx );
    ctx.reply( "Getting server status..." );
    server.describeInstance( instanceName, instanceZone ).then( instance => {
        debug( instance.status );
        if ( instance.isTerminated() ) {
            ctx.reply( "Not Running. Type /run to start the instance." );
        } else if ( instance.isRunning() ) {
            let ip = instance.ip;
            ctx.replyWithMarkdown(
                "Instance running. You can connect using the IP `" + ip + "`\n" +
                "When your done, you can use /stop to stop the instance."
            );
        } else {
            ctx.reply( "Unknown status: " + instance.status );
        }
    }).catch( handleError( ctx ) );
}

function stopCommand( ctx ) {
    if ( ctx.from.is_bot ) return;
    if ( !isAuthorized( ctx.from ) ) return handleUnauthorized( ctx );
    ctx.reply( "Getting server status..." );
    server.describeInstance( instanceName, instanceZone ).then( instance => {
        debug( instance.status );
        if ( instance.isRunning() ) {
            ctx.reply( "Server stopping... Please wait..." );
            return server.stopInstance( instanceName, instanceZone ).then( () => {
                ctx.reply( "Server is now stopped. Thank you!" );
            });
        } else {
            ctx.reply( "Server cannot be stopped, current status is: " + instance.status );
        }
    }).catch( handleError( ctx ) );
}

function handleError( ctx ) {
    return function( err ) {
        error( err );
        ctx.reply( "An error occured." );
    };
}
