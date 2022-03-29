# from MIDI import MIDIFile
from mido import MidiFile

FILE = "static/midi/Camila_Cabello_ft._Young_Thug_-_Havana.mid"


f = MidiFile(FILE)
print(f.tracks[0])
