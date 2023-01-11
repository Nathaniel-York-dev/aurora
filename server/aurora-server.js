const path = require('path')
const express = require('express')
const fs = require('fs');
const { networkInterfaces } = require('os');

class AuroraServer {
    constructor() {
        this.app = express()
        this.port = 3000

        this.app.use('/videos', express.static(path.join(__dirname, 'videos')))

        //CORS Allow all
        this.app.use((req, res, next) => {
            console.log('Incoming request')
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', '*')
            next()
        })

        this.features()
    }

    features() {

        this.app.get('/', (req, res) => {
            // Serve the index.html file
            res.sendFile(path.join(__dirname, 'index.html'))
        })

        this.app.get('/localAddress', (req, res) => {
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
            res.json(results["en0"][0])
        })

        this.app.get('/discover', (req, res) => {
            // return a list of videos
            const videos = fs.readdirSync(path.join(__dirname, 'videos'))
            res.json(videos)
        })

        this.app.get('/stream/:filename', (req, res) => {
            const filePath = path.join(__dirname, 'videos', req.params.filename)
            const stat = fs.statSync(filePath)
            const fileSize = stat.size
            const range = req.headers['transfer-encoding']
            if (range) {
                const parts = range.replace(/bytes=/, "").split("-")
                console.log('Parts: ', parts)
                const start = parseInt(parts[0], 10)
                const end = parts[1]
                    ? parseInt(parts[1], 10)
                    : fileSize - 1
                const chunksize = (end - start) + 1
                const file = fs.createReadStream(filePath, { start, end })
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'video/mp4',
                }
                res.writeHead(206, head)
                file.pipe(res)
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': 'video/mp4',
                }
                res.writeHead(200, head)
                fs.createReadStream(filePath).pipe(res)
            }
        })
    }

    start() {
        this.server = this.app.listen(this.port, () => {
            console.log(`Example app listening at http://localhost:${this.port}`)
        })
    }

    close() {
        this.server.close()
    }
}

module.exports = AuroraServer