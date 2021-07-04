import mido

TITLE = "Camila_Cabello_ft._Young_Thug_-_Havana"
# TITLE = "For_the_Damaged_Coda"
FILENAME = f"/home/cstuartroe/Desktop/{TITLE}.mid"

mid = mido.MidiFile(FILENAME)
total_time = 0
tempo = None

for msg in mid:
    if tempo:
        print(round(1000000*total_time/tempo, 2))
    print(msg)
    total_time += msg.time
    if msg.type == "set_tempo":
        tempo = msg.tempo

# HALF_BYTE_COMMANDS = {
#     8: "NOTE_OFF",
#     9: "NOTE_ON",
#     10: "AFTERTOUCH",
#     11: "CONTROL_CHANGE",
#     12: "PROGRAM_CHANGE",
#     13: "CHANNEL_PRESSURE",
#     14: "PITCH_BEND_CHANGE",
# }
#
# # Default 2
# HALF_BYTE_ARGS = {
#     "PROGRAM_CHANGE": 1,
#     "CHANNEL_PRESSURE": 1,
# }
#
# FULL_BYTE_COMMANDS = {
#     240: "SYSTEM_EXCLUSIVE",
#     241: "TC Quarter Frame",
#     242: "Song Position Pointer",
#     243: "Song Select",
#     244: "Undefined 1",
#     245: "Undefined 2",
#     246: "Tune Request",
#     247: "End of Exclusive",
#     248: "Timing Clock",
#     249: "Undefined 3",
#     250: "Start",
#     251: "Continue",
#     252: "Stop",
#     253: "Undefined 4",
#     254: "Active Sensing",
#     255: "Reset",
# }
#
# # Default 0
# FULL_BYTE_ARGS = {
#     "TC Quarter Frame": 1,
#     "Song Position Pointer": 2,
#     "Song Select": 1,
# }
#
#
# with open(FILENAME, "rb") as fh:
#     bs = [int(b) for b in fh.read()]
#
# i = 0
#
#
# def grab_message():
#     global i
#
#     if bs[i] < 240:
#         message_type, channel = HALF_BYTE_COMMANDS[bs[i]//16], bs[i]%16
#         num_args = HALF_BYTE_ARGS.get(message_type, 2)
#         args = bs[i+1:i+1+num_args]
#         i += num_args + 1
#         return (message_type, channel, *args)
#     else:
#         message_type = FULL_BYTE_COMMANDS[bs[i]]
#         if message_type == "SYSTEM_EXCLUSIVE":
#             args = []
#             num_args = 0
#             while bs[i+1+num_args] != 247:
#                 args.append(bs[i+1+num_args])
#                 num_args += 1
#         else:
#             num_args = FULL_BYTE_ARGS.get(message_type)
#             args = bs[i+1:i+1+num_args]
#
#         i += num_args + 1
#         return (message_type, *args)
#
# print(bs)
#
# while i < len(bs):
#     print(*grab_message())
