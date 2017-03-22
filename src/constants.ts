
export const solarized_dark = {
    base03: '#002b36',
    base02: '#073642',
    base0:  '#839496',
    base1:  '#93a1a1',
    base01: '#586e75',
}
export const colorScheme = solarized_dark

export let colors = {
    focusedBorder: 'red'
}
export let commandIntColor = 'white-fg'
export let commandTextColor = 'blue-fg'
export let resultTextColor = 'green-fg'
export let resultErrorColor = 'red-fg'
export let breakPointLineColor = '#d7afaf-bg'
export let varNameColor = 'blue-fg'

//export let multiCmds = ['define', 'commands']
export let multiCmds = {'define': 'ree', 'commands':'-break-commands'}
//export enum Command {MI, CLI};
export enum CMDState {Final, Int}

export const editorProps = {
    label: 'Source',
    height: '60%',
    width: '70%',
    left: '0%',
    top: '0%',
    style: {
            //fg: colorScheme.base0,
            //bg: colorScheme.base03,
            focus: {
                border: {
                    fg: colors.focusedBorder
                }
            },
            //scrollbar: {
                  //bg: colorScheme.base1,
            //},
        }

}
export const varBoxProps = {
    height: '60%',
    width: '30%',
    left: '70%',
    top: '0%',
    style: {
            fg: colorScheme.base0,
            bg: colorScheme.base03,
            focus: {
                bg: colorScheme.base02,
                fg: colorScheme.base1,
                border: {
                    fg: colors.focusedBorder
                },
            },
            scrollbar: {
                  bg: colorScheme.base1,
            },

        }

}
export const outputBoxProps = {
    height: '40%',
    width: '30%',
    left: '70%',
    top: '60%',
    style: {
            fg: colorScheme.base0,
            bg: colorScheme.base03,
            focus: {
                bg: colorScheme.base02,
                fg: colorScheme.base1,
                border: {
                    fg: colors.focusedBorder
                },
            },
            scrollbar: {
                  bg: colorScheme.base1,
            },
        }

}


export const CommandPanelProps = {
    height: '40%',
    width: '70%',
    top: '60%',
    style: {
        border: {
            fg: 'white'
        }
    },

    screenProps: {
        style: {
            fg: colorScheme.base0,
            bg: colorScheme.base03,
        }
    },
    outputBoxProps: {
        style: {
            fg: colorScheme.base0,
            bg: colorScheme.base03,
            focus: {
                bg: colorScheme.base02,
                fg: colorScheme.base1,
            },
            scrollbar: {
                  bg: colorScheme.base1,
            },
        }

    },

    historyBoxProps: {
        style: {
            fg: colorScheme.base0,
            bg: colorScheme.base03,
            focus: {
                bg: colorScheme.base02,
                fg: colorScheme.base1,
            },
            scrollbar: {
                  bg: colorScheme.base1,
            },
        }

    },
    inputBoxProps: {
        height: 3,
        style: {
            bg: colorScheme.base03,
            fg: colorScheme.base0,
            focus: {
                bg: colorScheme.base02,
                fg: colorScheme.base1,
            },
        },
    }
}
export enum HistoryBoxState {
    Idle,
    ScrollingAll,
    ScrollingCustomText,
}

export const prefix: string = '>>>';
