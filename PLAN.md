# RiftDB Development Plan

## Electron Configuration
1. Configure main window as transparent, frameless overlay
2. Set up always-on-top functionality
3. Implement system tray functionality for app control
4. Handle app lifecycle (startup, shutdown)

## League of Legends API Integration
1. Create service to fetch data from `https://127.0.0.1:2999/liveclientdata/allgamedata` 
2. Implement polling mechanism to fetch data at regular intervals
3. Add error handling for when the League client isn't running
4. Parse and transform API data for UI consumption

## User Interface
1. Design overlay layout with Tailwind CSS
2. Create components:
   - Main overlay container
   - Team stats component (gold, kills, etc)
   - Player list component
3. Implement responsive design for different resolutions
4. Add animations for stat changes

## Final Steps
1. Package the application
2. Test on different systems
3. Create installer
4. Add documentation 