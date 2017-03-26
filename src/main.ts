var program = require('commander');
var fs = require('fs');
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



async function main (path) {
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
    const gdbChildProcess = spawn('gdb', ['-i=mi', path, `--tty=${termFD}`]);
    let gdb = new GDB(gdbChildProcess);
    await gdb.init();

    // Render main screen
    let widgetsObj = new Widgets();
    
    // To register all the streams.
    let streamsObj = new Streams(gdb, widgetsObj, term);
    streamsObj.subscribe_to_streams();

    widgetsObj._screen.render();
}

function parse_input() {
    let pathValue;
    program
      .version('1.0')
      .usage('<path>')
      .arguments('<path>')
      .action(function (path) {
         pathValue = path
      })
    program.parse(process.argv);

    if (typeof pathValue === 'undefined') {
       console.log('no path given!');
       program.help()
       process.exit(1);
    }
    if (!fs.existsSync(pathValue)) {
       console.log(`Path: [${pathValue}] is invalid!`);
       process.exit(1);
    }

    return pathValue
}
const path = parse_input()
main(path);
// TODO: Parse arguments such a as program name.
process.on('uncaughtException', function (err: any) {
  logger.info('Caught exception: ' + util.inspect(err))
});
