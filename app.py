# Code by Vulpine (https://vulpine.pro) and licensed under the MIT license

from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
import os
import yt_dlp
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['UPLOAD_FOLDER'] = './media'

socketio = SocketIO(app)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

current_media = {'filename': None}

current_song = {'filename': None, 'paused': None}

def secure_filename(filename):
    filename = ''.join(c for c in filename if c not in '<>:"/\\|?*')
    return filename

def is_secure_filename(filename):
    return filename == secure_filename(filename)

def allowed_file(filename):
    return filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))

def get_file_type(filename):
    return filename.split('.')[-1]

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

def select(filename):
    global current_media
    current_media['filename'] = filename
    socketio.emit('media_changed', {'filename': current_media['filename']})
    print(f"[Debug] Selected media: {current_media['filename']}")

@app.route('/select_media', methods=['POST'])
def select_media():
    try:
        data = request.get_json()
        filename = data.get('filename')
        select(filename)
        return jsonify({'success': True})
    except Exception as e:
        print(f"[Debug] Error selecting media: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/delete_media', methods=['POST'])
def delete_media():
    try:
        data = request.get_json()
        filenames = data.get('filenames', [])

        print(filenames)
        
        for filename in filenames:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                
                if current_media['filename'] == filename:
                    select(None)
        
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

@app.route('/rename', methods=['POST'])
def rename_file():
    try:
        data = request.get_json()
        old_name = data.get('oldName')
        new_name = data.get('newName')

        if not old_name or not new_name:
            return jsonify({'error': 'Missing required parameters'}), 400
            
        media_dir = app.config['UPLOAD_FOLDER']
        old_path = os.path.join(media_dir, old_name)
        new_path = os.path.join(media_dir, new_name)
        
        if not os.path.exists(old_path):
            return jsonify({'error': f'Source file not found: {old_path}'}), 404
            
        if os.path.exists(new_path) and old_path != new_path:
            return jsonify({'error': 'A file with this name already exists'}), 409
        
        if not is_secure_filename(new_name):
            print(f"Debug - Invalid file name: {new_name}")
            return jsonify({'error': 'File name can\'t contain < > : " / \\ | ? *'}), 400
        
        os.rename(old_path, new_path)
        time.sleep(0.5) # On some systems, the file may not be immediately available after renaming
        
        if not os.path.exists(new_path):
            return jsonify({'error': 'Renaming failed, file not found after renaming'}), 500
        
        if current_media['filename'] == old_name:
            select(new_name)
        
        file_stat = os.stat(new_path)
        file_info = {
            'name': new_name,
            'path': f'/media/{new_name}',
            'size': file_stat.st_size,
            'lastModified': file_stat.st_mtime * 1000,
            'type': get_file_type(new_name)
        }
        
        return jsonify({
            'success': True,
            'file': file_info,
            'wasSelected': current_media['filename'] == new_name
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/files')
def list_files():
    try:
        media_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media')
        files = []
        
        print(f"Debug - Media directory: {media_dir}")
        print(f"Debug - Media directory exists: {os.path.exists(media_dir)}")
        
        if os.path.exists(media_dir):
            for filename in os.listdir(media_dir):
                if allowed_file(filename):
                    file_path = os.path.join(media_dir, filename)
                    file_stat = os.stat(file_path)
                    files.append({
                        'name': filename,
                        'path': f'/media/{filename}',
                        'size': file_stat.st_size,
                        'lastModified': file_stat.st_mtime * 1000,
                        'type': filename.split('.')[-1]
                    })
                    print(f"Debug - Found file: {filename}")
        
        return jsonify(files)
    except Exception as e:
        print(f"[Debug] Error listing files: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/file_info/<filename>')
def get_file_info(filename):
    try:
        media_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media')
        file_path = os.path.join(media_dir, filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
            
        file_stat = os.stat(file_path)
        file_info = {
            'name': filename,
            'path': f'/media/{filename}',
            'size': file_stat.st_size,
            'lastModified': file_stat.st_mtime * 1000,
            'type': filename.split('.')[-1]
        }
        
        return jsonify(file_info)
    except Exception as e:
        print(f"[Debug] Error getting file info: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    socketio.run(app, host = '0.0.0.0', port = 5763, debug = True)