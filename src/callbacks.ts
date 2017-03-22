import * as _ from "lodash";
const util = require('util');

import { gdbChildProcess, gdb } from "./main";
import { _screen } from "./widgets";
import { errorMessage } from "./widgets";
import { inputBox } from "./widgets";
import { historyBox } from "./widgets";
import { outputBox } from "./widgets";
import { ac, get_log_lines_top_to_bottom, nth_clamped, clamped_op, num_lines, launch_gdb_command, redraw_sourceBox, get_current_frame } from "./utils";
import { HistoryBoxState, prefix } from "./constants";

let hboxNumLines = 0;

export let hboxState = {
    state: HistoryBoxState.Idle,
    lineNo: 0,
    keyword: '',
}
export let iboxState = {
    lastKey: '',
}
function reset_hboxState (hboxState) {
    //_screen.debug('resetting state');
    hboxState.state = HistoryBoxState.Idle;
    hboxState.lineNo = 0;
    hboxState.keyword = '';

    return hboxState;
}

/*
_screen.key('q', function() {
  _screen.destroy();
});
*/

export function handle_key_Q() {
  gdbChildProcess.kill();
  _screen.destroy();
}
export function handle_key_T() {
    historyBox.focus();
}
export function handle_key_I() {
    inputBox.clearValue();
    inputBox.render();

    inputBox.readInput(function() {});
}
export function handle_key_ALL(_ignore_, {name}) {
    //_screen.debug('Key:' + name + ' last: ' + iboxState.lastKey);
    //_screen.debug('State:' + hboxState.state+ ' last: ' + iboxState.lastKey);

    if (hboxState.state == HistoryBoxState.ScrollingCustomText) {
        if (iboxState.lastKey != "up" && iboxState.lastKey != "down") {
            hboxState.state = HistoryBoxState.ScrollingAll;
        }
    }
    // If the input box is empty, reset the state.
    const txt: string = inputBox.getValue();
    if (!txt) hboxState = reset_hboxState(hboxState);

    if (name == 'down' && iboxState.lastKey == 'up') {
        let upperLimit = num_lines(hboxState, historyBox);
        //_screen.debug('down');
        //_screen.debug(` limit: ${ upperLimit }`);
        //hboxState.lineNo = clamped_op(hboxState.lineNo, 1, _.subtract, getLogLinesBottomToTop(historyBox).length);
        hboxState.lineNo = clamped_op(hboxState.lineNo, 1, _.subtract, upperLimit);
        //hboxState.lineNo = hboxState.lineNo - 1;
    }
    if (name == 'up' && iboxState.lastKey == 'down') {
        let upperLimit = num_lines(hboxState, historyBox);
        //_screen.debug(` limit: ${ upperLimit }`);
        //_screen.debug(` ${ hboxState.lineNo}, ${ 1 }, ${ upperLimit }`);
        hboxState.lineNo = clamped_op(hboxState.lineNo, 1, _.add, upperLimit);
    }
    iboxState.lastKey = name;
}
export function handle_key_upArrow() {
    scrollInputBox('up');
    let upperLimit = num_lines(hboxState, historyBox);
    hboxState.lineNo = clamped_op(hboxState.lineNo, 1, _.add, upperLimit);
}
export function handle_key_downArrow() {
    let upperLimit = num_lines(hboxState, historyBox);
    hboxState.lineNo = clamped_op(hboxState.lineNo, 1, _.subtract, upperLimit);
    scrollInputBox('down');
}
export function scrollInputBox(key) {
    const txt: string = inputBox.getValue();
    //_screen.debug('State: ' + hboxState.state + ' , ' + hboxState.lineNo);
    //_screen.debug('Current text: ' + txt);
    // If there is some text in the box, try to autocomplete.
    if (txt && (hboxState.state == HistoryBoxState.Idle || hboxState.state == HistoryBoxState.ScrollingCustomText)) {
        hboxState.state = HistoryBoxState.ScrollingCustomText;
        if (!hboxState.keyword) {
            hboxState.keyword = inputBox.getValue();
        }

        const matches: string[] = ac.search(hboxState.keyword).reverse();
        //_screen.debug(matches);
        let line: string;
        line = nth_clamped(matches, hboxState.lineNo);

        //_screen.debug('Setting text custom: ' + line);
        inputBox.setValue(line);
        inputBox.render();
    } else {
        hboxState.state = HistoryBoxState.ScrollingAll
        const hboxLines: string[] = get_log_lines_top_to_bottom(historyBox)
        //_screen.debug('Contents of historyBox: ' + hboxLines);

        const numLines: number = hboxLines.length;
        //_screen.debug('Num Lines: ' + numLines);
        const line: string = nth_clamped(hboxLines, hboxState.lineNo);

        _screen.debug(line);
        //_screen.debug('Setting text all: ' + line);
        inputBox.setValue(line);
        inputBox.render();
    }

    //if (key == 'up') hboxState.lineNo = hboxState.lineNo + 1;
    //else if (key == 'down') hboxState.lineNo = hboxState.lineNo - 1;
}

