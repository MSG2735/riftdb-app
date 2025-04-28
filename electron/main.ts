import { app, BrowserWindow, Tray, Menu, nativeImage, session, ipcMain, globalShortcut } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';

// Disable hardware acceleration - needed for transparency in packaged app
app.disableHardwareAcceleration();

// Add command line switches for transparency
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu');
// Add high priority to help with fullscreen overlay
app.commandLine.appendSwitch('high-dpi-support', '1');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
// Track ignoring mouse events state
let isIgnoringMouseEvents = true;  // Set to true by default
// Track if overlay is shown via TAB key
let isShownViaTabKey = false;
let isTabKeyDown = false;

// Function to show the overlay
const showOverlay = () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    isShownViaTabKey = true;
  }
};

// Function to hide the overlay
const hideOverlay = () => {
  if (mainWindow && isShownViaTabKey) {
    mainWindow.hide();
    isShownViaTabKey = false;
  }
};

const createWindow = (): void => {
  try {
    // Get primary display dimensions
    const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;
    
    // Create the browser window
    mainWindow = new BrowserWindow({
      width: 600,
      height: 1280,
      frame: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false // Allow loading local resources and cross-origin requests
      },
      alwaysOnTop: true,
      skipTaskbar: false, // Show in taskbar for production builds
      hasShadow: false,
      x: width - 620, // Position 620px right to the right edge
      y: 75, // Position 75px down from the top
      show: false, // Don't show until fully loaded
      backgroundColor: '#00000000', // Transparent background color
      // Additional properties for fullscreen compatibility
      focusable: false, // Prevents window from stealing focus
      fullscreenable: false // Prevents accidental fullscreen
    });

    // Set window to stay on top of all windows including fullscreen applications
    mainWindow.setAlwaysOnTop(true, 'screen-saver'); // Use screen-saver level which is higher than normal
    
    // Configure session to bypass certificate errors for League API
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      callback({ requestHeaders: { ...details.requestHeaders } });
    });

    // Ignore SSL certificate errors (necessary for League's local API)
    app.commandLine.appendSwitch('ignore-certificate-errors');
    
    // Load app
    let startUrl;
    if (app.isPackaged) {
      // In production, use absolute path to find the index.html
      // The path is different in packaged app
      const rendererPath = path.join(__dirname, '../renderer/index.html');
      console.log('Trying renderer path:', rendererPath);
      
      // Check if the path exists
      if (fs.existsSync(rendererPath)) {
        startUrl = `file://${rendererPath}`;
      } else {
        // Fallback paths - try different relative paths that might work in packaged app
        const fallbackPaths = [
          path.join(__dirname, 'renderer/index.html'),
          path.join(__dirname, '../../renderer/index.html'),
          path.join(process.resourcesPath, 'app/renderer/index.html'),
          path.join(process.resourcesPath, 'renderer/index.html'),
          path.join(app.getAppPath(), 'renderer/index.html')
        ];
        
        // Try each path until one exists
        for (const testPath of fallbackPaths) {
          console.log('Testing path:', testPath);
          if (fs.existsSync(testPath)) {
            startUrl = `file://${testPath}`;
            console.log('Found valid path:', testPath);
            break;
          }
        }
        
        // If still no valid path, use the default
        if (!startUrl) {
          console.warn('Could not find renderer path, using default');
          startUrl = `file://${path.join(__dirname, '../renderer/index.html')}`;
        }
      }
    } else {
      // In development, connect to the dev server
      startUrl = 'http://localhost:5173';
    }

    console.log('Loading URL:', startUrl);
    console.log('Packaged:', app.isPackaged);
    console.log('__dirname:', __dirname);
    console.log('App path:', app.getAppPath());
    console.log('Resources path:', process.resourcesPath);
    
    // Make the app visible once it's ready
    mainWindow.once('ready-to-show', () => {
      if (mainWindow) {
        // Don't show the window initially, wait for Tab key press
        // mainWindow.show();
        mainWindow.focus();
        // Explicitly set background color again after window is shown
        mainWindow.setBackgroundColor('#00000000');
        // Ensure window level is set properly after showing
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
        console.log('Window is ready but hidden waiting for Tab key');
      }
    });
    
    mainWindow.loadURL(startUrl);

    // Open the DevTools in development
    //if (!app.isPackaged) {
    //  mainWindow.webContents.openDevTools();
    //}

    // Enable click-through by default in both dev and production
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    isIgnoringMouseEvents = true;

    // Reapply on-top status when window is shown
    mainWindow.on('show', () => {
      if (mainWindow) {
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    
  } catch (error) {
    console.error('Error creating window:', error);
  }
};

const createTray = (): void => {
  try {
    // Create custom tray icon
    let iconPath: string;
    
    if (app.isPackaged) {
      iconPath = path.join(process.resourcesPath, 'assets', 'icon.ico');
      console.log('Packaged tray icon path:', iconPath);
      
      // Check if icon exists
      if (!fs.existsSync(iconPath)) {
        console.log('Icon not found at:', iconPath);
        // Try alternate location
        iconPath = path.join(__dirname, '../assets/icon.ico');
        console.log('Trying alternate path:', iconPath);
      }
    } else {
      iconPath = path.join(__dirname, '..', 'assets', 'icon.ico');
      console.log('Development tray icon path:', iconPath);
      
      // For development, if icon doesn't exist, use favicon.ico from public folder
      if (!fs.existsSync(iconPath)) {
        console.log('Icon not found in dev mode, using favicon');
        iconPath = path.join(__dirname, '..', 'public', 'favicon.ico');
      }
    }
    
    console.log('Final icon path:', iconPath);
    
    // Ensure icon exists before creating tray
    if (!fs.existsSync(iconPath)) {
      console.error('Icon file not found:', iconPath);
      // Use empty icon as fallback
      const emptyIcon = nativeImage.createEmpty();
      tray = new Tray(emptyIcon);
    } else {
      tray = new Tray(iconPath);
    }
    
    tray.setToolTip('RiftDB');
    
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Show/Hide Overlay', 
        click: () => {
          if (mainWindow) {
            if (mainWindow.isVisible()) {
              mainWindow.hide();
            } else {
              mainWindow.show();
            }
          }
        } 
      },
      { 
        label: 'Toggle Click-Through', 
        click: () => {
          if (mainWindow) {
            // Toggle the click-through state using our tracking variable
            isIgnoringMouseEvents = !isIgnoringMouseEvents;
            mainWindow.setIgnoreMouseEvents(isIgnoringMouseEvents, { forward: true });
          }
        } 
      },
      { type: 'separator' },
      { 
        label: 'Quit', 
        click: () => {
          if (mainWindow) {
            mainWindow.destroy();
          }
          app.quit();
        } 
      }
    ]);
    
    tray.setContextMenu(contextMenu);
    
    // Double-click shows/hides the overlay
    tray.on('double-click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
        }
      }
    });
  } catch (error) {
    console.error('Error creating tray:', error);
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // Set a slight delay before creating window to ensure transparency works
  setTimeout(() => {
    // Set permissions to allow loading insecure content (League API uses self-signed certs)
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ["default-src * 'unsafe-inline' 'unsafe-eval'"]
        }
      });
    });

    // We'll set up a better mechanism for detecting Tab key press/release
    // First, unregister any existing shortcuts (just to be safe)
    globalShortcut.unregisterAll();

    // Create a more robust approach for TAB key tracking
    let tabKeyTimer: NodeJS.Timeout | null = null;
    
    // Register the Tab key - this will work even when in games
    globalShortcut.register('Tab', () => {
      console.log('Tab key pressed (global shortcut)');
      
      // If we already have a timer running, clear it
      if (tabKeyTimer) {
        clearTimeout(tabKeyTimer);
        tabKeyTimer = null;
      }
      
      // Show the overlay immediately
      isTabKeyDown = true;
      showOverlay();
      
      // Set a timer to check if the key is still being held
      // This works around the lack of key-up events in globalShortcut
      tabKeyTimer = setTimeout(() => {
        console.log('Tab key timer fired - treating as key up');
        isTabKeyDown = false;
        hideOverlay();
        tabKeyTimer = null;
        
        // Re-register the shortcut which might have been missed
        // during rapid key presses
        if (!globalShortcut.isRegistered('Tab')) {
          globalShortcut.register('Tab', () => {
            isTabKeyDown = true;
            showOverlay();
          });
        }
      }, 200); // 200ms timer - adjust if needed
    });
    
    // We'll also keep the IPC handlers as a secondary mechanism
    ipcMain.on('tab-key-down', () => {
      console.log('Tab key down via IPC');
      isTabKeyDown = true;
      showOverlay();
      
      // Clear any running timer
      if (tabKeyTimer) {
        clearTimeout(tabKeyTimer);
        tabKeyTimer = null;
      }
    });
    
    ipcMain.on('tab-key-up', () => {
      console.log('Tab key up via IPC');
      isTabKeyDown = false;
      hideOverlay();
    });

    // Monitor for fullscreen applications
    const monitorFullscreen = () => {
      if (mainWindow) {
        // Get all displays
        const displays = require('electron').screen.getAllDisplays();
        
        // Check if any display has a fullscreen window
        for (const display of displays) {
          // If window becomes hidden or loses "always on top" status, reapply
          if (!mainWindow.isAlwaysOnTop()) {
            mainWindow.setAlwaysOnTop(true, 'screen-saver');
            console.log('Fullscreen detected, reapplying always-on-top');
          }
        }
      }
    };

    // Set up IPC handler for League API requests
    ipcMain.handle('fetch-league-data', async (event, endpoint) => {
      try {
        return await new Promise((resolve, reject) => {
          const url = `https://127.0.0.1:2999/liveclientdata${endpoint}`;
          
          const req = https.get(url, {
            rejectUnauthorized: false // Ignore SSL certificate errors
          }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(e);
              }
            });
          });
          
          req.on('error', (error) => {
            reject(error);
          });
          
          req.end();
        });
      } catch (error) {
        console.error('Error fetching League data:', error);
        throw error;
      }
    });

    // Add a safety timer that checks the overlay state every few seconds
    // This ensures it doesn't get stuck visible if something goes wrong
    setInterval(() => {
      if (mainWindow && mainWindow.isVisible() && !isTabKeyDown) {
        console.log('Safety timer: Tab key not pressed but overlay visible - hiding');
        hideOverlay();
      }
    }, 2000); // Check every 2 seconds

    createWindow();
    createTray();
  }, 300); // 300ms delay helps with transparency issues
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app quitting
app.on('before-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
  
  if (tray) {
    tray.destroy();
  }
}); 