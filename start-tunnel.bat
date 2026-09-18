@echo off
REM Start ngrok tunnel
echo Starting ngrok tunnel...
ngrok http 3000 --region us
