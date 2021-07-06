import React, { Component } from "react";
import ReactDOM from "react-dom";
import SheetMusic from 'react-sheet-music';

import "../static/scss/main.scss";
import OptionsChooser, { Option, OptionsMenuInfo, menuInfo } from "./Options";
import * as constants from './constants'
import {
  MidiMessage,
  Note,
  playableKey, RawMidiMessage,
} from "./constants";

const defaultMenuValues: {[K in keyof typeof menuInfo]: (typeof menuInfo)[K]['options'][0]} = {
  noteRange: menuInfo.noteRange.options[0],
  keyPossibilities: menuInfo.keyPossibilities.options[0],
  noteDurations: menuInfo.noteDurations.options[0],
}

const pieceLength = 32;

type MidiInputDevice = {
  onmidimessage: (m: RawMidiMessage) => void
};

type MidiConnection = {
  inputs: MidiInputDevice[],
  onstatechange: () => void,
}

type State = {
  inputs: MidiInputDevice[],
  key: playableKey,
  notes: Note[],
  position: number,
  showTable: boolean,
  keysPressed: number,
  correctPresses: number,
  startTime: number,
  finishTime: number,
  finished: boolean,
  connectionError: boolean,
} & typeof defaultMenuValues;

class App extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      inputs: [],
      key: "C",
      notes: [],
      position: 0,
      showTable: false,
      keysPressed: 0,
      correctPresses: 0,
      startTime: 0,
      finishTime: 0,
      finished: false,
      connectionError: false,
      ...defaultMenuValues,
    };
  }

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
    // @ts-ignore
    navigator.requestMIDIAccess()
      .then((a: MidiConnection) => {
        a.onstatechange = () => {
          this.setState({inputs: a.inputs});
          a.inputs.forEach(input => {
            input.onmidimessage = this.onMidiMessage.bind(this);
          });
        }
        a.onstatechange();
      })
      .catch((_: any) => this.setState({connectionError: true}));
  }

  onMidiMessage(message: RawMidiMessage) {
    let messageInfo = this.interpretMessage(message);
    if (messageInfo === null || this.state.finished) { return; }

    let newState: Partial<State> = {};

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

    this.setState({...this.state, ...newState});
  }

  interpretMessage(message: RawMidiMessage): MidiMessage | null {
    if (!(message.data[0] in constants.keyEventCodes)) { return null; }

    return {
      eventType: constants.keyEventCodes[message.data[0]],
      pitch: message.data[1],
      velocity: message.data[2],
      timestamp: Math.floor(message.timeStamp)
    }
  }

  toStandardPitch(pitch: number): number {
    let octave = Math.floor(pitch/7) + 3;
    let inC = octave*12 + constants.majorScale[pitch%7];
    let adjustment = constants.keyAdjustments[this.state.key][pitch%7];
    return inC + adjustment;
  }

  setKey() {
    let { keyPossibilities } = this.state;
    this.setState({key: constants.randelem(keyPossibilities.value)});
  }

  createNotes() {
    const notes: Note[] = [];
    let beatsElapsed = 0;
    let { noteDurations } = this.state;

    let lastNote = constants.makeNote({
      pitch: this.randomPitch(),
      duration: constants.randelem(noteDurations.value),
    });
    notes.push(lastNote);
    beatsElapsed += lastNote.duration;

    while (beatsElapsed < pieceLength) {
      let duration = Math.min(constants.randelem(noteDurations.value), 4 - (beatsElapsed % 4));
      let note = constants.makeNote({pitch: this.nextPitch(lastNote.pitch), duration});
      notes.push(note);
      lastNote = note;
      beatsElapsed += lastNote.duration;
    }

    this.setState({notes: notes})
  }

  randomPitch() {
    return constants.startingNote(this.state.noteRange.value) + constants.randrange(this.state.noteRange.value);
  }

  nextPitch(pitch: number): number {
    const choice = constants.randrange(7);
    let out = (choice >= 5) ?
        pitch - 7 + constants.randrange(15)
        :
        pitch - 2 + choice;

    let sn = constants.startingNote(this.state.noteRange.value);
    if ((out < sn) || (out >= sn + this.state.noteRange.value)) {
      return this.nextPitch(pitch);
    } else {
      return out;
    }
  }

  getAbc() {
    let notation = "X:1\nT:Notesy\nM:4/4\nL:1/4\nK:" + this.state.key + "\n|";

    let beatsElapsed = 0;
    this.state.notes.map((note, i) => {
      if (i === this.state.position) { notation += "!wedge!"; }
      notation += constants.toAbcNote(note);
      beatsElapsed += note.duration;
      if ((beatsElapsed % 4 === 0)) {
        notation += "|";
      }
      if (beatsElapsed % 16 === 0) {
        notation += " \n";
        if (i + 1 < this.state.notes.length) {
          notation += "|";
        }
      }
    });

    return notation;
  }

  optionsChooser(field: keyof typeof defaultMenuValues) {
    type T = (typeof defaultMenuValues)[typeof field]['value'];

    const current: Option<T> = this.state[field];
    const options: OptionsMenuInfo<T> = menuInfo[field];
    const update = (p: Option<T>) => {
      this.setState({...this.state, [field]: p});
      this.restart();
    }

    return <OptionsChooser {...{current, options, update}}/>;
  }


  render() {
    let accuracy = this.state.correctPresses/this.state.keysPressed;
    let timeElapsed = this.state.finishTime - this.state.startTime;
    let averageBeatTime = Math.floor(timeElapsed/pieceLength)/1000;
    let score = Math.floor((1/(1.1 - accuracy))*(1/averageBeatTime)*100);

    return (
      <div id="app" className="container">
        <div className="row"><div className="col-12">
          <SheetMusic notation={this.getAbc()}/>
        </div></div>

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
                ({averageBeatTime} seconds per beat)
              </p>
              <p>Score: {score}</p>
            </div>
        : null}

        {this.state.connectionError ?
          <p>Notesy can't gain access to your MIDI inputs right now. Make sure you are using Google Chrome
          and connecting to Notesy over an HTTPS connection.</p> : null
        }

        <div className="button" onClick={this.restart.bind(this)}>New sheet</div>

        <div className="row">
          {this.optionsChooser('noteRange')}
          {this.optionsChooser('keyPossibilities')}
          {this.optionsChooser('noteDurations')}
        </div>
      </div>
    );
  }
}

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;