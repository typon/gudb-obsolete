const util = require('util');
const blessed = require('blessed');
import * as _ from "lodash";
import { GDB } from 'gdb-js'
import { AutoComplete} from "./match";
import * as cts from "./constants";
import {CMDState as CMDState} from "./constants";
import * as main from "./main";
import { logger as lg} from "./main";
import { Widgets } from "./widgets";
import * as utils from "./utils";
import { contains } from "./utils";
import * as Bacon from 'baconjs';

function key_callback(bus, _ignore_, keyObj) {
    //Add key name into bus.
    bus.push(keyObj.full);
}
function path_call_back(bus, path) {
    bus.push(path);
}
export let var_search;

export class Streams extends utils.HasCallbacks {
    s_gdb_program_out: Bacon.EventStream<any,any>;
    s_gdb_log_out: Bacon.EventStream<any,any>;
    s_gdb_console_out: Bacon.EventStream<any,any>;
    s_gdb_stopped: Bacon.EventStream<any,any>;
    s_gdb_running: Bacon.EventStream<any,any>;
    s_gdb_notify: Bacon.EventStream<any,any>;
    s_gdb_bpoints: Bacon.EventStream<any,any>;
    s_source_info: Bacon.EventStream<any,any>;
    s_editor_file_change: Bacon.EventStream<any,any>; 

    s_editor_focus: Bacon.EventStream<any,any>; 
    s_container_focus: Bacon.EventStream<any,any>; 
    s_ibox_focus: Bacon.EventStream<any,any>; 
    s_hbox_focus: Bacon.EventStream<any,any>; 

    
    s_editor_keydown : Bacon.EventStream<any,any>;
    s_screen_keydown : Bacon.EventStream<any,any>;
    s_screen_key_cq : Bacon.EventStream<any,any>;

    s_stackbox_keydown : Bacon.EventStream<any,any>;
    s_varbox_keydown : Bacon.EventStream<any,any>;

    s_editor_key_B : Bacon.EventStream<any,any>;
    s_editor_key_N : Bacon.EventStream<any,any>;
    s_editor_key_S : Bacon.EventStream<any,any>;
    s_editor_key_C : Bacon.EventStream<any,any>;
    s_editor_key_R : Bacon.EventStream<any,any>;

    b_quit : Bacon.Bus<any,any>;

    p_ibox_text_cached : Bacon.Property<any,any>;
    p_ibox_cur_val: Bacon.Property<any,any>;
    s_ibox_keydown: Bacon.EventStream<any,any>;
    s_ibox_submit: Bacon.EventStream<any,any>;
    s_user_cmd_submit_final: Bacon.EventStream<any,any>;

    s_user_cmd_submit: Bacon.EventStream<any,any>;
    s_user_cmd_submitted_filtered: Bacon.EventStream<any,any>;
    s_user_cmd_str: Bacon.EventStream<any,any>;
    s_user_cmd_str_tagged : Bacon.EventStream<any,any>;
    p_user_cmd_submitted: Bacon.Property<any,any>;

    s_user_cmd_result_clean: Bacon.EventStream<any,any>;
    s_user_cmd_result_all: Bacon.EventStream<any,any>;
    p_user_cmd_result_all: Bacon.Property<any, any>; 
    p_ibox_nonempty_submit: Bacon.Property<any, any>; 
    s_user_cmd_result_quit: Bacon.EventStream<any,any>;

    p_varbox_search: Bacon.Property<any,any>;

   

