const debug    = require( 'debug' )( "instance:debug" );
const error    = require( 'debug' )( "instance:error" );
const spawn     = require( 'child_process' ).spawn;
const projectId = process.env.PROJECT_ID;

module.exports = {
    stopInstance,
    startInstance,
    describeInstance
};

const commandPrefix = "gcloud --project " + projectId + " compute instances";

function stopInstance( instanceName, zone ) {
    let command = commandPrefix + " stop " + instanceName + " --zone " + zone;
    return spawnPromise( command );
}

function startInstance( instanceName, zone ) {
    let command = commandPrefix + " start " + instanceName + " --zone " + zone;
    return spawnPromise( command );
}

function describeInstance( instanceName, zone ) {
    let command = commandPrefix + " describe " + instanceName +
        " --zone " + zone +
        " --format=json";
    return spawnPromise( command ).then( result => {
        let json = result.stdout;
        let payload = JSON.parse( json );
        let instance = {
            ip: payload.networkInterfaces[0].accessConfigs[0].natIP,
            status: payload.status,
            isRunning() {
                return this.status == "RUNNING";
            },
            isTerminated() {
                return this.status == "TERMINATED";
            }
        };
        return instance;
    });
}

function spawnPromise() {
    var args = Array.from( arguments );
    if ( args.length == 1 && args[0].match( / / ) ) {
        args = args[0].split( / +/ );
        args = [args.shift(), args];
    }
    debug( args[0], args[1].join( " " ) );
    var stdout = "";
    return new Promise( ( resolve, reject ) => {
        var child = spawn.apply( null, args );
        if ( child.stdout ) {
            child.stdout.on( 'data', _stdout => {
                stdout += _stdout;
            });
        }
        if ( child.stderr ) {
            child.stderr.on( 'data', stderr => {
                error( stderr.toString() );
            });
        }
        child.on( 'exit', ( code, signal ) => {
            if ( code === 0 ) {
                resolve({stdout: stdout});
            } else {
                if ( code ) {
                    reject( new Error( "Exit: " + code ) );
                } else {
                    reject( new Error( "Signal: " + signal ) );
                }
            }
        });
        child.on( 'error', err => {
            reject( err );
        });
    });
}
