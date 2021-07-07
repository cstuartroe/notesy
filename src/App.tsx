import React, { Component } from "react";
import ReactDOM from "react-dom";
import SheetMusic from 'react-sheet-music';

import "../static/scss/main.scss";
import OptionsChooser, { Option, OptionsMenuInfo, menuInfo } from "./Options";
import {
  keyEventCodes,
  toAbcCluster,
  randElem,
  startingNote,
  RawMidiMessage,
  MidiMessage,
  NoteCluster,
  playableKey,
  toMidiNumber,
  inKeyAccidental,
  randInt,
  eqSet,
} from "./constants";

const defaultMenuValues: {[K in keyof typeof menuInfo]: (typeof menuInfo)[K]['options'][0]['value']} = {
  noteRange: menuInfo.noteRange.options[0].value,
  keyPossibilities: menuInfo.keyPossibilities.options[0].value,
  noteDurations: menuInfo.noteDurations.options[0].value,
  maxVoices: menuInfo.maxVoices.options[0].value,
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
  clusters: NoteCluster[],
  position: number,
  showTable: boolean,
  keysPressed: number,
  correctPresses: number,
  startTime: number,
  finishTime: number | null,
  connectionError: boolean,
  currentlyPressedMidiNumbers: Set<number>,
} & typeof defaultMenuValues;

