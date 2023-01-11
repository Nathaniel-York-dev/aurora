const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('utils', {
    associate: (directory) => ipcRenderer.invoke('associate', directory),
    code: (address) => ipcRenderer.invoke('code', address),
    address: () => ipcRenderer.invoke('address')
})