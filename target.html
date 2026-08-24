<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ekran İzleme</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0f; color: #fff; font-family: -apple-system, sans-serif; height: 100vh; display: flex; flex-direction: column; }
        .header { background: #1a1a2e; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2a2a3e; }
        .header h1 { font-size: 18px; color: #00d4ff; }
        .status { padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .status.online { background: #00ff8820; color: #00ff88; }
        .status.offline { background: #ff444420; color: #ff4444; }
        .status.waiting { background: #ffaa0020; color: #ffaa00; }
        .viewer { flex: 1; display: flex; justify-content: center; align-items: center; padding: 20px; background: #000; }
        .viewer img { max-width: 100%; max-height: 100%; border-radius: 8px; border: 1px solid #2a2a3e; }
        .info-bar { background: #1a1a2e; padding: 10px 20px; display: flex; gap: 20px; font-size: 13px; color: #888; border-top: 1px solid #2a2a3e; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📱 Ekran İzleme</h1>
        <span class="status waiting" id="status">Bekleniyor...</span>
    </div>

    <div class="viewer" id="viewer">
        <div style="text-align: center; color: #555;">
            <span style="font-size: 64px; display: block;">📵</span>
            <p>Hedef bağlantısı bekleniyor...</p>
        </div>
    </div>

    <div class="info-bar">
        <span>📡 FPS: <span id="fps">0</span></span>
        <span>📐 Çözünürlük: <span id="resolution">-</span></span>
        <span>⏱️ Gecikme: <span id="latency">-</span>ms</span>
        <span>📊 Toplam Kare: <span id="frames">0</span></span>
    </div>

    <script>
        const sessionId = window.location.pathname.split('/').pop();
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const WS_URL = `${protocol}//${window.location.host}/ws/viewer?id=${sessionId}`;

        let ws = null;
        let frameCount = 0;
        let lastFrameTime = 0;

        function connect() {
            ws = new WebSocket(WS_URL);

            ws.onopen = () => updateStatus('waiting', 'Bekleniyor...');
            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.type === 'frame') displayFrame(msg.data, msg.resolution, msg.timestamp);
            };
            ws.onclose = () => {
                updateStatus('offline', 'Bağlantı Kesildi');
                setTimeout(connect, 3000);
            };
        }

        function displayFrame(base64Data, resolution, timestamp) {
            const viewer = document.getElementById('viewer');
            viewer.innerHTML = `<img src="data:image/jpeg;base64,${base64Data}" />`;

            frameCount++;
            document.getElementById('frames').textContent = frameCount;
            document.getElementById('resolution').textContent = resolution || '-';
            document.getElementById('latency').textContent = Date.now() - timestamp;

            updateStatus('online', 'Canlı');

            const now = Date.now();
            if (lastFrameTime) {
                document.getElementById('fps').textContent = Math.round(1000 / (now - lastFrameTime));
            }
            lastFrameTime = now;
        }

        function updateStatus(type, text) {
            const status = document.getElementById('status');
            status.className = `status ${type}`;
            status.textContent = text;
        }

        connect();
    </script>
</body>
</html>
