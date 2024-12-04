# Code by Vulpine (https://vulpine.pro) and licensed under the MIT license

from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['UPLOAD_FOLDER'] = './uploads'
socketio = SocketIO(app)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

current_media = {'filename': None}

def allowed_file(filename):
    return filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'files[]' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        files = request.files.getlist('files[]')
        uploaded_files = []

        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                uploaded_files.append(filename)

        return jsonify({'success': True, 'files': uploaded_files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/media')
def get_media_list():
    files = []
    for filename in os.listdir(app.config['UPLOAD_FOLDER']):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            files.append(filename)
    return jsonify({
        'files': files,
        'current': current_media
    })

@app.route('/media/<path:filename>')
def serve_media(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/select_media', methods=['POST'])
def select_media():
    global current_media
    data = request.get_json()
    current_media['filename'] = data.get('filename')
    socketio.emit('media_changed', {'filename': current_media['filename']})
    return jsonify({'success': True})

@app.route('/delete_media', methods=['POST'])
def delete_media():
    try:
        data = request.get_json()
        filenames = data.get('filenames', [])
        
        for filename in filenames:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                
                if current_media['filename'] == filename:
                    current_media['filename'] = None
                    socketio.emit('media_changed', {'filename': None})
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/media_list')
def media_list():
    try:
        files = []
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            if allowed_file(filename):
                files.append(filename)
        return jsonify(files)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/current_media')
def get_current_media():
    return jsonify({'filename': current_media['filename']})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5763, debug=True)
