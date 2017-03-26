import * as _ from "lodash";
export const solarized = {
    // Actual hex colors
    base03: '#002b36',
    base02: '#073642',
    base0:  '#839496',
    base00: '#657b83',
    base01: '#586e75',
    base1:  '#93a1a1',
    base2: 	'#eee8d5',
    base3: 	'#fdf6e3',
    yellow: '#af8700',
    magenta: '#d33682',
    red: '#dc322f',
    orange: '#cb4b16',
    violet: '#6c71c4',	
    blue: '#268bd2',
    cyan: '#2aa198',
    green: '#859900',
    /* Terminal colors */
    /*
    base03: '#1c1c1c',
    base02: '#262626',
    base01: '#585858',
    base00: '#626262',
    base0: '#808080',
    base1: '#8a8a8a',
    base2: '#e4e4e4',
    base3: '#ffffd7',
    yellow: '#af8700',
    orange: '#d75f00',
    red: '#d70000',
    magenta: '#af005f',
    violet: '#5f5faf',
    blue: '#0087ff',
    cyan: '#00afaf',
    green: '#5f8700',
    */
}
export const colorScheme = {
    commandInt: solarized.violet + '-fg',
    commandText: solarized.blue + '-fg',
    resultText: solarized.base00 + '-fg',
    resultError: solarized.red + '-fg',
    breakPointLine: solarized.orange + '-bg',
    varName: solarized.red + '-fg',
    varHeader: solarized.yellow + '-fg',
    varHeaderbg: solarized.base2 + '-bg',

    screen: {
        bg: solarized.base3,
    },
    selected: {
        bg: solarized.base2,
        fg: solarized.base01,
    },
    label: {
        bg: solarized.base3,
        fg: solarized.orange,
    },
    dividerProps: {
        bg: solarized.base3,
        fg: solarized.base2,
    },
    menuBar: {
        bg: solarized.base2,
    },
    menuText: {
        bg: solarized.base2,
        fg: solarized.magenta,
    },
    menuStatus: {
        bg: solarized.base2,
        fg: solarized.base01,
    },
    border: {
        fg: solarized.base2,
        bg: solarized.base3,
    },
    focusedBorder: {
        fg: solarized.red,
        bg: solarized.base3,
    },
    editor: {
        buffer: {
            bg: solarized.base3,
            fg: solarized.base00,
        },
        gutter: {
            bg: solarized.base2,
            fg: solarized.base01,
            currentLine: `{${solarized.blue}-bg}{${solarized.base1}-fg}{bold}`,
        },
    },

    varBox: {
        text: {
            bg: solarized.base3,
            fg: solarized.base00,
        },
        bg: solarized.base3,
        fg: solarized.base01,
    },
    scrollbar: {
        bg: solarized.base2,
        fg: solarized.base2,
    },
    outputBox: {
        text: {
            bg: solarized.base3,
            fg: solarized.base00,
        },
        bg: solarized.base3,
        fg: solarized.base01,
    },
    historyBox: {
        text: {
            bg: solarized.base3,
            fg: solarized.base00,
        },
        bg: solarized.base3,
        fg: solarized.base01,
    },
    inputBox: {
        text: {
            bg: solarized.base3,
            fg: solarized.base00,
        },
        bg: solarized.base3,
        fg: solarized.base00,
    },
    helpMessage: {
        text: {
            bg: solarized.base2,
            fg: solarized.base00,
        },
        border: {
            bg: solarized.base01,
            fg: solarized.base1,
        },
        label: {
            bg: solarized.base01,
            fg: solarized.base3,
        },
        bg: solarized.base2,
        fg: solarized.base00,
    }

}


//export let multiCmds = ['define', 'commands']
export let multiCmds = {'define': '', 'commands':'-break-commands'}
//export enum Command {MI, CLI};
export enum CMDState {Final, Int}

export const screenProps = {
    style: {
        bg: colorScheme.screen.bg,
    }
}
export const dividerProps = {
    style: {
        fg: colorScheme.dividerProps.fg,
        bg: colorScheme.dividerProps.bg,
    }
}

export const menuBarProps = {
    height: 1,
    width: '100%',
    left: '0%',
    top: '0%',
    style: {
            bg: colorScheme.menuBar.bg,
        }
}
export const menuTextProps = {
    left: 0,
    style: {
            //fg: colorScheme.base0,
            bg: colorScheme.menuText.bg,
            fg: colorScheme.menuText.fg,
        },
    content: '{bold}gudb 1.0{/}',
}
export const menuStatusProps = {
    right: 0,
    style: {
            //fg: colorScheme.base0,
            fg: colorScheme.menuStatus.fg,
            bg: colorScheme.menuStatus.bg,
        }
}

