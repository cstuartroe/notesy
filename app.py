from flask import Flask, send_file, request
import mido
import io
import pdb

app = Flask(__name__)


@app.route('/static/img/<filename>')
def get_img(filename):
    try:
        filepath = f'static/img/{filename}'
    except FileNotFoundError:
        return 'File Not Found'

    return send_file(filepath, mimetype='image')


@app.route('/static/js/<filename>')
def get_js(filename):
    filepath = f"static/js/{filename}"
    return send_file(filepath)


@app.route('/')
def index():
    return send_file("index.html")


@app.route('/midi_upload', methods=["POST"])
def midi_upload():
    for b in request.files["file"].read():
        print(int(b))
    # with open("tmp.mid", "wb") as fh:
    #     request.files["file"].save(fh)
    # for msg in mido.MidiFile("tmp.mid"):
    #     print(msg)


if __name__ == '__main__':
    app.run()
