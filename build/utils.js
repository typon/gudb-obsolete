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
const util = require('util');
const _ = require("lodash");
const cts = require("./constants");
const main_1 = require("./main");
const constants_1 = require("./constants");
function empty_or_template(obj, tmpl) {
    const result = _.isEmpty(obj) ? '' : tmpl(obj);
    return result;
}
exports.empty_or_template = empty_or_template;
function contains(arr, item) {
    return arr.indexOf(item) > -1;
}
exports.contains = contains;
function isMultiCommand(cmd) {
    const cmdFirst = _.trim(_.first(_.split(cmd, ' ', 1)));
    const result = contains(_.keys(cts.multiCmds), cmdFirst);
    return result;
}
exports.isMultiCommand = isMultiCommand;
function is_mi_cmd(cmd) {
    return (cmd in cts.multiCmds);
}
exports.is_mi_cmd = is_mi_cmd;
function nth_clamped(arr, n) {
    let item;
    if (n >= arr.length) {
        item = _.last(arr);
    }
    else if (n < 0) {
        item = _.first(arr);
    }
    else {
        item = arr[n];
    }
    return item;
}
exports.nth_clamped = nth_clamped;
function clamped_op(num, operand, op, upperLimit, lowerLimit = 0) {
    let result = op(num, operand);
    if (result > upperLimit)
        result = upperLimit;
    else if (result < lowerLimit)
        result = lowerLimit;
    return result;
}
exports.clamped_op = clamped_op;
function exec_gdb_command(gdbObj, { state, cmdStr }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (['q', 'quit'].indexOf(cmdStr) > -1) {
            return 'quitting';
        }
        let result = '';
        main_1.logger.info(`Running MI:  ${util.inspect(cmdStr)}. State: ${state}`);
        if (state == constants_1.CMDState.Final) {
            result = yield gdbObj.execMI(cmdStr);
        }
        else {
            gdbObj.execMInor(cmdStr);
        }
        main_1.logger.info('Result: ' + util.inspect(result, { depth: 12 }));
        return result;
    });
}
exports.exec_gdb_command = exec_gdb_command;
function get_current_file_info(gdbObj) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let stack = yield gdbObj.callstack();
            let fileInfo = new CurrentLineInfo(stack[0].file, stack[0].line);
            return fileInfo;
        }
        catch (err) {
            return null;
        }
    });
}
exports.get_current_file_info = get_current_file_info;
function get_breakpoint_info(gdbObj) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let stack = yield gdbObj.callstack();
            let fileInfo = new CurrentLineInfo(stack[0].file, stack[0].line);
            return fileInfo;
        }
        catch (err) {
            return null;
        }
    });
}
exports.get_breakpoint_info = get_breakpoint_info;
function is_alphanum(key) {
    let regExp = /^[_A-Za-z0-9]$/;
    return (key.match(regExp));
}
exports.is_alphanum = is_alphanum;
class CurrentLineInfo {
    constructor(file, line) {
        this.file = file;
        this.line = line;
    }
}
exports.CurrentLineInfo = CurrentLineInfo;
class HasCallbacks {
    constructor() {
        var _this = this, _constructor = this.constructor;
        if (!_constructor.__cb__) {
            _constructor.__cb__ = {};
            for (var m in this) {
                var fn = this[m];
                if (typeof fn === 'function' && m.indexOf('cb_') == 0) {
                    _constructor.__cb__[m] = fn;
                }
            }
        }
        for (let m in _constructor.__cb__) {
            (function (m, fn) {
                _this[m] = function () {
                    return fn.apply(_this, Array.prototype.slice.call(arguments));
                };
            })(m, _constructor.__cb__[m]);
        }
    }
}
exports.HasCallbacks = HasCallbacks;