    gdbObj: GDB;
    widgets: Widgets;
    ac: AutoComplete;
    term;
    constructor(gdb, widgets, term) {
        super();

        this.widgets = widgets;
        this.gdbObj = gdb;
        this.ac = new AutoComplete();

        this.s_gdb_log_out = Bacon.fromEvent(this.gdbObj.logStream, "data");
        this.s_gdb_console_out = Bacon.fromEvent(this.gdbObj.consoleStream, "data");
        this.s_gdb_program_out = Bacon.fromEvent(term, "data");
        this.s_gdb_stopped = Bacon.fromEvent(this.gdbObj, 'stopped');
        this.s_gdb_running = Bacon.fromEvent(this.gdbObj, 'running');
        this.s_gdb_notify = Bacon.fromEvent(this.gdbObj, 'notify');

        // TODO: Figure out whether this is a hack or not.
        // Create bus and correspondong callback which will push events
        // into this bus.
        // This is needed because some events emit more than one argument,
        // In these cases, the standard Bacon.fromEvent method does not work
        // since it drops the second argument silently and only passes the 
        // first one into the stream.
        this.s_screen_keydown = new Bacon.Bus()
        this.widgets._screen.on('keypress', _.partial(key_callback,this.s_screen_keydown))

        this.s_ibox_submit = Bacon.fromEvent(this.widgets._inputBox, 'submit')

        this.s_ibox_keydown = new Bacon.Bus()
        this.widgets._inputBox.on('keypress', _.partial(key_callback,this.s_ibox_keydown))

        this.s_editor_file_change = new Bacon.Bus()
        this.widgets._editor.textBuf.onDidChangePath(_.partial(path_call_back,this.s_editor_file_change))

        this.s_editor_keydown = new Bacon.Bus()
        this.widgets._editor.on('keypress', _.partial(key_callback,this.s_editor_keydown))


    }
    subscribe_to_streams() {
        let s_source_info = this.s_gdb_stopped.flatMap(_ignore_ => {
            return Bacon.fromPromise(utils.get_current_file_info(this.gdbObj));
        })

        s_source_info
            .filter(info => _.every(info))
            .filter(info => info instanceof utils.CurrentLineInfo)
            .onValue(info => this.widgets.update_editor_row(info))



        // Handle keys
        let s_screen_key_cx = this.s_screen_keydown.filter(key => key === 'C-x')
        let s_screen_key_cs = this.s_screen_keydown.filter(key => key === 'C-s')
        let s_screen_key_cl = this.s_screen_keydown.filter(key => key === 'C-l')
        this.s_screen_key_cq = this.s_screen_keydown.filter(key => key === 'C-q')
        let s_screen_key_co = this.s_screen_keydown.filter(key => key === 'C-o')
        let s_screen_key_cp = this.s_screen_keydown.filter(key => key === 'C-p')

        this.s_editor_key_B = this.s_editor_keydown.filter(key => key === 'b')
        this.s_editor_key_N = this.s_editor_keydown.filter(key => key === 'n')
        this.s_editor_key_S = this.s_editor_keydown.filter(key => key === 's')
        this.s_editor_key_C = this.s_editor_keydown.filter(key => key === 'c')
        this.s_editor_key_R = this.s_editor_keydown.filter(key => key === 'r')

        this.b_quit = new Bacon.Bus()


        s_screen_key_cx.onValue(_ignore_ => {
            this.widgets._inputBox.clearValue();
            this.widgets._inputBox.render();
            this.widgets._inputBox.readInput(function() {});
        })
        this.b_quit.onValue(_ignore_ => {
            this.gdbObj._process.kill()
            process.exit(0)
        })
        s_screen_key_cl.onValue(_ignore_ => {
            this.widgets._historyBox.focus();
        })
        s_screen_key_cs.onValue(_ignore_ => {
            this.widgets._editor.focus();
        })
        s_screen_key_co.onValue(_ignore_ => {
            this.widgets._outputBox.focus();
        })
        s_screen_key_cp.onValue(_ignore_ => {
            this.widgets._varBox.focus();
        })


        this.handle_resizing()
        this.handle_ibox_submit()
        this.handle_ibox_scrolling()
        this.handle_hbox_updates()
        this.handle_outputBox_updates()
        this.handle_quitting()
        this.handle_editor_cmds()
        this.handle_focus()
        this.handle_variables()
        this.handle_variable_search()
        this.handle_callstack()
        this.handle_menuBar()
        this.handle_info_panel_switching()
        this.handle_helpMSG()
    }
    handle_resizing(){

        let s_container_resize = Bacon.fromEvent(this.widgets._container, 'resize')
            s_container_resize.onValue(_ignore_ => {
                const containerHeight = this.widgets._container.height;
                this.widgets._historyBox.height = containerHeight - cts.CommandPanelProps.inputBoxProps.height - 1;
        })

    }

