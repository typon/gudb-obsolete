const util = require('util');
import { GDB } from 'gdb-js'
import * as _ from "lodash";
const blessed = require('blessed');
const BaseWidget = require('base-widget');
const Editor = require('editor-widget');
var Point = require('text-buffer/lib/point');
import * as cts from "./constants";
import * as utils from "./utils";
import * as streams from "./streams";
import { logger as lg} from "./main";

export class Widgets {
    _screen;
    _editor;
    _container;
    _outputBox;
    _varBox;
    _inputBox;
    _hbox_inbox_divider;
    _historyBox;
    _errorMessage;
    gdbObj: GDB;
    _hboxState;

    constructor(gdbObj) {
        this.gdbObj = gdbObj
        this._screen = blessed.screen({
            debug: true,
            log: './logf',
            autoPadding: true,
            fullUnicode: true,
            dockBorders: true,
            warnings: true
        });
        this._editor = new Editor({
            // normal blessed widget, use like you would any other blessed element
            parent: this._screen,
            top: cts.editorProps.top,
            left: cts.editorProps.left,
            width: cts.editorProps.width,
            height: cts.editorProps.height,
            label: 'Source',
            border: {
                type: 'line'
            },
            style: cts.editorProps.style,

        });
        this._editor.options.style['markedRow'] = `{${cts.breakPointLineColor}}`
        this._editor.readOnly(true);

        this._varBox = blessed.List({
            name: 'varBox', 
            label: 'Variables',
            parent: this._screen,
            scrollable: true,
            // Possibly support:
            // align: 'center',
            style: cts.varBoxProps.style,
            alwaysScroll: true,
            scrollbar: {
                ch: ' ',
                inverse: true
            },
            border: {
                type: 'line'
            },
            height: cts.varBoxProps.height,
            width: cts.varBoxProps.width,
            left: cts.varBoxProps.left,
            top: cts.varBoxProps.top,
            vi: true,
            tags: true,
            keys: true,
        });
        this._outputBox = blessed.log({
            name: 'outputBox', 
            label: 'Program output',
            parent: this._screen,
            scrollable: true,
            // Possibly support:
            // align: 'center',
            style: cts.outputBoxProps.style,
            alwaysScroll: true,
            scrollbar: {
                ch: ' ',
                inverse: true
            },
            border: {
                type: 'line'
            },
            height: cts.outputBoxProps.height,
            width: cts.outputBoxProps.width,
            left: cts.outputBoxProps.left,
            top: cts.outputBoxProps.top,
            vi: true,
            keys: true,
        });
        // Widget collection which forms the Command panel.
        this._container = blessed.box({
            name: 'container', 
            label: 'History', 
            parent: this._screen,
            scrollable: true,
            border: {
                type: 'line'
            },
            style: cts.CommandPanelProps.style,

            height: cts.CommandPanelProps.height,
            width: cts.CommandPanelProps.width,
        
            top: cts.CommandPanelProps.top,
            left: '0%',
        
            alwaysScroll: true,
            scrollbar: {
                ch: ' ',
                inverse: true
            }
        });
        
        //let historyBoxData = 
        this._historyBox = blessed.log({
            name: 'historyBox', 
            parent: this._container,
            scrollable: true,
            // Possibly support:
            // align: 'center',
            style: cts.CommandPanelProps.historyBoxProps.style,
            //alwaysScroll: true,
            scrollbar: {
                ch: ' ',
                inverse: true
            },
            inputOnFocus: false,
            vi: true,
            tags: true,
            keys: true
        });
        
        this._hbox_inbox_divider = blessed.line({
            parent: this._container,
            orientation: 'horizontal',
            bottom: 1
        });
        
        this._inputBox = blessed.Textbox({
            name: 'inputBox', 
            parent: this._container,
            // Possibly support:
            // align: 'center',
            style: cts.CommandPanelProps.inputBoxProps.style,
            inputOnFocus: false,
            bottom: 0,
            left: 0,
            height: 1,
            tags: true,
            keys: true
        });
        
        this._errorMessage = blessed.message({
            parent: this._screen,
            border: 'line',
            height: 'shrink',
            width: 'half',
            top: 'center',
            left: 'center',
            label: ' {red-fg}gdb Output{/red-fg} ',
            tags: true,
            keys: true,
            hidden: true,
            alwaysScroll: true,
            vi: true
        });

    }

    set_cursor_row(lineNo: number) {
        this._editor.selection.setHeadPosition(new Point(lineNo, 0));
    }
    update_editor_row(info: utils.CurrentLineInfo) {
        const currentFile = this._editor.textBuf.getPath();
        if(currentFile != info.file) {
            let opening = this._editor.open(info.file);
            opening.then(out => this.set_cursor_row(info.line-1));
        } else {
            this.set_cursor_row(info.line-1);
        }
    }

    update_editor_bpoints(bps) {
        const currentFile = this._editor.textBuf.getPath();
        const param = this._editor.getOpenParams;
        this._editor.rowMarkers = {}
        for (const bp of bps) {
            if(bp.file == currentFile) {
                if (bp.enabled) {
                    this._editor.rowMarkers[bp.line - 1] = ''
                }
            }
        }

        this._editor._updateContent()
    }


}

