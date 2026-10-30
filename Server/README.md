# Bramblewick server source (reference copy)

This is a copy of the login / cloud-save / chat API that runs on the VPS
(gunicorn on 127.0.0.1:5090 behind nginx, service `bramblewick-link`).
It is NOT built into the iPhone app. The live server stays on the VPS;
editing these files changes nothing there.

Excluded on purpose: databases (link.db), secret_key, .env, certs/keys,
htpasswd, logs, backups and all player data. Copied by sync-game.sh.

## Contents
- app/server.py, app/multiplayer.py, app/templates/  – the Flask app
- requirements.txt  – from the VPS venv (pip freeze)
- deploy/bramblewick-link.service – systemd unit (reference)
- deploy/nginx/*  – nginx site configs (reference; cert paths only, no keys)

## Run it locally on the Mac (test server with an empty database)
    cd ~/Desktop/Projects/Bramblewick3D/Server
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    BWL_DATA_DIR=./data-local gunicorn -w 1 -b 127.0.0.1:5090 'app.server:create_app()'
    curl http://127.0.0.1:5090/health
A new secret key and empty database are created in ./data-local (keep that
folder out of git). Real accounts/saves exist only on the VPS.
