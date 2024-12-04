<p align="center">
    <img src="https://raw.githubusercontent.com/VulpineFriend87/Streamer/refs/heads/main/static/images/logo.png">
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
│   └── uploads/       # Uploaded media files
└── templates/
    ├── admin.html     # Admin panel template
    └── index.html     # Main interface template
```

## Credits

Developed by [Vulpine](https://vulpine.pro)
