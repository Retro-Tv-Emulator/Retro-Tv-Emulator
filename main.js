const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
  })

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, './out/index.html')}`

  // Add proper CSP headers for development
  if (isDev) {
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
            "style-src 'self' 'unsafe-inline';",
            "img-src 'self' data: blob: file: http: https:;",
            "media-src 'self' data: blob: file: http: https:;"
          ].join('; ')
        }
      })
    })
  }

  mainWindow.loadURL(startUrl)

  mainWindow.webContents.on('did-finish-load', () => {
    // Send ready signal to renderer
    mainWindow.webContents.send('app-ready', true)
  })

  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
  })


  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Handle IPC messages
  ipcMain.on('app-exit', () => {
    app.quit()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle any errors that occur
process.on('uncaughtException', (error) => {
  console.error('An error occurred:', error)
})