    handle_ibox_submit() {
        // Handle clearing and refocusing on ibox.
        this.s_ibox_submit.onValue( _ignore_ => {
            this.widgets._inputBox.clearValue();
            this.widgets._inputBox.readInput(function() {});
        })
        

        this.p_ibox_nonempty_submit = this.s_ibox_submit
                                .filter(_.negate(_.isEmpty))
                                .toProperty()

        let s_user_cmd_int = this.p_ibox_nonempty_submit.sampledBy(this.s_ibox_submit)
        let s_user_cmd_multi = s_user_cmd_int.filter(cmd => utils.isMultiCommand(cmd))
        let s_user_cmd_single = s_user_cmd_int
                                            .filter(cmd => !utils.isMultiCommand(cmd))
                                            .filter(cmd => !_.isEqual(cmd, 'end'))
        let s_user_cmd_end = s_user_cmd_int.filter(cmd => cmd == 'end')

        let p_user_cmd_submit = Bacon.update(
            {state: CMDState.Final, cmdStr: ''},
            [s_user_cmd_single], function(cmd, finalCMD) { 
              lg.info(`Single, ${cmd}, ${finalCMD}`)
                if (cmd.state == CMDState.Final) return {state: CMDState.Final, cmdStr:finalCMD}
                else {
                    lg.info(`Before appending ${cmd}`)
                    cmd.cmdStr = finalCMD

                    lg.info('Appended: ' + util.inspect(cmd))
                    return cmd
                }
            },
            [s_user_cmd_multi], function(cmdPrev, cmdNew) {
              lg.info(`Multi, ${cmdPrev}, ${cmdNew}`)
              return {state:CMDState.Int, cmdStr:cmdNew}
            },
            [s_user_cmd_end], function(cmd, _ignore_) { 
                lg.info(`End, ${cmd}`)
                // Form final command for MI
                return {state:CMDState.Final, cmdStr:'end'}
          }
        )

        let s_user_cmd_execute = p_user_cmd_submit
                                .filter(cmd => !(_.isEmpty(cmd.cmdStr)))
                                .doAction(cmd => lg.info('after mapping: ' + util.inspect(cmd)))
                                .toEventStream()
        this.s_user_cmd_str = p_user_cmd_submit
                                .doAction(cmd => lg.info('before str: ' +util.inspect( cmd)))
                                .map(cmd  => {
                                    if (cmd.state == CMDState.Final) {
                                        return {tag:cts.colorScheme.commandText, cmd:cmd.cmdStr}
                                    } else if (cmd.state == CMDState.Int) {
                                        return {tag:cts.colorScheme.commandInt, cmd:cmd.cmdStr}
                                    }

                                })
                                .toEventStream()
        this.s_user_cmd_str_tagged = this.s_user_cmd_str.map(cmdObj => `{${cmdObj.tag}}${cts.prefix} ${cmdObj.cmd}{/}` )

        // Populate autocomplete db
        this.s_user_cmd_str.onValue(t => this.ac.push(t.cmd))
        this.p_user_cmd_submitted = this.s_user_cmd_str
                                        .map(cmdObj => cmdObj.cmd)
                                        .scan([], (x, y) => {return _.concat(x,y)})

        
        this.s_user_cmd_result_clean = s_user_cmd_execute.flatMap(
            (cmd: any) => { return Bacon.fromPromise(utils.exec_gdb_command(this.gdbObj, cmd)) }
        )
        this.s_user_cmd_result_quit = this.s_user_cmd_result_clean
                                        .filter(text => _.isEqual('quitting', text))

        this.s_user_cmd_result_all = this.s_user_cmd_result_clean
                                            .flatMapError((err:string) => {
                                                let cast = err.toString()
                                                lg.info('Errrr: ' + cast)
                                                let filteredErr = cast.match(/GDBError: Error while .*?[".] (.*)/)[1]
                                                filteredErr = `{${cts.colorScheme.resultError}}${filteredErr}{/}`
                                                return new Bacon.Next(filteredErr)
                                            })

        this.p_user_cmd_result_all = this.s_user_cmd_result_all
                                        .filter(_.negate(_.isUndefined))
                                        .filter(_.negate(_.isEmpty))
                                        .toProperty('')
        
    }
    handle_ibox_scrolling() {
        // Consider historybox with contents:
        // -> b foop
        // -> b foo
        // -> run
        // -> n
        // -> b bar
        // -> err
        // -> n
        //
        // Scenario 1:
        // Then user enters 'b ' and presses up.
        //
        // s_ibox_keydown:     ----up-------up--------up-----backspace-------up-------left----
        // s_ibox_keyup:       ----1--------1---------1----------------------1----------------
        // s_ibox_reset:       ---------------------------------1-----------------------1-----
        // s_ibox_scroll:      ----1--------2---------3---------0------------1----------0-----
        // s_ibox_text_cached: ---'b '------------------------------------'b foo'-------------
        // s_ibox_text_live:   --'b bar'--'b foo'--'b foop'---'b foo'-----'b foo'----'b foo'--
        //
        // Scenario 2:
        // User presses 'i' to focus inputBox and presses up.
        //
        // s_ibox_keydown:     ----up-------up--------down-----backspace-------up---
        // s_ibox_keyup:       ----1--------1----------------------------------1----
        // s_ibox_reset:       ------------------------------------1----------------
        // s_ibox_scroll:      ----1--------2----------2-----------0-----------1----
        // s_ibox_text_cached: ----''------------------------------------------''---
        // s_ibox_text_live:   ---'n'-----'err'-------'n'----------''----------''---
         





        let s_ibox_key_up = this.s_ibox_keydown.filter(key => key == 'up').map(1)
        let s_ibox_key_down = this.s_ibox_keydown.filter(key => key == 'down').map(-1)
        let s_ibox_reset = this.s_ibox_keydown.filter(key => (key != 'down' && key != 'up'))
        let p_user_cmd_numlines = this.p_user_cmd_submitted
                                        .map(arr => arr.length)
        let s_ibox_scroll = Bacon.update(
          0,
          [s_ibox_key_up, p_user_cmd_numlines], function(line, _ignore_, upperLimit) { 
              line = utils.clamped_op(line, 1, _.add, upperLimit)
              return line
          },
          [s_ibox_key_down], function(line, _ignore_) {
              line = utils.clamped_op(line, 1, _.subtract, Infinity, 1)
              return line
          },
          [s_ibox_reset], function(line, _ignore_) { return 0 }
        )

        // Any time a key is pressed, get the current value of ibox.
        this.p_ibox_cur_val = s_ibox_scroll
                                .map(_ignore_ => this.widgets._inputBox.getValue())
                                .skipDuplicates()

        // Start Handle Scenario 1
        let p_ibox_start_search = s_ibox_scroll
                                    .slidingWindow(2)
                                    .filter(values => {return _.isEqual(values, [0,1])})
        
        this.p_ibox_text_cached = this.p_ibox_cur_val.sampledBy(p_ibox_start_search)
        let p_cache_matches = this.p_ibox_text_cached
                                    .map(cached => {
                                        if(_.isEmpty(cached)) return [{}, 0, cached]
                                        else {
                                            let result = this.ac.search(cached)
                                            result.push(cached)
                                            return result
                                        }
                                    })

        let s_ibox_scroll_final = Bacon.update(
          0,
          [s_ibox_key_up, p_user_cmd_numlines, p_cache_matches], function(line, _ignore_, cmdLines, cacheMatches) { 
              const totalMatches = cacheMatches[1]
              let upperLimit;
              if (totalMatches > 0) upperLimit = totalMatches
              else upperLimit = cmdLines
              line = utils.clamped_op(line, 1, _.add, upperLimit)
              return line
          },
          [s_ibox_key_down], function(line, _ignore_) {
              line = utils.clamped_op(line, 1, _.subtract, Infinity, 1)
              return line
          },
          [s_ibox_reset], function(line, _ignore_) { return 0 }
        )

        // end Handle Scenario 1
        // Start Handle Scenario 2
        let p_ibox_text_live = Bacon.combineWith(
                this.cb_update_ibox_live, 
                s_ibox_scroll_final, 
                p_cache_matches,
                this.p_user_cmd_submitted,
        )
        
        p_ibox_text_live
            .filter(_.negate(_.isEmpty))
            .onValue(text=> {
                this.widgets._inputBox.clearValue()
                this.widgets._inputBox.setValue(text)
                this.widgets._screen.render()
            })

        // end Scenario 2
                
        

    }
    cb_update_ibox_live(line, [cacheMatches, totalMatches, def], allLines) {
        if (line === 0) return '';
        else {
            if (totalMatches > 0) {
                const index = line - 1;
                if (totalMatches < 1) {
                    return def
                } else if (line > totalMatches) {
                    return cacheMatches[totalMatches-1][0]
                } else {
                    return cacheMatches[index][0]
                }

            } else {
                const numLines = allLines.length
                const index = numLines - line
                return allLines[index]
            }
        }

    }

    handle_hbox_updates() {

       let s_gdb_log_out_errs = this.s_gdb_log_out.delay(50).filter(log => {
            let filteredText = log.match(/Undefined/)
            return !_.isNull(filteredText)
       })

       let s_gdb_log_out_filtered = this.p_user_cmd_result_all
                                    .sampledBy(s_gdb_log_out_errs, (result: string, log: string) => {
                                        log = blessed.cleanTags(log)
                                        result = blessed.cleanTags(result)
                                        if (log === result) {
                                            return ''
                                        } else {
                                            log =`{${cts.colorScheme.resultError}}${log}{/}` 
                                            return log
                                        }
                                    }).filter(_.negate(_.isEmpty))

        let s_filtered_gdb_console_out = this.s_gdb_console_out.filter(t => t != '>')
        let s_hbox_result_lines = Bacon.mergeAll(s_filtered_gdb_console_out, s_gdb_log_out_filtered, this.p_user_cmd_result_all.toEventStream())
                                  .filter(_.negate(_.isEmpty))

        let p_hbox_result_lines = s_hbox_result_lines.scan('', (x, y) => {return _.join([x,y], '\n')})

        let p_hbox_all_lines = this.s_user_cmd_str_tagged
                                        .merge(
                                            s_hbox_result_lines.map(text => `{${cts.colorScheme.resultText}}${text}{/}`)
                                        )
                                .map(_.trim)
                                .onValue(text => this.widgets._historyBox.insertBottom(text))
    
    }
    handle_outputBox_updates() {
        this.s_gdb_program_out
            .filter(t => _.isNull(t.match(/Failed to set controlling terminal/)))
            .map(t => _.trimEnd(t, '\n\r'))
            .onValue(text => this.widgets._outputBox.insertBottom(text))
    }
    handle_quitting() {
        //Create bus for handling quitting, since it can multiple things
        //plugged into it.
        this.b_quit.plug(this.s_screen_key_cq)
        this.b_quit.plug(this.s_user_cmd_result_quit)
    }
    handle_editor_cmds(){
        this.handle_breakpoints()
        this.handle_misc_editor_cmds()
    }
    handle_breakpoints() {
        let s_breakpoints_info = this.s_gdb_notify
                                .filter(msg => msg.state == 'breakpoint-modified' ||
                                               msg.state == 'breakpoint-created' ||
                                               msg.state == 'breakpoint-deleted')
                                .flatMap(_ignore_ => {
                                        return Bacon.fromPromise(this.gdbObj.getBreaks())
                                })
        let p_breakpoints_info = s_breakpoints_info.toProperty() 
        
        // Handle deleting/creating breakpoints when user presses B key.
        let s_bpoints_on_keypress = this.s_editor_key_B.flatMap(_ignore_ => {return Bacon.fromPromise(this.gdbObj.getBreaks())})
        let s_bpoints_editor = s_bpoints_on_keypress.flatMap(bpoints => {
            const cursor = this.widgets._editor.selection.getHeadPosition()
            const currentLine = cursor.row + 1
            const currentFile = this.widgets._editor.textBuf.getPath()
            return Bacon.fromPromise(this.add_or_delete_bpoint(currentLine,currentFile, bpoints))
        })

        let s_update_editor_bpoints = Bacon.mergeAll(
                                        s_breakpoints_info,
                                        p_breakpoints_info.sampledBy(this.s_editor_file_change),
                                        s_bpoints_editor
                                        )
        s_update_editor_bpoints.onValue(bpoints => this.widgets.update_editor_bpoints(bpoints))


    }
    async add_or_delete_bpoint(line, file, bps) {
        let createNew = true
        // Remove duplicate bps(same file/line, but diff ID)
        for (const bp of bps) {
            if(bp.file == file && bp.line == line) {

                if (!bp.enabled) {
                    // Re-enable breakpoint at the location.
                    const _ignore_ = await this.gdbObj.removeBreak(file, line)
                    createNew = true
                } else {
                    // Delete breakpoint at this location
                    const _ignore_ = await this.gdbObj.removeBreak(bp)
                    createNew = false
                }
            }
        }
        if(createNew) {
            // Add new breakpoint at the location.
            const _ignore_ = await this.gdbObj.addBreak(file, line)
        }
        return this.gdbObj.getBreaks();
    }
    remove_duplicates(bps) {
        // For each bp, create objects to store latest bp.
        // line/file: id
        let keepers = {}
        for (const id of Object.keys(bps)) {
            const bp = bps[id]
            keepers[String([bp.line, bp.file])] = bp
        }
        let result = {}
        for (const key of Object.keys(keepers)) {
            const bp = keepers[key]
            result[bp.id] = bp
        }
        return result
    }
    handle_misc_editor_cmds(){
        this.s_editor_key_N.onValue(_ignore_ => utils.exec_gdb_command(this.gdbObj, {cmdStr:'n', state:CMDState.Final})) 
        this.s_editor_key_R.onValue(_ignore_ => utils.exec_gdb_command(this.gdbObj, {cmdStr:'r', state:CMDState.Final}))
        this.s_editor_key_C.onValue(_ignore_ => utils.exec_gdb_command(this.gdbObj, {cmdStr:'c', state:CMDState.Final}))
        this.s_editor_key_S.onValue(_ignore_ => utils.exec_gdb_command(this.gdbObj, {cmdStr:'s', state:CMDState.Final}))
    }
    handle_focus(){
        let s_ibox_focus = Bacon.fromEvent(this.widgets._inputBox, 'focus').map(1)
        let s_hbox_focus = Bacon.fromEvent(this.widgets._historyBox, 'focus').map(1)
        let s_ibox_unfocus = Bacon.fromEvent(this.widgets._inputBox, 'blur').map(-1)
        let s_hbox_unfocus = Bacon.fromEvent(this.widgets._historyBox, 'blur').map(-1)
        let p_container_focus = s_ibox_focus
                                .merge(s_hbox_focus)
                                .merge(s_ibox_unfocus)
                                .merge(s_hbox_unfocus)
                                .scan(0, (x, y) => {return x+y})

        let p_container_focused = p_container_focus.filter(v => v > 0)
                                    .onValue(_ignore_ => {
                                        this.widgets._container.style.border.fg = 'red'
                                        this.widgets._screen.render()
                                    })
        let p_container_unfocused = p_container_focus.filter(v => v == 0)
                                    .onValue(_ignore_ => {
                                        this.widgets._container.style.border.fg = 'white'
                                        this.widgets._screen.render()
                                    })
        


    }
    handle_variables(){
        let s_var_info = this.s_gdb_stopped.flatMap(_ignore_ => {
                return Bacon.fromPromise(this.gdbObj.context())
            }).map(context => this.process_variable_context(context))
            s_var_info.onValue(varStrs => {
                this.widgets._varBox.setItems(varStrs)
                this.widgets._varBox.render()
            })

        }
        process_variable_context(context){
            const locals = _.filter(context, (c: any) => c.scope == 'local')
            const globals = _.filter(context, (c: any) => c.scope == 'global')

            let localsStrs: string[] = locals.map(vr => `{${cts.colorScheme.varName}}${vr.name}{/}: {bold}${vr.value}{/} <${vr.type}>`)
            let globalsStrs: string[] = globals.map(vr => `{${cts.colorScheme.varName}}${vr.name}{/}: {bold}${vr.value}{/} <${vr.type}>`)
            localsStrs = _.concat(`{${cts.colorScheme.varHeader}}{bold}{${cts.colorScheme.varHeaderbg}}Locals`, localsStrs)
            globalsStrs = _.concat(`{${cts.colorScheme.varHeader}}{bold}{${cts.colorScheme.varHeaderbg}}Globals`, globalsStrs)
            const allStrs = _.concat(localsStrs, globalsStrs)
            return allStrs

            
        }
        handle_variable_search() {
            let s_start_varsearch = new Bacon.Bus()
            // Push each start search event (which is a func) into the bus
            var_search = search_func => {
                s_start_varsearch.push(search_func)
            }
            this.widgets._varBox.options.search = var_search

            this.s_varbox_keydown = new Bacon.Bus()
            this.widgets._varBox.on('keypress', _.partial(key_callback,this.s_varbox_keydown))


            let s_varbox_reset = this.s_varbox_keydown.filter(key => key == 'return' || key == 'escape' || key == 'enter' || key == '/').map(1)
            let s_varbox_text = this.s_varbox_keydown.filter(key => utils.is_alphanum(key))

            // Create property that holds the latest search string.
            // It gets reset every time the user starts a new search
            // or presses escape or presses enter.
            this.p_varbox_search = Bacon.update(
              ['', false], // Initial
              [s_varbox_reset], function([srch, valid], reset) {
                  // Reset search valid
                  return [srch, true]
              },
              [s_varbox_text], function([srch, valid]: [string, boolean], k) {
                  // we just emitted a search, reset string
                  if (valid == true) srch = ''
                  srch = srch + k
                  return [srch, false]
              },

            ).filter(([srch, valid]) => valid == true)
            .map(([srch, valid]) => {return srch})

            s_start_varsearch.toProperty().sampledBy(this.p_varbox_search, (func: Function, srch: string) => {
                func(srch)
                return true
            }).onValue(() => {})
                    

        }
        handle_callstack() {
            this.s_stackbox_keydown = new Bacon.Bus()
            this.widgets._stackBox.on('keypress', _.partial(key_callback,this.s_stackbox_keydown))

                let s_callstack_info = this.s_gdb_stopped.flatMap(() => 
                      {return Bacon.fromPromise(
                          utils.exec_gdb_command(
                            this.gdbObj, {cmdStr:'-stack-list-frames', state:CMDState.Final}))})
                    .map(this.process_callstack)
                    .onValue(stack=> {
                                this.widgets._stackBox.setItems(stack)
                                this.widgets._stackBox.render()
                    })

        }
        process_callstack(result){
            let stack = result.stack
            let stackStr: string[] = stack.map(fr => 
                    `{${cts.colorScheme.varName}}#${fr.value.level}{/}: ${fr.value.addr} in {bold}${fr.value.func}{/} at ${fr.value.file}:${fr.value.line}`)
            return stackStr
        }
        handle_info_panel_switching() {
            //s_varbox_keydown.onValue(t => lg.info("PRESSED: " + t))
            let s_varbox_keydown_right = this.s_varbox_keydown.filter(key => key == 'right').map(1)
            let s_stackbox_keydown_right = this.s_stackbox_keydown.filter(key => key == 'right').map(1)
            enum CurrentInfoBox {varBox, stackBox};
            let p_infobox_current = Bacon.update(
              CurrentInfoBox.varBox, // Initial
              [s_varbox_keydown_right], function(prev, varBoxToggle) {
                  return CurrentInfoBox.stackBox
              },
              [s_stackbox_keydown_right], function(prev, stackBoxToggle) {
                  return CurrentInfoBox.varBox
              }
            ).onValue(current => {
                if (current == CurrentInfoBox.stackBox) {
                    this.widgets._varBox.hidden = true
                    this.widgets._stackBox.hidden = false
                    this.widgets._stackBox.focus();
                }
                else if (current == CurrentInfoBox.varBox) {
                    this.widgets._varBox.hidden = false
                    this.widgets._stackBox.hidden = true
                    this.widgets._varBox.focus();
                }
            })

        }
        handle_menuBar() {
            let s_program_status = Bacon.mergeAll(this.s_gdb_stopped.map('Stopped'),
                                                  this.s_gdb_running.map('Running'))
                                    .toProperty().startWith('Not started')
            let s_menubar_updates = Bacon.combineAsArray(s_program_status, this.p_varbox_search).startWith(['Not started',''])
                                    .onValue(([statuz, srch]) => this.widgets._menuStatus.setContent(this.widgets._menuStatusTemplate(statuz, srch)))
        }
        handle_helpMSG() {
            let s_screen_key_qm = this.s_screen_keydown.filter(key => key === '?')
            this.widgets._helpMessage.hidden = true;
            s_screen_key_qm.onValue(() => {
                this.widgets._helpMessage.hidden = false;
                this.widgets._helpMessage.display(cts.helpMessageProps.text, 0, ()=>{})
            })

        }

}