/*_screen.key('t', function() {
    historyBox.focus();
});
*/
/*
_screen.key('i', function() {
  inputBox.readInput(function() {});
});
*/

/*_screen.key('e', function() {
    inputBox.readEditor(function() {});
});
*/

/*_screen.key('up', function() {
    let matches = ac.search(inputBox.getText());
    _screen.debug(matches);
});
*/

//_screen.on('keypress', _.partial(utils.keyPressed, _screen, CommandPanelWidgets));
/*for (let element of CommandPanelWidgets) {
    element.on('focus', _.partial(utils.keyPressed, _screen, CommandPanelWidgets))
}
*/
export function handle_inputBox_cancel() { 
    inputBox.clearValue();
    inputBox.render();
}
export async function handle_inputBox_submit(command: string) { 
    //_screen.debug('In handle_inputBox_submit: ' + command);
    // Dont insert empty string.
    if (!command) {
        return;
    }

    launch_gdb_command(command, _screen).then(
        success => {
            //_screen.debug('Success: ');
            ac.addElement(command);
            historyBox.insertBottom(prefix + ' ' + command);

            const hboxLines = get_log_lines_top_to_bottom(historyBox)
            //_screen.debug('Contents of historyBox: ' + hboxLines);
            //historyBox.unshiftLine([command]);
            inputBox.clearValue();
            inputBox.render();
            //msg.log(box.get_screenLines().join('\n'));
            //box.setText(box.get_screenLines().join('\n'));

            inputBox.readInput(function() {});
            // Reset historyBox line
            hboxState = reset_hboxState(hboxState);

    },
        fail => {

            var failStr = util.inspect(fail);

            inputBox.clearValue();
            inputBox.render();
            //errorMessage.display(failStr, 3, err => { _screen.debug('ree') });
            errorMessage.error(<string>fail, 0);
            //errorMessage.error(dir(kk);
            //_screen.debug('Failed gdb: ' + fail);
            inputBox.readInput(function() {});
            // Reset historyBox line
            hboxState = reset_hboxState(hboxState);
    });

   
}
export function handle_gdb_output(output: string) {
    historyBox.insertBottom(output);
}
export function handle_program_output(output: string) {
    outputBox.insertBottom(output);
}

// GDB callbacks
export function handle_gdb_stopped(data) {
    _screen.debug("Stopped..");
    const frame = get_current_frame(gdb, _screen);
    //_screen.debug(frame);
    //redraw_sourceBox(filePath, line, _screen);
    if (data.reason === 'breakpoint-hit') {
        _screen.debug(data.breakpoint.id + ' is hit!')
        //[filePath, line] = get_current_frame(gdb);
    }
}
export function handle_gdb_running(data) {
    _screen.debug("Running..");
}

