const { app, BrowserWindow, ipcMain } = require('electron')
const AuroraServer = require('./server/aurora-server')
const path = require('path')
const fs = require('fs')
const QrCode = require('qrcode')
const { networkInterfaces } = require('os');

let server

const createWindow = () => {
    const win = new BrowserWindow({
        with: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    ipcMain.handle('associate', (event, directory) => {
        console.log('Directory: ', directory)
        fs.symlinkSync(path.join('/Users/danielnoblecias/Documents/videos'), path.join(__dirname, 'server/videos'))
        const videos = fs.readdirSync(path.join(__dirname + '/server', 'videos')) || []
        return videos
    })

    ipcMain.handle('code', async (event, address) => {
        console.log('Address: ', address)
        const code = await QrCode.toDataURL(address, {
            scale: 5,
            color: {
                dark: '#880044',
                light: '#E64962'
            },
            width: 400,
            margin: 1
        })
        console.log('Code: ', code)
        return code
    })

    ipcMain.handle('address', () => {
        const nets = networkInterfaces();
        const results = Object.create(null);
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                if (net.family === 'IPv4' && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }
        return results["en0"][0]
    })

    win.loadFile('index.html')
    win.webContents.openDevTools()

    server = new AuroraServer()
    server.start()
    return win;
}

app.whenReady().then(() => {
    const mainWindow = createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

    app.on('window-all-closed', () => {
        server.close()
        mainWindow.removeAllListeners()
        app.quit();
    });

})