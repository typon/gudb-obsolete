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
const blessed = require('blessed');
const _ = require("lodash");
const match_1 = require("./match");
const cts = require("./constants");
const constants_1 = require("./constants");
const main_1 = require("./main");
const utils = require("./utils");
const Bacon = require("baconjs");
function key_callback(bus, _ignore_, keyObj) {
    bus.push(keyObj.full);
}
function path_call_back(bus, path) {
    bus.push(path);
}
class Streams extends utils.HasCallbacks {
    constructor(gdb, widgets, term) {
        super();
        this.widgets = widgets;
        this.gdbObj = gdb;
        this.ac = new match_1.AutoComplete();
        this.s_gdb_log_out = Bacon.fromEvent(this.gdbObj.logStream, "data");
        this.s_gdb_console_out = Bacon.fromEvent(this.gdbObj.consoleStream, "data");
        this.s_gdb_program_out = Bacon.fromEvent(term, "data");
        this.s_gdb_stopped = Bacon.fromEvent(this.gdbObj, 'stopped');
        this.s_gdb_running = Bacon.fromEvent(this.gdbObj, 'running');
        this.s_gdb_notify = Bacon.fromEvent(this.gdbObj, 'notify');
        this.s_screen_keydown = new Bacon.Bus();
        this.widgets._screen.on('keypress', _.partial(key_callback, this.s_screen_keydown));
        this.s_ibox_submit = Bacon.fromEvent(this.widgets._inputBox, 'submit');
        this.s_ibox_keydown = new Bacon.Bus();
        this.widgets._inputBox.on('keypress', _.partial(key_callback, this.s_ibox_keydown));
        this.s_editor_file_change = new Bacon.Bus();
        this.widgets._editor.textBuf.onDidChangePath(_.partial(path_call_back, this.s_editor_file_change));
        this.s_editor_keydown = new Bacon.Bus();
        this.widgets._editor.on('keypress', _.partial(key_callback, this.s_editor_keydown));
    }
    subscribe_to_streams() {
        let s_source_info = this.s_gdb_stopped.flatMap(_ignore_ => {
            return Bacon.fromPromise(utils.get_current_file_info(this.gdbObj));
        });
        s_source_info
            .filter(info => _.every(info))
            .filter(info => info instanceof utils.CurrentLineInfo)
            .onValue(info => this.widgets.update_editor_row(info));
        let s_screen_key_cx = this.s_screen_keydown.filter(key => key === 'C-x');
        let s_screen_key_cs = this.s_screen_keydown.filter(key => key === 'C-s');
        let s_screen_key_cl = this.s_screen_keydown.filter(key => key === 'C-l');
        this.s_screen_key_cq = this.s_screen_keydown.filter(key => key === 'C-q');
        let s_screen_key_co = this.s_screen_keydown.filter(key => key === 'C-o');
        let s_screen_key_cp = this.s_screen_keydown.filter(key => key === 'C-p');
        this.s_editor_key_B = this.s_editor_keydown.filter(key => key === 'b');
        this.s_editor_key_N = this.s_editor_keydown.filter(key => key === 'n');
        this.s_editor_key_S = this.s_editor_keydown.filter(key => key === 's');
        this.s_editor_key_C = this.s_editor_keydown.filter(key => key === 'c');
        this.s_editor_key_R = this.s_editor_keydown.filter(key => key === 'r');
        this.b_quit = new Bacon.Bus();
        s_screen_key_cx.onValue(_ignore_ => {
            this.widgets._inputBox.clearValue();
            this.widgets._inputBox.render();
            this.widgets._inputBox.readInput(function () { });
        });
        this.b_quit.onValue(_ignore_ => {
            this.gdbObj._process.kill();
            process.exit(0);
        });
        s_screen_key_cl.onValue(_ignore_ => {
            this.widgets._historyBox.focus();
        });
        s_screen_key_cs.onValue(_ignore_ => {
            this.widgets._editor.focus();
        });
        s_screen_key_co.onValue(_ignore_ => {
            this.widgets._outputBox.focus();
        });
        s_screen_key_cp.onValue(_ignore_ => {
            this.widgets._varBox.focus();
        });
        this.handle_resizing();
        this.handle_ibox_submit();
        this.handle_ibox_scrolling();
        this.handle_hbox_updates();
        this.handle_outputBox_updates();
        this.handle_quitting();
        this.handle_editor_cmds();
        this.handle_focus();
        this.handle_variables();
        this.handle_variable_search();
        this.handle_callstack();
        this.handle_menuBar();
        this.handle_info_panel_switching();
        this.handle_helpMSG();
    }
    handle_resizing() {
        let s_container_resize = Bacon.fromEvent(this.widgets._container, 'resize');
        s_container_resize.onValue(_ignore_ => {
            const containerHeight = this.widgets._container.height;
            this.widgets._historyBox.height = containerHeight - cts.CommandPanelProps.inputBoxProps.height - 1;
        });
    }
    handle_ibox_submit() {
        this.s_ibox_submit.onValue(_ignore_ => {
            this.widgets._inputBox.clearValue();
            this.widgets._inputBox.readInput(function () { });
        });
        this.p_ibox_nonempty_submit = this.s_ibox_submit
            .filter(_.negate(_.isEmpty))
            .toProperty();
        let s_user_cmd_int = this.p_ibox_nonempty_submit.sampledBy(this.s_ibox_submit);
        let s_user_cmd_multi = s_user_cmd_int.filter(cmd => utils.isMultiCommand(cmd));
        let s_user_cmd_single = s_user_cmd_int
            .filter(cmd => !utils.isMultiCommand(cmd))
            .filter(cmd => !_.isEqual(cmd, 'end'));
        let s_user_cmd_end = s_user_cmd_int.filter(cmd => cmd == 'end');
        let p_user_cmd_submit = Bacon.update({ state: constants_1.CMDState.Final, cmdStr: '' }, [s_user_cmd_single], function (cmd, finalCMD) {
            main_1.logger.info(`Single, ${cmd}, ${finalCMD}`);
            if (cmd.state == constants_1.CMDState.Final)
                return { state: constants_1.CMDState.Final, cmdStr: finalCMD };
            else {
                main_1.logger.info(`Before appending ${cmd}`);
                cmd.cmdStr = finalCMD;
                main_1.logger.info('Appended: ' + util.inspect(cmd));
                return cmd;
            }
        }, [s_user_cmd_multi], function (cmdPrev, cmdNew) {
            main_1.logger.info(`Multi, ${cmdPrev}, ${cmdNew}`);
            return { state: constants_1.CMDState.Int, cmdStr: cmdNew };
        }, [s_user_cmd_end], function (cmd, _ignore_) {
            main_1.logger.info(`End, ${cmd}`);
            return { state: constants_1.CMDState.Final, cmdStr: 'end' };
        });
        let s_user_cmd_execute = p_user_cmd_submit
            .filter(cmd => !(_.isEmpty(cmd.cmdStr)))
            .doAction(cmd => main_1.logger.info('after mapping: ' + util.inspect(cmd)))
            .toEventStream();
        this.s_user_cmd_str = p_user_cmd_submit
            .doAction(cmd => main_1.logger.info('before str: ' + util.inspect(cmd)))
            .map(cmd => {
            if (cmd.state == constants_1.CMDState.Final) {
                return { tag: cts.colorScheme.commandText, cmd: cmd.cmdStr };
            }
            else if (cmd.state == constants_1.CMDState.Int) {
                return { tag: cts.colorScheme.commandInt, cmd: cmd.cmdStr };
            }
        })
            .toEventStream();
        this.s_user_cmd_str_tagged = this.s_user_cmd_str.map(cmdObj => `{${cmdObj.tag}}${cts.prefix} ${cmdObj.cmd}{/}`);
        this.s_user_cmd_str.onValue(t => this.ac.push(t.cmd));
        this.p_user_cmd_submitted = this.s_user_cmd_str
            .map(cmdObj => cmdObj.cmd)
            .scan([], (x, y) => { return _.concat(x, y); });
        this.s_user_cmd_result_clean = s_user_cmd_execute.flatMap((cmd) => { return Bacon.fromPromise(utils.exec_gdb_command(this.gdbObj, cmd)); });
        this.s_user_cmd_result_quit = this.s_user_cmd_result_clean
            .filter(text => _.isEqual('quitting', text));
        this.s_user_cmd_result_all = this.s_user_cmd_result_clean
            .flatMapError((err) => {
            let cast = err.toString();
            main_1.logger.info('Errrr: ' + cast);
            let filteredErr = cast.match(/GDBError: Error while .*?[".] (.*)/)[1];
            filteredErr = `{${cts.colorScheme.resultError}}${filteredErr}{/}`;
            return new Bacon.Next(filteredErr);
        });
        this.p_user_cmd_result_all = this.s_user_cmd_result_all
            .filter(_.negate(_.isUndefined))
            .filter(_.negate(_.isEmpty))
            .toProperty('');
    }
    handle_ibox_scrolling() {
        let s_ibox_key_up = this.s_ibox_keydown.filter(key => key == 'up').map(1);
        let s_ibox_key_down = this.s_ibox_keydown.filter(key => key == 'down').map(-1);
        let s_ibox_reset = this.s_ibox_keydown.filter(key => (key != 'down' && key != 'up'));
        let p_user_cmd_numlines = this.p_user_cmd_submitted
            .map(arr => arr.length);
        let s_ibox_scroll = Bacon.update(0, [s_ibox_key_up, p_user_cmd_numlines], function (line, _ignore_, upperLimit) {
            line = utils.clamped_op(line, 1, _.add, upperLimit);
            return line;
        }, [s_ibox_key_down], function (line, _ignore_) {
            line = utils.clamped_op(line, 1, _.subtract, Infinity, 1);
            return line;
        }, [s_ibox_reset], function (line, _ignore_) { return 0; });
        this.p_ibox_cur_val = s_ibox_scroll
            .map(_ignore_ => this.widgets._inputBox.getValue())
            .skipDuplicates();
        let p_ibox_start_search = s_ibox_scroll
            .slidingWindow(2)
            .filter(values => { return _.isEqual(values, [0, 1]); });
        this.p_ibox_text_cached = this.p_ibox_cur_val.sampledBy(p_ibox_start_search);
        let p_cache_matches = this.p_ibox_text_cached
            .map(cached => {
            if (_.isEmpty(cached))
                return [{}, 0, cached];
            else {
                let result = this.ac.search(cached);
                result.push(cached);
                return result;
            }
        });
        let s_ibox_scroll_final = Bacon.update(0, [s_ibox_key_up, p_user_cmd_numlines, p_cache_matches], function (line, _ignore_, cmdLines, cacheMatches) {
            const totalMatches = cacheMatches[1];
            let upperLimit;
            if (totalMatches > 0)
                upperLimit = totalMatches;
            else
                upperLimit = cmdLines;
            line = utils.clamped_op(line, 1, _.add, upperLimit);
            return line;
        }, [s_ibox_key_down], function (line, _ignore_) {
            line = utils.clamped_op(line, 1, _.subtract, Infinity, 1);
            return line;
        }, [s_ibox_reset], function (line, _ignore_) { return 0; });
        let p_ibox_text_live = Bacon.combineWith(this.cb_update_ibox_live, s_ibox_scroll_final, p_cache_matches, this.p_user_cmd_submitted);
        p_ibox_text_live
            .filter(_.negate(_.isEmpty))
            .onValue(text => {
            this.widgets._inputBox.clearValue();
            this.widgets._inputBox.setValue(text);
            this.widgets._screen.render();
        });
    }
    cb_update_ibox_live(line, [cacheMatches, totalMatches, def], allLines) {
        if (line === 0)
            return '';
        else {
            if (totalMatches > 0) {
                const index = line - 1;
                if (totalMatches < 1) {
                    return def;
                }
                else if (line > totalMatches) {
                    return cacheMatches[totalMatches - 1][0];
                }
                else {
                    return cacheMatches[index][0];
                }
            }
            else {
                const numLines = allLines.length;
                const index = numLines - line;
                return allLines[index];
            }
        }
    }
    handle_hbox_updates() {
        let s_gdb_log_out_errs = this.s_gdb_log_out.delay(50).filter(log => {
            let filteredText = log.match(/Undefined/);
            return !_.isNull(filteredText);
        });
        let s_gdb_log_out_filtered = this.p_user_cmd_result_all
            .sampledBy(s_gdb_log_out_errs, (result, log) => {
            log = blessed.cleanTags(log);
            result = blessed.cleanTags(result);
            if (log === result) {
                return '';
            }
            else {
                log = `{${cts.colorScheme.resultError}}${log}{/}`;
                return log;
            }
        }).filter(_.negate(_.isEmpty));
        let s_filtered_gdb_console_out = this.s_gdb_console_out.filter(t => t != '>');
        let s_hbox_result_lines = Bacon.mergeAll(s_filtered_gdb_console_out, s_gdb_log_out_filtered, this.p_user_cmd_result_all.toEventStream())
            .filter(_.negate(_.isEmpty));
        let p_hbox_result_lines = s_hbox_result_lines.scan('', (x, y) => { return _.join([x, y], '\n'); });
        let p_hbox_all_lines = this.s_user_cmd_str_tagged
            .merge(s_hbox_result_lines.map(text => `{${cts.colorScheme.resultText}}${text}{/}`))
            .map(_.trim)
            .onValue(text => this.widgets._historyBox.insertBottom(text));
    }
    handle_outputBox_updates() {
        this.s_gdb_program_out
            .filter(t => _.isNull(t.match(/Failed to set controlling terminal/)))
            .map(t => _.trimEnd(t, '\n\r'))
            .onValue(text => this.widgets._outputBox.insertBottom(text));
    }
    handle_quitting() {
        this.b_quit.plug(this.s_screen_key_cq);
        this.b_quit.plug(this.s_user_cmd_result_quit);
    }
    handle_editor_cmds() {
        this.handle_breakpoints();
        this.handle_misc_editor_cmds();
    }
    handle_breakpoints() {
        let s_breakpoints_info = this.s_gdb_notify
            .filter(msg => msg.state == 'breakpoint-modified' ||
            msg.state == 'breakpoint-created' ||
            msg.state == 'breakpoint-deleted')
            .flatMap(_ignore_ => {
            return Bacon.fromPromise(this.gdbObj.getBreaks());
        });
        let p_breakpoints_info = s_breakpoints_info.toProperty();
        let s_bpoints_on_keypress = this.s_editor_key_B.flatMap(_ignore_ => { return Bacon.fromPromise(this.gdbObj.getBreaks()); });
        let s_bpoints_editor = s_bpoints_on_keypress.flatMap(bpoints => {
            const cursor = this.widgets._editor.selection.getHeadPosition();
            const currentLine = cursor.row + 1;
            const currentFile = this.widgets._editor.textBuf.getPath();
            return Bacon.fromPromise(this.add_or_delete_bpoint(currentLine, currentFile, bpoints));
        });
        let s_update_editor_bpoints = Bacon.mergeAll(s_breakpoints_info, p_breakpoints_info.sampledBy(this.s_editor_file_change), s_bpoints_editor);
        s_update_editor_bpoints.onValue(bpoints => this.widgets.update_editor_bpoints(bpoints));
    }
    add_or_delete_bpoint(line, file, bps) {
        return __awaiter(this, void 0, void 0, function* () {
            let createNew = true;
            for (const bp of bps) {
                if (bp.file == file && bp.line == line) {
                    if (!bp.enabled) {
                        const _ignore_ = yield this.gdbObj.removeBreak(file, line);
                        createNew = true;
                    }
                    else {
                        const _ignore_ = yield this.gdbObj.removeBreak(bp);
                        createNew = false;
                    }
                }
            }
            if (createNew) {
                const _ignore_ = yield this.gdbObj.addBreak(file, line);
            }
            return this.gdbObj.getBreaks();
        });
    }
    remove_duplicates(bps) {
        let keepers = {};
        for (const id of Object.keys(bps)) {
            const bp = bps[id];
            keepers[String([bp.line, bp.file])] = bp;
        }
        let result = {};
        for (const key of Object.keys(keepers)) {
            const bp = keepers[key];
            result[bp.id] = bp;
        }
        return result;
    }
    handle_misc_editor_cmds() {
        this.s_editor_key_N.onValue(_ignore_ => utils.exec_gdb_command(this.gdbObj, { cmdStr: 'n', state: constants_1.CMDState.Final }));
        this.s_editor_key_R.onValue(_ignore_ => utils.exec_gdb_command(this.gdbObj, { cmdStr: 'r', state: constants_1.CMDState.Final }));
        this.s_editor_key_C.onValue(_ignore_ => utils.exec_gdb_command(this.gdbObj, { cmdStr: 'c', state: constants_1.CMDState.Final }));
        this.s_editor_key_S.onValue(_ignore_ => utils.exec_gdb_command(this.gdbObj, { cmdStr: 's', state: constants_1.CMDState.Final }));
    }
    handle_focus() {
        let s_ibox_focus = Bacon.fromEvent(this.widgets._inputBox, 'focus').map(1);
        let s_hbox_focus = Bacon.fromEvent(this.widgets._historyBox, 'focus').map(1);
        let s_ibox_unfocus = Bacon.fromEvent(this.widgets._inputBox, 'blur').map(-1);
        let s_hbox_unfocus = Bacon.fromEvent(this.widgets._historyBox, 'blur').map(-1);
        let p_container_focus = s_ibox_focus
            .merge(s_hbox_focus)
            .merge(s_ibox_unfocus)
            .merge(s_hbox_unfocus)
            .scan(0, (x, y) => { return x + y; });
        let p_container_focused = p_container_focus.filter(v => v > 0)
            .onValue(_ignore_ => {
            this.widgets._container.style.border.fg = 'red';
            this.widgets._screen.render();
        });
        let p_container_unfocused = p_container_focus.filter(v => v == 0)
            .onValue(_ignore_ => {
            this.widgets._container.style.border.fg = 'white';
            this.widgets._screen.render();
        });
    }
    handle_variables() {
        let s_var_info = this.s_gdb_stopped.flatMap(_ignore_ => {
            return Bacon.fromPromise(this.gdbObj.context());
        }).map(context => this.process_variable_context(context));
        s_var_info.onValue(varStrs => {
            this.widgets._varBox.setItems(varStrs);
            this.widgets._varBox.render();
        });
    }
    process_variable_context(context) {
        const locals = _.filter(context, (c) => c.scope == 'local');
        const globals = _.filter(context, (c) => c.scope == 'global');
        let localsStrs = locals.map(vr => `{${cts.colorScheme.varName}}${vr.name}{/}: {bold}${vr.value}{/} <${vr.type}>`);
        let globalsStrs = globals.map(vr => `{${cts.colorScheme.varName}}${vr.name}{/}: {bold}${vr.value}{/} <${vr.type}>`);
        localsStrs = _.concat(`{${cts.colorScheme.varHeader}}{bold}{${cts.colorScheme.varHeaderbg}}Locals`, localsStrs);
        globalsStrs = _.concat(`{${cts.colorScheme.varHeader}}{bold}{${cts.colorScheme.varHeaderbg}}Globals`, globalsStrs);
        const allStrs = _.concat(localsStrs, globalsStrs);
        return allStrs;
    }
    handle_variable_search() {
        let s_start_varsearch = new Bacon.Bus();
        exports.var_search = search_func => {
            s_start_varsearch.push(search_func);
        };
        this.widgets._varBox.options.search = exports.var_search;
        this.s_varbox_keydown = new Bacon.Bus();
        this.widgets._varBox.on('keypress', _.partial(key_callback, this.s_varbox_keydown));
        let s_varbox_reset = this.s_varbox_keydown.filter(key => key == 'return' || key == 'escape' || key == 'enter' || key == '/').map(1);
        let s_varbox_text = this.s_varbox_keydown.filter(key => utils.is_alphanum(key));
        this.p_varbox_search = Bacon.update(['', false], [s_varbox_reset], function ([srch, valid], reset) {
            return [srch, true];
        }, [s_varbox_text], function ([srch, valid], k) {
            if (valid == true)
                srch = '';
            srch = srch + k;
            return [srch, false];
        }).filter(([srch, valid]) => valid == true)
            .map(([srch, valid]) => { return srch; });
        s_start_varsearch.toProperty().sampledBy(this.p_varbox_search, (func, srch) => {
            func(srch);
            return true;
        }).onValue(() => { });
    }
    handle_callstack() {
        this.s_stackbox_keydown = new Bacon.Bus();
        this.widgets._stackBox.on('keypress', _.partial(key_callback, this.s_stackbox_keydown));
        let s_callstack_info = this.s_gdb_stopped.flatMap(() => {
            return Bacon.fromPromise(utils.exec_gdb_command(this.gdbObj, { cmdStr: '-stack-list-frames', state: constants_1.CMDState.Final }));
        })
            .map(this.process_callstack)
            .onValue(stack => {
            this.widgets._stackBox.setItems(stack);
            this.widgets._stackBox.render();
        });
    }
    process_callstack(result) {
        let stack = result.stack;
        let stackStr = stack.map(fr => `{${cts.colorScheme.varName}}#${fr.value.level}{/}: ${fr.value.addr} in {bold}${fr.value.func}{/} at ${fr.value.file}:${fr.value.line}`);
        return stackStr;
    }
    handle_info_panel_switching() {
        let s_varbox_keydown_right = this.s_varbox_keydown.filter(key => key == 'right').map(1);
        let s_stackbox_keydown_right = this.s_stackbox_keydown.filter(key => key == 'right').map(1);
        var CurrentInfoBox;
        (function (CurrentInfoBox) {
            CurrentInfoBox[CurrentInfoBox["varBox"] = 0] = "varBox";
            CurrentInfoBox[CurrentInfoBox["stackBox"] = 1] = "stackBox";
        })(CurrentInfoBox || (CurrentInfoBox = {}));
        ;
        let p_infobox_current = Bacon.update(CurrentInfoBox.varBox, [s_varbox_keydown_right], function (prev, varBoxToggle) {
            return CurrentInfoBox.stackBox;
        }, [s_stackbox_keydown_right], function (prev, stackBoxToggle) {
            return CurrentInfoBox.varBox;
        }).onValue(current => {
            if (current == CurrentInfoBox.stackBox) {
                this.widgets._varBox.hidden = true;
                this.widgets._stackBox.hidden = false;
                this.widgets._stackBox.focus();
            }
            else if (current == CurrentInfoBox.varBox) {
                this.widgets._varBox.hidden = false;
                this.widgets._stackBox.hidden = true;
                this.widgets._varBox.focus();
            }
        });
    }
    handle_menuBar() {
        let s_program_status = Bacon.mergeAll(this.s_gdb_stopped.map('Stopped'), this.s_gdb_running.map('Running'))
            .toProperty().startWith('Not started');
        let s_menubar_updates = Bacon.combineAsArray(s_program_status, this.p_varbox_search).startWith(['Not started', ''])
            .onValue(([statuz, srch]) => this.widgets._menuStatus.setContent(this.widgets._menuStatusTemplate(statuz, srch)));
    }
    handle_helpMSG() {
        let s_screen_key_qm = this.s_screen_keydown.filter(key => key === '?');
        this.widgets._helpMessage.hidden = true;
        s_screen_key_qm.onValue(() => {
            this.widgets._helpMessage.hidden = false;
            this.widgets._helpMessage.display(cts.helpMessageProps.text, 0, () => { });
        });
    }
}
exports.Streams = Streams;
