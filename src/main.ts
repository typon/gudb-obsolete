const pty = require('pty.js');
const util = require('util');
import { GDB } from 'gdb-js'
import * as Bacon from 'baconjs';
import 'babel-polyfill';
import { Widgets } from "./widgets";
import * as winston from 'winston';
//import { _screen } from "./widgets";
//import { inputBox } from "./widgets";
//import { historyBox } from "./widgets";
//import { container } from "./widgets";
//import { CommandPanelWidgets } from "./widgets";
import { Streams } from "./streams";
import * as utils from "./utils";
import * as cbs from "./callbacks";
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

// Instantiating a terminal to store program output
export const term = pty.spawn('bash', [], {
  name: 'tmp',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
})
const termFD = term.pty


// Instantiating gdb process
export const gdbChildProcess = spawn('gdb', ['-i=mi', '../sample_program/main', `--tty=${termFD}`]);
export let gdb = new GDB(gdbChildProcess);


async function main () {
    await gdb.init();
    // TODO: This only works with gdb > 7.7.
    //await gdb.enableAsync();

    // Initialize Autocomplete object with empty list.

    //utils.update_command_widget_sizes(CommandPanelWidgets);

    //historyBox.clearLine(0);
    //_screen.key('q', cbs.handle_key_Q);
    //_screen.key('t', cbs.handle_key_T);
    //_screen.key('i', cbs.handle_key_I);
    //inputBox.key('up', cbs.handle_key_upArrow);
    //inputBox.key('down', cbs.handle_key_downArrow);
    //inputBox.on('submit', cbs.handle_inputBox_submit);
    //inputBox.on('cancel', cbs.handle_inputBox_cancel);
    //inputBox.on('keypress', cbs.handle_key_ALL);
    //container.on('resize', (data) => {utils.update_command_widget_sizes(CommandPanelWidgets)});
    
    //_screen.on('resize', utils.updateCommandWidgetSizes(CommandPanelWidgets, _screen));

    // GDB callbacks
    //gdb.targetStream.on('data', cbs.handle_program_output);
    //gdb.consoleStream.on('data', cbs.handle_gdb_output);
    //gdb.on('stopped', cbs.handle_gdb_stopped);

    //gdb.on('running', cbs.handle_gdb_running);

    // All event streams defined here, created from various
    // events in the program.
    // Two sources of events: gdb, user input.

    //s_gdb_program_out = Bacon.fromEvent(gdb.targetStream, "data");
    //s_gdb_console_out = Bacon.fromEvent(gdb.consoleStream, "data");
    //s_gdb_stopped = Bacon.fromEvent(gdb, "stopped");
    //s_gdb_running = Bacon.fromEvent(gdb, "running");


    // Render main screen
    let widgetsObj = new Widgets(gdb);
    //widgetsObj._inputBox.on('submit', cbs.handle_inputBox_submit);
    
    // To register all the streams.
    let streamsObj = new Streams(gdb, widgetsObj);
    streamsObj.subscribe_to_streams();

    widgetsObj._screen.render();
    //_screen.render();
}
main();
process.on('uncaughtException', function (err) {
  logger.info('Caught exception: ' + util.inspect(err))
});
