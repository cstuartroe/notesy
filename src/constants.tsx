type Note = {
  pitch: number,
  duration: number,
  adjustment: number,
};

type RawMidiMessage = {
  data: [number, number, number],
  timeStamp: number,
}

type MidiMessage = {
  eventType: "NOTE_ON" | "NOTE_OFF",
  pitch: number,
  velocity: number,
  timestamp: number,
}

const getOctave = (note: Note) => Math.floor(note.pitch / 7) + 2;

const noteNames = ["C", "D", "E", "F", "G", "A", "B"];

const getNoteName = (note: Note) => noteNames[note.pitch % 7];

const abcPitchAdjustment = (a: number) => (a === 0) ? "" : (a === -1) ? "_" : (a === 1) ? "^" : null;

const keyAdjustments = {
  "Db": [0, -1, -1, 0, -1, -1, -1],
  "Ab": [0, -1, -1, 0, 0, -1, -1],
  "Eb": [0, 0, -1, 0, 0, -1, -1],
  "Bb": [0, 0, -1, 0, 0, 0, -1],
  "F": [0, 0, 0, 0, 0, 0, -1],
  "C": [0, 0, 0, 0, 0, 0, 0],
  "G": [0, 0, 0, 1, 0, 0, 0],
  "D": [1, 0, 0, 1, 0, 0, 0],
  "A": [1, 0, 0, 1, 1, 0, 0],
  "E": [1, 1, 0, 1, 1, 0, 0],
  "B": [1, 1, 0, 1, 1, 1, 0]
}

type playableKey = keyof typeof keyAdjustments;
// @ts-ignore should be obvious why
const playableKeys: playableKey[] = Object.keys(keyAdjustments);

const keyEventCodes: {[key: number]: MidiMessage['eventType']} = {
  128: "NOTE_OFF",
  144: "NOTE_ON",
}

const majorScale = [0, 2, 4, 5, 7, 9, 11];

function toAbcNote(note: Note) {
  let out = abcPitchAdjustment(note.adjustment);

  let octave = getOctave(note);
  let noteName = getNoteName(note);

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

function randrange(n: number): number {
  return Math.floor(Math.random()*n);
}

function randelem<T>(l: T[]): T {
  return l[randrange(l.length)]
}

const startingNote = (noteRange: number) => 20 - ((noteRange-1)/2);

function makeNote(note: Partial<Note>): Note {
  return {
    duration: 1,
    pitch: 0,
    adjustment: 0,
    ...note,
  };
}

export type {
  Note,
  RawMidiMessage,
  MidiMessage,
  playableKey
};

export {
  noteNames,
  playableKeys,
  abcPitchAdjustment,
  keyAdjustments,
  keyEventCodes,
  majorScale,
  toAbcNote,
  randrange,
  randelem,
  startingNote,
  makeNote
};
