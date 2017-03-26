"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solarized = {
    base03: '#002b36',
    base02: '#073642',
    base0: '#839496',
    base00: '#657b83',
    base01: '#586e75',
    base1: '#93a1a1',
    base2: '#eee8d5',
    base3: '#fdf6e3',
    yellow: '#af8700',
    magenta: '#d33682',
    red: '#dc322f',
    orange: '#cb4b16',
    violet: '#6c71c4',
    blue: '#268bd2',
    cyan: '#2aa198',
    green: '#859900',
};
exports.colorScheme = {
    commandInt: exports.solarized.violet + '-fg',
    commandText: exports.solarized.blue + '-fg',
    resultText: exports.solarized.base00 + '-fg',
    resultError: exports.solarized.red + '-fg',
    breakPointLine: exports.solarized.orange + '-bg',
    varName: exports.solarized.red + '-fg',
    varHeader: exports.solarized.yellow + '-fg',
    varHeaderbg: exports.solarized.base2 + '-bg',
    screen: {
        bg: exports.solarized.base3,
    },
    selected: {
        bg: exports.solarized.base2,
        fg: exports.solarized.base01,
    },
    label: {
        bg: exports.solarized.base3,
        fg: exports.solarized.orange,
    },
    dividerProps: {
        bg: exports.solarized.base3,
        fg: exports.solarized.base2,
    },
    menuBar: {
        bg: exports.solarized.base2,
    },
    menuText: {
        bg: exports.solarized.base2,
        fg: exports.solarized.magenta,
    },
    menuStatus: {
        bg: exports.solarized.base2,
        fg: exports.solarized.base01,
    },
    border: {
        fg: exports.solarized.base2,
        bg: exports.solarized.base3,
    },
    focusedBorder: {
        fg: exports.solarized.red,
        bg: exports.solarized.base3,
    },
    editor: {
        buffer: {
            bg: exports.solarized.base3,
            fg: exports.solarized.base00,
        },
        gutter: {
            bg: exports.solarized.base2,
            fg: exports.solarized.base01,
            currentLine: `{${exports.solarized.blue}-bg}{${exports.solarized.base1}-fg}{bold}`,
        },
    },
    varBox: {
        text: {
            bg: exports.solarized.base3,
            fg: exports.solarized.base00,
        },
        bg: exports.solarized.base3,
        fg: exports.solarized.base01,
    },
    scrollbar: {
        bg: exports.solarized.base2,
        fg: exports.solarized.base2,
    },
    outputBox: {
        text: {
            bg: exports.solarized.base3,
            fg: exports.solarized.base00,
        },
        bg: exports.solarized.base3,
        fg: exports.solarized.base01,
    },
    historyBox: {
        text: {
            bg: exports.solarized.base3,
            fg: exports.solarized.base00,
        },
        bg: exports.solarized.base3,
        fg: exports.solarized.base01,
    },
    inputBox: {
        text: {
            bg: exports.solarized.base3,
            fg: exports.solarized.base00,
        },
        bg: exports.solarized.base3,
        fg: exports.solarized.base00,
    },
    helpMessage: {
        text: {
            bg: exports.solarized.base2,
            fg: exports.solarized.base00,
        },
        border: {
            bg: exports.solarized.base01,
            fg: exports.solarized.base1,
        },
        label: {
            bg: exports.solarized.base01,
            fg: exports.solarized.base3,
        },
        bg: exports.solarized.base2,
        fg: exports.solarized.base00,
    }
};
exports.multiCmds = { 'define': '', 'commands': '-break-commands' };
var CMDState;
(function (CMDState) {
    CMDState[CMDState["Final"] = 0] = "Final";
    CMDState[CMDState["Int"] = 1] = "Int";
})(CMDState = exports.CMDState || (exports.CMDState = {}));
exports.screenProps = {
    style: {
        bg: exports.colorScheme.screen.bg,
    }
};
exports.dividerProps = {
    style: {
        fg: exports.colorScheme.dividerProps.fg,
        bg: exports.colorScheme.dividerProps.bg,
    }
};
exports.menuBarProps = {
    height: 1,
    width: '100%',
    left: '0%',
    top: '0%',
    style: {
        bg: exports.colorScheme.menuBar.bg,
    }
};
exports.menuTextProps = {
    left: 0,
    style: {
        bg: exports.colorScheme.menuText.bg,
        fg: exports.colorScheme.menuText.fg,
    },
    content: '{bold}gudb 1.0{/}',
};
exports.menuStatusProps = {
    right: 0,
    style: {
        fg: exports.colorScheme.menuStatus.fg,
        bg: exports.colorScheme.menuStatus.bg,
    }
};
exports.editorProps = {
    label: 'Source',
    height: '60%',
    width: '75%',
    style: {
        buffer: {
            fg: exports.colorScheme.editor.buffer.fg,
            bg: exports.colorScheme.editor.buffer.bg,
        },
        gutter: {
            fg: exports.colorScheme.editor.gutter.fg,
            bg: exports.colorScheme.editor.gutter.bg,
        },
        focus: {
            border: {
                fg: exports.colorScheme.focusedBorder.fg,
                bg: exports.colorScheme.focusedBorder.bg
            },
        },
        border: {
            fg: exports.colorScheme.border.fg,
            bg: exports.colorScheme.border.bg
        },
        label: {
            fg: exports.colorScheme.label.fg,
            bg: exports.colorScheme.label.bg
        },
    }
};
exports.varBoxProps = {
    height: '60%',
    width: '25%',
    left: '70%',
    top: '5%',
    style: {
        fg: exports.colorScheme.varBox.text.fg,
        bg: exports.colorScheme.varBox.text.bg,
        focus: {
            border: {
                fg: exports.colorScheme.focusedBorder.fg,
                bg: exports.colorScheme.focusedBorder.bg,
            },
        },
        border: {
            fg: exports.colorScheme.border.fg,
            bg: exports.colorScheme.border.bg
        },
        scrollbar: {
            bg: exports.colorScheme.scrollbar.bg,
            fg: exports.colorScheme.scrollbar.fg,
        },
        label: {
            fg: exports.colorScheme.label.fg,
            bg: exports.colorScheme.label.bg
        },
        selected: {
            fg: exports.colorScheme.selected.fg,
            bg: exports.colorScheme.selected.bg,
            bold: true,
        },
    }
};
exports.outputBoxProps = {
    height: undefined,
    width: '50%',
    left: '70%',
    top: '60%',
    style: {
        fg: exports.colorScheme.outputBox.text.fg,
        bg: exports.colorScheme.outputBox.text.bg,
        focus: {
            border: {
                fg: exports.colorScheme.focusedBorder.fg,
                bg: exports.colorScheme.focusedBorder.bg,
            },
        },
        border: {
            fg: exports.colorScheme.border.fg,
            bg: exports.colorScheme.border.bg
        },
        scrollbar: {
            bg: exports.colorScheme.scrollbar.bg,
            fg: exports.colorScheme.scrollbar.fg,
        },
        label: {
            fg: exports.colorScheme.label.fg,
            bg: exports.colorScheme.label.bg
        },
    }
};
exports.CommandPanelProps = {
    height: undefined,
    width: '50%',
    top: '60%',
    style: {
        fg: exports.colorScheme.historyBox.text.fg,
        bg: exports.colorScheme.historyBox.text.bg,
        focus: {
            border: {
                fg: exports.colorScheme.focusedBorder.fg,
                bg: exports.colorScheme.focusedBorder.bg,
            },
        },
        border: {
            fg: exports.colorScheme.border.fg,
            bg: exports.colorScheme.border.bg
        },
        label: {
            fg: exports.colorScheme.label.fg,
            bg: exports.colorScheme.label.bg
        },
    },
    historyBoxProps: {
        style: {
            fg: exports.colorScheme.historyBox.text.fg,
            bg: exports.colorScheme.historyBox.text.bg,
            focus: {
                border: {
                    fg: exports.colorScheme.focusedBorder.fg,
                    bg: exports.colorScheme.focusedBorder.bg,
                },
            },
            border: {
                fg: exports.colorScheme.border.fg,
                bg: exports.colorScheme.border.bg
            },
            scrollbar: {
                bg: exports.colorScheme.scrollbar.bg,
                fg: exports.colorScheme.scrollbar.fg,
            },
            label: {
                fg: exports.colorScheme.label.fg,
                bg: exports.colorScheme.label.bg
            },
        }
    },
    inputBoxProps: {
        height: 3,
        style: {
            fg: exports.colorScheme.inputBox.text.fg,
            bg: exports.colorScheme.inputBox.text.bg,
        },
        border: {
            fg: exports.colorScheme.border.fg,
            bg: exports.colorScheme.border.bg
        },
    }
};
exports.helpMessageProps = {
    text: `{bold}Welcome to gudb!{/}

{underline}Usage{/}
    {bold}?{/}       Bring up help message
    {bold}C-q{/}     Quit

    {bold}C-x{/}     Focus on gdb command panel
    {bold}C-s{/}     Focus on source panel          
    {bold}C-p{/}     Focus on variables panel       
    {bold}C-o{/}     Focus on program output panel  
    {bold}C-l{/}     Focus on history log           

When focused on source panel, use the following buttons for convenient gdb commands:
    {bold}n{/}       next
    {bold}s{/}       step
    {bold}r{/}       run
    {bold}b{/}       create/delete breakpoint at current line

When focused on variable panel:
    {bold}/{/}       start searching for variable name
    {bold}enter{/}   execute search
    {bold}->{/}      Toggle to next info panel

`,
    style: {
        fg: exports.colorScheme.helpMessage.text.fg,
        bg: exports.colorScheme.helpMessage.text.bg,
        border: {
            fg: exports.colorScheme.helpMessage.border.fg,
            bg: exports.colorScheme.helpMessage.border.bg
        },
        label: {
            fg: exports.colorScheme.helpMessage.label.fg,
            bg: exports.colorScheme.helpMessage.label.bg
        },
    }
};
var HistoryBoxState;
(function (HistoryBoxState) {
    HistoryBoxState[HistoryBoxState["Idle"] = 0] = "Idle";
    HistoryBoxState[HistoryBoxState["ScrollingAll"] = 1] = "ScrollingAll";
    HistoryBoxState[HistoryBoxState["ScrollingCustomText"] = 2] = "ScrollingCustomText";
})(HistoryBoxState = exports.HistoryBoxState || (exports.HistoryBoxState = {}));
exports.prefix = '>>>';
