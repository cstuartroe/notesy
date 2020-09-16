const noteNames = ["C", "D", "E", "F", "G", "A", "B"];

const abcPitchAdjustment = (a) => (a === 0) ? "" : (a === -1) ? "_" : (a === 1) ? "^" : null;

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

export { noteNames, abcPitchAdjustment, keyAdjustments, keyEventCodes, majorScale,
         toAbcNote, randrange, startingNote, makeNote };