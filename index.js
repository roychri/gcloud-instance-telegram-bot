const Telegraf  = require( 'telegraf' );
const commands  = require( './commands' );

const bot = new Telegraf( process.env.BOT_TOKEN );
bot.start( commands.startCommand );
bot.use( require( './commandArgs' )() );
bot.command( 'help', commands.helpCommand );
bot.command( 'auth', commands.authCommand );
bot.command( 'run', commands.runCommand );
bot.command( 'stop', commands.stopCommand );
bot.command( 'status', commands.statusCommand );

bot.startPolling();

require( './healthz' );