class App extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      inputs: [],
      key: "C",
      clusters: [],
      position: 0,
      showTable: false,
      keysPressed: 0,
      correctPresses: 0,
      startTime: 0,
      finishTime: null,
      connectionError: false,
      currentlyPressedMidiNumbers: new Set(),
      ...defaultMenuValues,
    };
  }

  componentDidMount() {
    this.setupInputs();
    this.restart();
  }

  restart() {
    this.setState({
      key: this.randKey(),
      startTime: Date.now(),
      position: 0,
      keysPressed: 0,
      correctPresses: 0,
      finishTime: null,
    }, this.createNotes.bind(this));
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
    if (messageInfo == null || this.state.finishTime != null) { return; }

    let { keysPressed, currentlyPressedMidiNumbers } = this.state;

    if (messageInfo.eventType === "NOTE_ON") {
      keysPressed += 1;
      currentlyPressedMidiNumbers.add(messageInfo.noteNumber);
    } else if (messageInfo.eventType == "NOTE_OFF") {
      currentlyPressedMidiNumbers.delete(messageInfo.noteNumber);
    }

    this.setState({keysPressed, currentlyPressedMidiNumbers}, this.checkIfContinue.bind(this));
  }

  checkIfContinue() {
    let { clusters, currentlyPressedMidiNumbers, correctPresses, position } = this.state;

    const currentClusterMidiNumbers: Set<number> = new Set(clusters[position].notes.map(note => toMidiNumber(note)));
    const correctNotesPressed = eqSet(currentClusterMidiNumbers, currentlyPressedMidiNumbers);

    if (correctNotesPressed) {
      this.setState({
        correctPresses: correctPresses + currentClusterMidiNumbers.size,
        position: position + 1,
        finishTime: position + 1 >= clusters.length ? Date.now() : null,
        currentlyPressedMidiNumbers: new Set(),
      })
    }
  }

  interpretMessage(message: RawMidiMessage): MidiMessage | null {
    if (!(message.data[0] in keyEventCodes)) { return null; }

    return {
      eventType: keyEventCodes[message.data[0]],
      noteNumber: message.data[1],
      velocity: message.data[2],
      timestamp: Math.floor(message.timeStamp)
    }
  }

  randKey() {
    return randElem(this.state.keyPossibilities);
  }

  createNotes() {
    const clusters: NoteCluster[] = [];
    let beatsElapsed = 0;

    let lastCluster = this.randomCluster();
    clusters.push(lastCluster);
    beatsElapsed += lastCluster.duration;

    while (beatsElapsed < pieceLength) {
      let cluster = this.nextCluster(lastCluster);
      if (cluster.duration <= 4 - (beatsElapsed % 4)) {
        clusters.push(cluster);
        lastCluster = cluster;
        beatsElapsed += cluster.duration;
      }
    }

    this.setState({clusters})
  }

  bottomPitch() {
    return startingNote(this.state.noteRange);
  }

  topPitch() {
    return startingNote(this.state.noteRange) + this.state.noteRange;
  }

  adjustPitch(pitch: number, otherPitches: Set<number>) {
    pitch = Math.max(pitch, this.bottomPitch(), Math.max(...Array.from(otherPitches)) - 7);
    pitch = Math.min(pitch, this.topPitch() - 1, Math.min(...Array.from(otherPitches)) + 7);
    return pitch;
  }

  inKeyNotes(pitches: Set<number>) {
    return Array.from(pitches).map(pitch => ({
      pitch,
      accidental: inKeyAccidental(this.state.key, pitch),
    }));
  }

  randomCluster(): NoteCluster {
    const { maxVoices, noteDurations, noteRange } = this.state;
    const numNotes = Math.ceil(Math.pow(Math.random(), .4) * maxVoices);

    const pitches: Set<number> = new Set();
    while (pitches.size < numNotes) {
      pitches.add(this.adjustPitch(this.bottomPitch() + randInt(noteRange), pitches))
    }

    return {
      duration: randElem(noteDurations),
      notes: this.inKeyNotes(pitches),
    };
  }

  nextCluster(cluster: NoteCluster): NoteCluster {
    let { maxVoices, noteDurations, noteRange } = this.state;
    let pitches: Set<number> = new Set();
    for (let note of cluster.notes) {
      if (Math.random() < 0) { continue; }

      pitches.add(this.adjustPitch(note.pitch - 2 + randInt(5), pitches));
    }

    if (pitches.size == 0 || (pitches.size < maxVoices && Math.random() < .2)) {
      pitches.add(this.adjustPitch(this.bottomPitch() + randInt(noteRange), pitches));
    }

    return {
      duration: randElem(noteDurations),
      notes: this.inKeyNotes(pitches),
    };
  }

  getAbc() {
    let notation = "X:1\nT:Notesy\nM:4/4\nL:1/4\nK:" + this.state.key + "\n|";

    let beatsElapsed = 0;
    this.state.clusters.map((cluster, i) => {
      if (i === this.state.position) { notation += "!wedge!"; }
      notation += toAbcCluster(cluster, this.state.key);
      beatsElapsed += cluster.duration;
      if ((beatsElapsed % 4 === 0)) {
        notation += "|";
      }
      if (beatsElapsed % 16 === 0) {
        notation += " \n";
        if (i + 1 < this.state.clusters.length) {
          notation += "|";
        }
      }
    });

    return notation;
  }

  optionsChooser(field: keyof typeof defaultMenuValues) {
    type T = (typeof defaultMenuValues)[typeof field];

    const current: T = this.state[field];
    const options: OptionsMenuInfo<T> = menuInfo[field];
    const update = (p: T) => {
      this.setState({...this.state, [field]: p}, this.restart.bind(this));
    }

    return OptionsChooser<T>({current, options, update});
  }


  completionSummary() {
    if (this.state.finishTime == null) { return null; }

    let accuracy = this.state.correctPresses/this.state.keysPressed;
    let timeElapsed = (this.state.finishTime - this.state.startTime);
    let averageBeatTime = Math.floor(timeElapsed/pieceLength)/1000;
    let score = Math.floor((1/(1.1 - accuracy))*(1/averageBeatTime)*100);

    return (
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
    );
  }


  render() {
    return (
      <div id="app" className="container">
        <div className="row"><div className="col-12">
          <SheetMusic notation={this.getAbc()}/>
        </div></div>

        {this.completionSummary()}

        {this.state.connectionError ?
          <p>Notesy can't gain access to your MIDI inputs right now. Make sure you are using Google Chrome
          and connecting to Notesy over an HTTPS connection.</p> : null
        }

        <div className="button" onClick={this.restart.bind(this)}>New sheet</div>

        <div className="row">
          {this.optionsChooser('noteRange')}
          {this.optionsChooser('keyPossibilities')}
          {this.optionsChooser('noteDurations')}
          {this.optionsChooser('maxVoices')}
        </div>
      </div>
    );
  }
}

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;