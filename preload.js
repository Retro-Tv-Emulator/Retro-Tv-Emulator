const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => {
      const validChannels = ['app-exit']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      }
    },
    on: (channel, func) => {
      const validChannels = ['app-ready']
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args))
      }
    },
    once: (channel, func) => {
      const validChannels = ['app-ready']
      if (validChannels.includes(channel)) {
        ipcRenderer.once(channel, (event, ...args) => func(...args))
      }
    }
  }
})

// Expose a minimal `global` shim
contextBridge.exposeInMainWorld('global', {
  process: {
    env: {
      NODE_ENV: process.env.NODE_ENV
    }
  }
})

