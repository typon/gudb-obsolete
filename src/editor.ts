import Editor = require('editor-widget');
import blessed = require('blessed');

const screen = blessed.screen({smartCSR: true, title: "editor-widget example"});
const editor = new Editor({
  // normal blessed widget, use like you would any other blessed element
  parent: screen,
  top: 0,
  left: 0,
  width: '80%',
  height: '80%'
});

const filePath = './file.cpp';
editor.open(filePath);
editor.readOnly(true);
screen.key(['C-s'], (ch, key) => { editor.save(filePath); });

screen.key(['escape', 'q', 'C-c'], (ch, key) => { process.exit(0); });
screen.render();
