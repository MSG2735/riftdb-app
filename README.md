# RiftDB

A League of Legends overlay application that displays live game stats. RiftDB sits on top of your game window showing team statistics, player performance, and game timers.

## Features

- Transparent overlay that sits on top of the League of Legends client/game
- Real-time game statistics updated every second
- Active player highlighting and detailed stats
- Team gold, kills, objectives tracking
- Player information (champion, KDA, CS, gold)
- Recent game events feed
- System tray controls for easy management
- Click-through mode for uninterrupted gameplay

## Technical Details

- **Electron**: Creates a transparent, always-on-top window that can be clicked through
- **React & TypeScript**: For building a robust UI with type safety
- **Tailwind CSS**: For styling the overlay
- **League of Legends Live Client Data API**: Connects to `https://127.0.0.1:2999/liveclientdata/allgamedata`
- **React Context**: Global state management for sharing game data across components

## Usage

1. Start League of Legends and enter a game
2. Run RiftDB
3. The overlay will automatically connect to the League of Legends client API
4. Use the system tray icon to manage the overlay:
   - Show/Hide the overlay
   - Toggle click-through mode
   - Quit the application

## Key Features Implementation

1. **Transparent Overlay**:
   - The app creates a frameless, transparent Electron window that stays on top
   - Click-through mode is enabled by default in production builds

2. **SSL Error Handling**:
   - Configured Electron to bypass SSL certificate errors when connecting to League's local API
   - Used a custom Axios instance with SSL verification disabled

3. **Real-time Data Polling**:
   - Implemented a polling system that fetches data every second
   - React Context stores and distributes the latest game data to all components