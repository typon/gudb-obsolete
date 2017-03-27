"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var program = require('commander');
var fs = require('fs');
const pty = require('pty.js');
const util = require('util');
const gdb_js_1 = require("gdb-js");
require("babel-polyfill");
const widgets_1 = require("./widgets");
const winston = require("winston");
const streams_1 = require("./streams");
const spawn = require('child_process').spawn;
exports.logger = new (winston.Logger)({
    transports: []
});
exports.logger.log('info', 'Instantiating main objects...');
function main(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const term = pty.spawn('bash', [], {
            name: 'tmp',
            cols: 80,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env
        });
        const termFD = term.pty;
        const gdbChildProcess = spawn('gdb', ['-i=mi', path, `--tty=${termFD}`]);
        let gdb = new gdb_js_1.GDB(gdbChildProcess);
        try {
            yield gdb.init();
        }
        catch (err) {
            console.log('Please ensure you gdb >= v7.3 installed');
            console.log('Please ensure you have "set startup-with-shell off" in your ~/.gdbinit if using macOS Sierra');
            console.log('Please ensure you have python >= 2.7 or python3 installed');
            console.log('Please ensure you done "pip install future" if using python2');
            process.exit(1);
        }
        let widgetsObj = new widgets_1.Widgets();
        let streamsObj = new streams_1.Streams(gdb, widgetsObj, term);
        streamsObj.subscribe_to_streams();
        widgetsObj._screen.render();
    });
}
function parse_input() {
    let pathValue;
    program
        .version('1.0')
        .usage('<path>')
        .arguments('<path>')
        .action(function (path) {
        pathValue = path;
    });
    program.parse(process.argv);
    if (typeof pathValue === 'undefined') {
        console.log('no path given!');
        program.help();
        process.exit(1);
    }
    if (!fs.existsSync(pathValue)) {
        console.log(`Path: [${pathValue}] is invalid!`);
        process.exit(1);
    }
    return pathValue;
}
const path = parse_input();
main(path);
process.on('uncaughtException', function (err) {
    exports.logger.info('Caught exception: ' + util.inspect(err));
});
