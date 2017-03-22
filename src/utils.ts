const util = require('util');
import * as _ from "lodash";

import { gdb } from "./main";
import * as cts from "./constants";
const Autocomplete = require('Autocomplete');
import { logger as lg} from "./main";
import {CMDState as CMDState} from "./constants";

export function empty_or_template(obj, tmpl){
    const result: string = _.isEmpty(obj) ? '' : tmpl(obj);
    return result
}
export function update_command_widget_sizes(CommandPanelWidgets) {

    let [container, historyBox, inputBox] = CommandPanelWidgets;
    const containerHeight = container.height;
    historyBox.height = containerHeight - cts.CommandPanelProps.inputBoxProps.height - 1;
}
export function contains(arr: any[], item) {
    return arr.indexOf(item) > -1
}
export function isMultiCommand(cmd: string) {
    //lg.info('ismulticmd: ' + cmd)
    const cmdFirst = _.trim(_.first(_.split(cmd, ' ', 1)))
    const result = contains(_.keys(cts.multiCmds), cmdFirst)
    return result
}
export function is_mi_cmd (cmd: string): boolean {
    return (cmd in cts.multiCmds)

}
/*
export function map_to_mi_cmd(cmd) {
    let resultCMD: string;
    //let cmdType: cts.Command = cts.Command.CLI

    lg.info('In map_to_mi_cmd: ' + util.inspect(cmd))
    //const cmdFirst = _.trim(_.first(_.split(cmd[2], ' ', 1)))
    
    if (cmd.state == CMDState.Int) {
        //const miCMD = cts.multiCmds[cmdName]
        resultCMD = _.trim(`${miCMD} ${cmdRest}`)
    } else {
        resultCMD = cmdNameAndRest
    }
    lg.info('Ending map_to_mi_cmd: ' + resultCMD)
    return resultCMD
}
*/



export function nth_clamped(arr: any[], n: number) {
    let item;
    if (n >= arr.length) {
        item = _.last(arr);
    } else if (n < 0) {
        item = _.first(arr);
    } else {
        item = arr[n];
    }
    return item;
}
export function clamped_op(num: number, operand: number, op, upperLimit: number, lowerLimit=0) {
    let result = op(num, operand);
    if (result > upperLimit) result = upperLimit;
    else if (result < lowerLimit) result = lowerLimit;
    return result;
}

export async function exec_gdb_command(gdbObj, {state, cmdStr}) {
    // The "quit" command should kill the program.
    if(['q', 'quit'].indexOf(cmdStr) > -1) {
        return 'quitting';
    }
    let result = '';
    lg.info(`Running MI:  ${util.inspect(cmdStr)}. State: ${state}`)

    if (state == CMDState.Final) {
        result = await gdbObj.execMI(cmdStr)
    } else {
        gdbObj.execMInor(cmdStr)
    }
    lg.info('Result: ' + util.inspect(result,{depth:12}))

    return result;
}

export async function get_current_file_info(gdbObj) {
    try {
        let stack = await gdbObj.callstack()
        let fileInfo = new CurrentLineInfo(stack[0].file, stack[0].line)
        return fileInfo;
    } catch(err) {
        return null;
    }

}
export async function get_breakpoint_info(gdbObj) {
    try {
        let stack = await gdbObj.callstack()
        let fileInfo = new CurrentLineInfo(stack[0].file, stack[0].line)
        return fileInfo;
    } catch(err) {
        return null;
    }

}

export function is_alphanum(key) {
  let regExp = /^[_A-Za-z0-9]$/
  return (key.match(regExp))
}

export class CurrentLineInfo {
    constructor(readonly file: string, readonly line: number) { 
    }
}
export class HasCallbacks {
    constructor() {
        var _this = this, _constructor = (<any>this).constructor;
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
