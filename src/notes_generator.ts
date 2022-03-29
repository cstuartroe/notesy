import {
  Note,
  NoteCluster,
  inKeyAccidental,
  randInt,
  randElem,
  playableKey,
} from "./constants";


class NoteRange {
  top: number;
  bottom: number;
  size: number;

  constructor(size: number) {
    this.top = 20 - ((size-1)/2);
    this.bottom = this.top + size;
    this.size = size;
  }

  random(): number {
    return this.bottom + randInt(this.size)
  }

  contains(pitch: number) {
    return (pitch < this.top) && (pitch >= this.bottom);
  }
}

function pitchInBounds(pitch: number, otherPitches: Set<number>): boolean {
  if (pitch < Math.max(...Array.from(otherPitches)) - 7) { return false; }
  if (pitch > Math.min(...Array.from(otherPitches)) + 7) { return false; }

  return true;
}

function inKeyNotes(pitches: Set<number>, key: playableKey): Note[] {
  return Array.from(pitches).map(pitch => ({
    pitch,
    accidental: inKeyAccidental(key, pitch),
  }));
}

function randomCluster(
    maxVoices: number,
    noteDurations: number[],
    noteRange: NoteRange,
    key: playableKey,
): NoteCluster {
  const numNotes = Math.ceil(Math.pow(Math.random(), .4) * maxVoices);

  const pitches: Set<number> = new Set();
  while (pitches.size < numNotes) {
    const pitch = noteRange.random()

    if (pitchInBounds(pitch, pitches)) {
      pitches.add(pitch);
    }
  }

  return {
    duration: randElem(noteDurations),
    notes: inKeyNotes(pitches, key),
  };
}

function nextCluster(
    prevCluster: NoteCluster,
    maxVoices: number,
    noteDurations: number[],
    noteRange: NoteRange,
    key: playableKey,
): NoteCluster {
  let pitches: Set<number> = new Set();
  for (let note of prevCluster.notes) {
    if (Math.random() < 0) { continue; }

    pitches.add(this.adjustPitch(note.pitch - 2 + randInt(5), pitches));
  }

  if (pitches.size == 0 || (pitches.size < maxVoices && Math.random() < .2)) {
    pitches.add(this.adjustPitch(, pitches));
  }

  return {
    duration: randElem(noteDurations),
    notes: this.inKeyNotes(pitches),
  };
}


export function createNotes(pieceLength: number): NoteCluster[] {
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

  return clusters;
}