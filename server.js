const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.get('/', (req, res) => {
    res.send('<h2>🎯 Screen Share Server Active</h2><p>QR oluşturmak için Python scriptini çalıştırın.</p>');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sessions = new Map();

app.get('/generate', async (req, res) => {
    const sessionId = uuidv4();
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const targetUrl = `${protocol}://${host}/s/${sessionId}`;
    
    const qrImage = await qrcode.toDataURL(targetUrl, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
    });
    
    sessions.set(sessionId, {
        id: sessionId,
        status: 'waiting',
        createdAt: new Date(),
        ws: null,
        viewerWs: null
    });
    
    res.json({
        success: true,
        sessionId,
        qrCode: qrImage,
        targetUrl,
        status: 'waiting'
    });
});

app.get('/s/:sessionId', (req, res) => {
    const session = sessions.get(req.params.sessionId);
    if (!session) return res.status(404).send('Oturum bulunamadı');
    res.sendFile(path.join(__dirname, 'target.html'));
});

app.get('/view/:sessionId', (req, res) => {
    res.sendFile(path.join(__dirname, 'viewer.html'));
});

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const sessionId = url.searchParams.get('id');
    const session = sessions.get(sessionId);

    if (pathname === '/ws/target' && session) {
        session.ws = ws;
        session.status = 'connected';
        
        ws.on('message', (data) => {
            if (session.viewerWs && session.viewerWs.readyState === WebSocket.OPEN) {
                session.viewerWs.send(data);
            }
        });
        ws.on('close', () => { session.status = 'disconnected'; });
    } else if (pathname === '/ws/viewer' && session) {
        session.viewerWs = ws;
        ws.on('close', () => { session.viewerWs = null; });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎯 Sunucu ${PORT} portunda aktif...`);
});
