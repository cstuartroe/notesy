type Accidental = "sharp" | "flat" | "natural";

type Note = {
  pitch: number,
  accidental: Accidental,
};

type NoteCluster = {
  duration: number,
  notes: Note[],
}

type RawMidiMessage = {
  data: [number, number, number],
  timeStamp: number,
}

type MidiMessage = {
  eventType: "NOTE_ON" | "NOTE_OFF",
  noteNumber: number,
  velocity: number,
  timestamp: number,
}

const getOctave = (note: Note) => Math.floor(note.pitch / 7) + 2;

const noteNames = ["C", "D", "E", "F", "G", "A", "B"];

const getNoteName = (note: Note) => noteNames[note.pitch % 7];

const abcAccidental: {[key in Accidental]: string} = {
  sharp: "^",
  flat: "_",
  natural: "",
};

const accidentalShifts: {[key in Accidental]: number} = {
  sharp: 1,
  natural: 0,
  flat: -1,
}

const playableKeys = [
  "Db",
  "Ab",
  "Eb",
  "Bb",
  "F",
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
] as const;

type playableKey = (typeof playableKeys)[number];

const keyAdjustments: {[key in playableKey]: [Accidental, Accidental, Accidental, Accidental, Accidental, Accidental, Accidental]} = {
  Db: ["natural", "flat", "flat", "natural", "flat", "flat", "flat"],
  Ab: ["natural", "flat", "flat", "natural", "natural", "flat", "flat"],
  Eb: ["natural", "natural", "flat", "natural", "natural", "flat", "flat"],
  Bb: ["natural", "natural", "flat", "natural", "natural", "natural", "flat"],
  F: ["natural", "natural", "natural", "natural", "natural", "natural", "flat"],
  C: ["natural", "natural", "natural", "natural", "natural", "natural", "natural"],
  G: ["natural", "natural", "natural", "sharp", "natural", "natural", "natural"],
  D: ["sharp", "natural", "natural", "sharp", "natural", "natural", "natural"],
  A: ["sharp", "natural", "natural", "sharp", "sharp", "natural", "natural"],
  E: ["sharp", "sharp", "natural", "sharp", "sharp", "natural", "natural"],
  B: ["sharp", "sharp", "natural", "sharp", "sharp", "sharp", "natural"]
}

function toMidiNumber(note: Note): number {
  let octave = Math.floor(note.pitch/7) + 3;
  let inC = octave*12 + majorScale[note.pitch%7];
  let adjustment = accidentalShifts[note.accidental];
  return inC + adjustment;
}

function inKeyAccidental(key: playableKey, pitch: number): Accidental {
  return keyAdjustments[key][pitch % 7];
}

const keyEventCodes: {[key: number]: MidiMessage['eventType']} = {
  128: "NOTE_OFF",
  144: "NOTE_ON",
}

const majorScale = [0, 2, 4, 5, 7, 9, 11];

function toAbcCluster(cluster: NoteCluster, key: playableKey): string {
  let out = "";

  for (const note of cluster.notes) {
    if (note.accidental != inKeyAccidental(key, note.pitch)) {
      out += abcAccidental[note.accidental];
    }

    let octave = getOctave(note);
    let noteName = getNoteName(note);

    switch(octave) {
      case 3: out += noteName + ","; break;
      case 4: out += noteName; break;
      case 5: out += noteName.toLowerCase(); break;
      case 6: out += noteName.toLowerCase() + "'"; break;
    }

    switch(cluster.duration) {
      case .5: out += "/2"; break;
      case 1: break;
      case 1.5: out += "3/2"; break;
      case 2: out += "2"; break;
      case 2.5: out += "5/2"; break;
      case 4: out += "4"; break;
    }
  }

  if (cluster.notes.length > 1) {
    out = "[" + out + "]";
  }

  return out;
}

function randInt(n: number): number {
  return Math.floor(Math.random()*n);
}

function randElem<T>(l: T[]): T {
  return l[randInt(l.length)]
}

function range(start: number, stop?: number): number[] {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }

  let out = [];
  for (let i = start; i < stop; i++) {
    out.push(i);
  }

  return out;
}

function randElems<T>(l: T[], num_elems: number): T[] {
  let indexes: Set<number> = new Set();
  while (indexes.size < num_elems) {
    indexes.add(randInt(l.length));
  }

  return Array.from(indexes).map(i => l[i]);
}

const startingNote = (noteRange: number) => 20 - ((noteRange-1)/2);

function eqSet<T>(as: Set<T>, bs: Set<T>) {
  if (as.size !== bs.size) return false;
  for (let a of Array.from(as)) {
    if (!bs.has(a)) {
      return false;
    }
  }
  return true;
}

export type {
  Note,
  NoteCluster,
  RawMidiMessage,
  MidiMessage,
  playableKey
};

export {
  playableKeys,
  keyEventCodes,
  toMidiNumber,
  inKeyAccidental,
  toAbcCluster,
  randInt,
  randElem,
  randElems,
  range,
  startingNote,
  eqSet,
};
