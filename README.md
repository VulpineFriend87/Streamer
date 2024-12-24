<p align="center">
    <img src="https://raw.githubusercontent.com/VulpineFriend87/SimpleEnderButt/refs/heads/master/static/images/logo.png" width="200px" height="200px">
</p>

---

# Streamer

A sleek and modern web application for streaming media content across your local network. Features a beautiful interface with smooth animations, real-time updates, and an easy-to-use admin panel.

## Features

- **Real-time Media Streaming**: Stream media content across your local network
- **Admin Panel**: Easy-to-use interface for managing media content
- **Drag & Drop Support**: Simple media upload through drag and drop
- **Modern UI**: Smooth animations and transitions
- **Network Accessible**: Can be accessed from any device on your local network

## Setup

1. Clone the repository:
```bash
git clone https://github.com/VulpineFriend87/Streamer.git
cd Streamer
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

The server will start on `0.0.0.0:5763`, making it accessible across your local network.

## Usage

### Accessing the Application

There are two main interfaces:

- **Main Interface** (`/`): Where users can view the streamed content
  - Access at: `http://<your-ip>:5763/`
  - Features real-time content updates and smooth transitions

- **Admin Panel** (`/admin`): Where you can manage media content
  - Access at: `http://<your-ip>:5763/admin`
  - Upload and manage media
  - Control what content is being streamed

Replace `<your-ip>` with your computer's local IP address (e.g., 192.168.1.100)

## Network Usage

1. Find your computer's local IP address:
   - Windows: Run `ipconfig` in Command Prompt
   - Linux/Mac: Run `ifconfig` in Terminal

2. Access from other devices:
   - Main interface: `http://<your-ip>:5763`
   - Admin panel: `http://<your-ip>:5763/admin`

3. Security Note:
   - The server is accessible to all devices on your local network
   - Avoid exposing the port to the internet without proper security measures

## Project Structure

```
Streamer/
├── app.py              # Main application file
├── requirements.txt    # Python dependencies
├── static/
│   ├── css/           # Stylesheet files
│   │   ├── admin.css  # Admin panel styles
│   │   └── index.css  # Main interface styles
│   ├── js/            # JavaScript files
│   │   ├── admin.js   # Admin panel functionality
│   │   └── index.js   # Main interface functionality
│   ├── images/        # Static images
│   ├── media/         # Uploaded media files
|   └── songs/         # Uploaded song files
└── templates/
    ├── admin.html     # Admin panel template
    └── index.html     # Main interface template
```

## Tutorial

### 1. Accessing the Application

- **Main Interface**: Open your web browser and navigate to `http://<your-ip>:5763/` to view the streamed content.
- **Admin Panel**: Access the admin panel by navigating to `http://<your-ip>:5763/admin` to manage media content.

### 2. Uploading Media

1. In the **Admin Panel**, click the **Upload** button.
2. Drag and drop your media files into the upload area or click to browse and select files from your device.
3. Once uploaded, your media will appear in the **Media List**.

### 3. Managing Media Files

- **Opening File Info**:
  - Click the three dots (`⋮`) on a media item's entry in the **Media List** to open the file info panel.
  - In the file info panel, you can preview the media, rename it, or delete it.

- **Renaming a File**:
  1. In the file info panel, click the pencil (`✏️`) icon next to the file name.
  2. Enter the new name in the input field.
  3. Click the confirm (`✔️`) icon to apply the changes.

- **Deleting a File**:
  1. In the file info panel, click the **Delete** button.
  2. Confirm the deletion when prompted to remove the file.

### 4. Selecting and Bulk Deleting Files

1. In the **Media List**, select multiple files by checking the boxes next to each desired file.
2. Once files are selected, new buttons will appear at the top of the page.
3. Click the **Delete Selected** button to remove all selected files simultaneously.
4. Confirm the deletion when prompted to finalize the action.

### 5. Real-time Updates

- Any changes made in the **Admin Panel** (such as uploading, renaming, or deleting media) will instantly reflect on the **Main Interface** without needing to refresh the page.

### 6. Accessing from Other Devices

1. Ensure your device is connected to the same local network as the server.
2. Find your computer's local IP address:
   - **Windows**: Run `ipconfig` in Command Prompt.
   - **Linux/Mac**: Run `ifconfig` in Terminal.
3. Access the application on other devices using the local IP:
   - **Main Interface**: `http://<your-ip>:5763/`
   - **Admin Panel**: `http://<your-ip>:5763/admin`

## Credits

Developed by [Vulpine](https://vulpine.pro)
