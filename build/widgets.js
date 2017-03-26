"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require('util');
const blessed = require('blessed');
const BaseWidget = require('base-widget');
const Editor = require('editor-widget');
var Point = require('text-buffer/lib/point');
const cts = require("./constants");
class Widgets {
    constructor() {
        this._screen = blessed.screen({
            debug: false,
            autoPadding: true,
            fullUnicode: true,
            dockBorders: true,
            warnings: true,
        });
        this._layout = blessed.layout({
            parent: this._screen,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            style: cts.screenProps.style,
        });
        this._menuBar = blessed.box({
            parent: this._layout,
            top: 0,
            left: 0,
            width: cts.menuBarProps.width,
            height: cts.menuBarProps.height,
            style: cts.menuBarProps.style
        });
        this._menuText = blessed.text({
            parent: this._menuBar,
            tags: true,
            left: cts.menuTextProps.left,
            content: cts.menuTextProps.content,
            style: cts.menuTextProps.style
        });
        this._menuStatusTemplate = (statuz, search) => `help: ? | Search: ${search} | {bold}Status: ${statuz}{/}`;
        this._menuStatus = blessed.text({
            parent: this._menuBar,
            tags: true,
            right: cts.menuStatusProps.right,
            content: this._menuStatusTemplate('Not started'),
            style: cts.menuStatusProps.style
        });
        this._editor = new Editor({
            parent: this._layout,
            style: cts.editorProps.style,
            width: cts.editorProps.width,
            height: cts.editorProps.height,
            label: 'Source',
            border: {
                type: 'line'
            },
            tags: true,
        });
        this._editor.options.style['markedRow'] = `{${cts.colorScheme.breakPointLine}}`;
        this._editor.buffer.style = cts.editorProps.style.buffer;
        this._editor.gutter.style = cts.editorProps.style.gutter;
        this._editor.gutter.options.style.currentLine = cts.colorScheme.editor.gutter.currentLine;
        this._editor.readOnly(true);
        this._varBox = blessed.List({
            name: 'varBox',
            label: 'Variables',
            parent: this._layout,
            scrollable: true,
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
            vi: true,
            tags: true,
            keys: true,
        });
        this._stackBox = blessed.List({
            name: 'stackBox',
            label: 'Stack',
            parent: this._layout,
            scrollable: true,
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
            vi: true,
            tags: true,
            keys: true,
            hidden: true,
        });
        this._container = blessed.box({
            name: 'container',
            label: 'History',
            parent: this._layout,
            scrollable: true,
            border: {
                type: 'line'
            },
            style: cts.CommandPanelProps.style,
            height: cts.CommandPanelProps.height,
            width: cts.CommandPanelProps.width,
            alwaysScroll: true,
            scrollbar: {
                ch: ' ',
                inverse: true
            }
        });
        this._historyBox = blessed.log({
            name: 'historyBox',
            parent: this._container,
            scrollable: true,
            style: cts.CommandPanelProps.historyBoxProps.style,
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
            style: cts.dividerProps.style,
            orientation: 'horizontal',
            bottom: 1
        });
        this._outputBox = blessed.log({
            name: 'outputBox',
            label: 'Program output',
            parent: this._layout,
            scrollable: true,
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
            vi: true,
            keys: true,
        });
        this._inputBox = blessed.Textbox({
            name: 'inputBox',
            parent: this._container,
            style: cts.CommandPanelProps.inputBoxProps.style,
            inputOnFocus: false,
            bottom: 0,
            left: 0,
            height: 1,
            tags: true,
            keys: true
        });
        this._errorMessage = blessed.message({
            parent: this._layout,
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
        this._helpMessage = blessed.message({
            parent: this._screen,
            style: cts.helpMessageProps.style,
            border: 'line',
            height: 'shrink',
            width: 'half',
            top: 'center',
            left: 'center',
            label: 'Help',
            tags: true,
            keys: true,
            hidden: true,
            alwaysScroll: true,
            vi: true
        });
    }
    set_cursor_row(lineNo) {
        this._editor.selection.setHeadPosition(new Point(lineNo, 0));
    }
    update_editor_row(info) {
        const currentFile = this._editor.textBuf.getPath();
        if (currentFile != info.file) {
            let opening = this._editor.open(info.file);
            opening.then(out => this.set_cursor_row(info.line - 1));
        }
        else {
            this.set_cursor_row(info.line - 1);
        }
    }
    update_editor_bpoints(bps) {
        const currentFile = this._editor.textBuf.getPath();
        const param = this._editor.getOpenParams;
        this._editor.rowMarkers = {};
        for (const bp of bps) {
            if (bp.file == currentFile) {
                if (bp.enabled) {
                    this._editor.rowMarkers[bp.line - 1] = '';
                }
            }
        }
        this._editor._updateContent();
    }
}
exports.Widgets = Widgets;
