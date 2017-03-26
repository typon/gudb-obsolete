const pty = require('pty.js');
const util = require('util');
import { GDB } from 'gdb-js'
import * as Bacon from 'baconjs';
import 'babel-polyfill';
import { Widgets } from "./widgets";
import * as winston from 'winston';
import { Streams } from "./streams";
import * as utils from "./utils";
const spawn = require('child_process').spawn;

////////////////////////////
// Initialize global objects.
////////////////////////////
export let logger = new (winston.Logger)({
transports: [
new (winston.transports.File)({ filename: 'debug.log', timestamp: false})
]
});
logger.log('info', 'Instantiating main objects...');



async function main () {
    // TODO: This only works with gdb > 7.7.
    //await gdb.enableAsync();
    
    // Instantiating a terminal to store program output
    const term = pty.spawn('bash', [], {
      name: 'tmp',
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env
    })
    const termFD = term.pty

    // Initialize gdb child process and gdb-js object.
    const gdbChildProcess = spawn('gdb', ['-i=mi', '../sample_program/main', `--tty=${termFD}`]);
    let gdb = new GDB(gdbChildProcess);
    await gdb.init();

    // Render main screen
    let widgetsObj = new Widgets();
    
    // To register all the streams.
    let streamsObj = new Streams(gdb, widgetsObj, term);
    streamsObj.subscribe_to_streams();

    widgetsObj._screen.render();
}
main();
// TODO: Parse arguments such a as program name.
process.on('uncaughtException', function (err: any) {
  logger.info('Caught exception: ' + util.inspect(err))
});