export const editorProps = {
    label: 'Source',
    height: '60%',
    width: '75%',
    //left: '0%',
    //top: '5%',
    style: {
            buffer: {
                fg: colorScheme.editor.buffer.fg,
                bg: colorScheme.editor.buffer.bg,
            },
            gutter: {
                fg: colorScheme.editor.gutter.fg,
                bg: colorScheme.editor.gutter.bg,
            },
            focus: {
                border: {
                    fg: colorScheme.focusedBorder.fg,
                    bg: colorScheme.focusedBorder.bg
                },
            },
            border: {
                fg: colorScheme.border.fg,
                bg: colorScheme.border.bg
            },
            label: {
                fg: colorScheme.label.fg,
                bg: colorScheme.label.bg
            },

            //scrollbar: {
                  //bg: colorScheme.base1,
            //},
        }

}
export const varBoxProps = {
    height: '60%',
    width: '25%',
    left: '70%',
    top: '5%',
    style: {
            fg: colorScheme.varBox.text.fg,
            bg: colorScheme.varBox.text.bg,
            focus: {
                border: {
                    fg: colorScheme.focusedBorder.fg,
                    bg: colorScheme.focusedBorder.bg,
                },
            },
            border: {
                fg: colorScheme.border.fg,
                bg: colorScheme.border.bg
            },
            scrollbar: {
                  bg: colorScheme.scrollbar.bg,
                  fg: colorScheme.scrollbar.fg,
            },
            label: {
                fg: colorScheme.label.fg,
                bg: colorScheme.label.bg
            },
            selected: {
                fg: colorScheme.selected.fg,
                bg: colorScheme.selected.bg,
                bold: true,
            },

        }

}
export const outputBoxProps = {
    height: undefined,
    width: '50%',
    left: '70%',
    top: '60%',
    style: {
            fg: colorScheme.outputBox.text.fg,
            bg: colorScheme.outputBox.text.bg,
            focus: {
                border: {
                    fg: colorScheme.focusedBorder.fg,
                    bg: colorScheme.focusedBorder.bg,
                },
            },
            border: {
                fg: colorScheme.border.fg,
                bg: colorScheme.border.bg
            },
            scrollbar: {
                  bg: colorScheme.scrollbar.bg,
                  fg: colorScheme.scrollbar.fg,
            },
            label: {
                fg: colorScheme.label.fg,
                bg: colorScheme.label.bg
            },

    }
}


export const CommandPanelProps = {
    height: undefined,
    width: '50%',
    top: '60%',
    style: {
        fg: colorScheme.historyBox.text.fg,
        bg: colorScheme.historyBox.text.bg,
        focus: {
            border: {
                fg: colorScheme.focusedBorder.fg,
                bg: colorScheme.focusedBorder.bg,
            },
        },
        border: {
            fg: colorScheme.border.fg,
            bg: colorScheme.border.bg
        },
        label: {
            fg: colorScheme.label.fg,
            bg: colorScheme.label.bg
        },
    },

    historyBoxProps: {
        style: {
            fg: colorScheme.historyBox.text.fg,
            bg: colorScheme.historyBox.text.bg,
            focus: {
                border: {
                    fg: colorScheme.focusedBorder.fg,
                    bg: colorScheme.focusedBorder.bg,
                },
            },
            border: {
                fg: colorScheme.border.fg,
                bg: colorScheme.border.bg
            },
            scrollbar: {
                  bg: colorScheme.scrollbar.bg,
                  fg: colorScheme.scrollbar.fg,
            },
            label: {
                fg: colorScheme.label.fg,
                bg: colorScheme.label.bg
            },
        }
    },
    inputBoxProps: {
        height: 3,
        style: {
            fg: colorScheme.inputBox.text.fg,
            bg: colorScheme.inputBox.text.bg,
        },
        border: {
            fg: colorScheme.border.fg,
            bg: colorScheme.border.bg
        },
    }
}
export const helpMessageProps = {
    text: 
`{bold}Welcome to gudb!{/}

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
            fg: colorScheme.helpMessage.text.fg,
            bg: colorScheme.helpMessage.text.bg,
            border: {
                fg: colorScheme.helpMessage.border.fg,
                bg: colorScheme.helpMessage.border.bg
            },
            label: {
                fg: colorScheme.helpMessage.label.fg,
                bg: colorScheme.helpMessage.label.bg
            },

    }
}

export enum HistoryBoxState {
    Idle,
    ScrollingAll,
    ScrollingCustomText,
}

export const prefix: string = '>>>';

