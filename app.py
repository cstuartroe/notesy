from flask import Flask, send_file

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


if __name__ == '__main__':
    app.run()
