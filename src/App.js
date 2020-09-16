import React, { Component } from "react";
import ReactDOM from "react-dom";
import SheetMusic from 'react-sheet-music';

import "../static/scss/main.scss";

const headers = ["Event type", "Note", "Velocity"];

const noteNames = ["C", "D", "E", "F", "G", "A", "B"];

const abcPitchAdjustment = (a) => (a === 0) ? "" : (a === -1) ? "_" : (a === 1) ? "^" : null;

const keyAdjustments = {
  "F": [0, 0, 0, 0, 0, 0, -1],
  "C": [0, 0, 0, 0, 0, 0, 0],
  "G": [0, 0, 0, 1, 0, 0, 0],
  "D": [1, 0, 0, 1, 0, 0, 0],
  "A": [1, 0, 0, 1, 1, 0, 0]
}

const noteDurations = [.5, .5, 1, 1, 1, 1, 1.5, 2];

const pieceLength = 32;

const keyEventCodes = {
  128: "NOTE_OFF",
  144: "NOTE_ON"
}

const majorScale = [0, 2, 4, 5, 7, 9, 11];

function toAbcNote(note) {
  let out = abcPitchAdjustment(note.adjustment);

  let octave = Math.floor(note.pitch/7) + 2;
  let noteName = noteNames[note.pitch%7];

  switch(octave) {
    case 3: out += noteName + ","; break;
    case 4: out += noteName; break;
    case 5: out += noteName.toLowerCase(); break;
    case 6: out += noteName.toLowerCase() + "'"; break;
  }

  switch(note.duration) {
    case .5: out += "/2"; break;
    case 1: break;
    case 1.5: out += "3/2"; break;
    case 2: out += "2"; break;
    case 2.5: out += "5/2"; break;
    case 4: out += "4"; break;
  }

  return out;
}

const randrange = (n) => Math.floor(Math.random()*n);

const startingNote = (noteRange) => 20 - ((noteRange-1)/2);

function makeNote(pitch, duration=1, adjustment=0) {
  return {pitch, duration, adjustment};
}

class App extends Component {
  state = {
    inputs: [],
    messages: [],
    noteRange: 9,
    key: null,
    notes: [],
    position: null,
    showTable: false,
    keysPressed: null,
    correctPresses: null,
    startTime: null,
    finishTime: null,
    finished: false
  };

  componentDidMount() {
    this.setupInputs();
    this.restart();
  }

  restart() {
    this.setKey();
    this.createNotes();
    this.setState({
      startTime: Date.now(),
      position: 0,
      keysPressed: 0,
      correctPresses: 0,
      finished: false
    });
  }

  setupInputs() {
    navigator.requestMIDIAccess().then(a => {
      a.onstatechange = () => {
        this.setState({inputs: a.inputs});
        a.inputs.forEach(input => {
          input.onmidimessage = this.onMidiMessage.bind(this);
        });
      }
      a.onstatechange();
    });
  }

  onMidiMessage(message) {
    let messageInfo = this.interpretMessage(message);
    if (messageInfo === null || this.state.finished) { return; }

    const newState = {messages: [...this.state.messages, messageInfo]};
    if (messageInfo.eventType === "NOTE_ON") {
      newState.keysPressed = this.state.keysPressed + 1;
      let standardPitch = this.toStandardPitch(this.state.notes[this.state.position].pitch);
      if (standardPitch === messageInfo.pitch) {
        newState.correctPresses = this.state.correctPresses + 1;
        newState.position = this.state.position + 1;
        if (newState.position === this.state.notes.length) {
          newState.finished = true;
          newState.finishTime = Date.now();
        }
      }
    }

    this.setState(newState);
  }

  interpretMessage(message) {
    if (!(message.data[0] in keyEventCodes)) { return null; }

    return {
      eventType: keyEventCodes[message.data[0]],
      pitch: message.data[1],
      velocity: message.data[2],
      timeStamp: Math.floor(message.timeStamp)
    }
  }

  toStandardPitch(pitch) {
    let octave = Math.floor(pitch/7) + 3;
    let inC = octave*12 + majorScale[pitch%7];
    let adjustment = keyAdjustments[this.state.key][pitch%7];
    return inC + adjustment;
  }

  setKey() {
    let availableKeys = Object.keys(keyAdjustments);
    this.setState({key: availableKeys[randrange(availableKeys.length)]});
  }

  createNotes() {
    const notes = [];
    let beatsElapsed = 0;

    let lastNote = makeNote(this.randomPitch());
    notes.push(lastNote);
    beatsElapsed += lastNote.duration;

    while (beatsElapsed < pieceLength) {
      let duration = Math.min(noteDurations[randrange(noteDurations.length)], 4 - (beatsElapsed % 4));
      let note = makeNote(this.nextPitch(lastNote.pitch), duration);
      notes.push(note);
      lastNote = note;
      beatsElapsed += lastNote.duration;
    }

    this.setState({notes: notes})
  }

  randomPitch() {
    return startingNote(this.state.noteRange) + randrange(this.state.noteRange);
  }

  nextPitch(pitch) {
    const choice = randrange(7);
    return (choice >= 5) ?
        this.randomPitch()
        :
        pitch - 2 + choice;
  }

  getAbc() {
    let notation = "X:1\nT:Notesy\nM:4/4\nL:1/4\nK:" + this.state.key + "\n|";

    let beatsElapsed = 0;
    this.state.notes.map((note, i) => {
      if (i === this.state.position) { notation += "!wedge!"; }
      notation += toAbcNote(note);
      beatsElapsed += note.duration;
      if ((beatsElapsed % 4 === 0)) {
        notation += "|";
      }
      if (beatsElapsed % 16 === 0) {
        notation += "\n";
        if (i + 1 < this.state.notes.length) {
          notation += "|";
        }
      }
    });
    return notation;
  }

  render() {
    let noteTable = this.state.showTable ? (
        <table>
          <thead>
          <tr>
            {headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
          </thead>
          <tbody>
          {this.state.messages.map((message, i) =>
              <tr key={i}>
                <td>{message.eventType}</td>
                <td>{message.noteName}</td>
                <td>{message.timeStamp}</td>
              </tr>
          )}
          </tbody>
        </table>
    ) : null;

    let accuracy = this.state.correctPresses/this.state.keysPressed;
    let timeElapsed = this.state.finishTime - this.state.startTime;
    let averageNoteTime = Math.floor(timeElapsed/this.state.notes.length)/1000;
    let score = Math.floor((1/(1.1 - accuracy))*(1/averageNoteTime)*100);

    return (
      <div id="app">
        <SheetMusic
            notation={this.getAbc()}
        />
        {this.state.finished ?
            <div>
              <p>
                {"Correct presses: "}
                {this.state.correctPresses}/{this.state.keysPressed}{" "}
                ({Math.floor(100*accuracy)}% accuracy)
              </p>
              <p>
                {"Time elapsed: "}
                {Math.floor(timeElapsed/1000)}{" seconds "}
                ({averageNoteTime} seconds average)
              </p>
              <p>Score: {score}</p>
            </div>
        : null}
        <button onClick={this.restart.bind(this)}>New sheet</button>
        {noteTable}
      </div>
    );
  }
}

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;