const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

const sessions = new Map();

app.get('/', (req, res) => {
    res.send('<h2>🎯 Screen Share Server Active</h2>');
});

app.get('/generate', async (req, res) => {
    const sessionId = uuidv4();
    const targetUrl = `https://${req.get('host')}/s/${sessionId}`;
    
    sessions.set(sessionId, {
        id: sessionId,
        targetWs: null,
        viewerWs: null
    });
    
    res.json({
        success: true,
        sessionId,
        targetUrl
    });
});

app.get('/s/:sessionId', (req, res) => {
    res.sendFile(path.join(__dirname, 'target.html'));
});

app.get('/view/:sessionId', (req, res) => {
    res.sendFile(path.join(__dirname, 'viewer.html'));
});

server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, `https://${request.headers.host}`);
    const pathname = url.pathname;
    const sessionId = url.searchParams.get('id');
    const session = sessions.get(sessionId);

    if (session) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            if (pathname === '/ws/target') {
                session.targetWs = ws;
                ws.on('message', (data) => {
                    if (session.viewerWs && session.viewerWs.readyState === WebSocket.OPEN) {
                        session.viewerWs.send(data);
                    }
                });
            } else if (pathname === '/ws/viewer') {
                session.viewerWs = ws;
            }
        });
    } else {
        socket.destroy();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
