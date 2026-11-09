"""Per-account cloud save for the OSRS-style /3d/ game (separate from the 2D game's `saves`)."""
import json, time
from flask import request, jsonify

LIMIT = 256 * 1024


def register_osave(app, db, limit, ApiError, auth):
    with app.app_context():
        db().executescript('''CREATE TABLE IF NOT EXISTS osrs_saves(
          user_id INTEGER PRIMARY KEY, data TEXT NOT NULL, updated REAL NOT NULL);''')
        db().commit()

    @app.get('/api/osrs/save')
    def osrs_get():
        a = auth()
        r = db().execute('SELECT data, updated FROM osrs_saves WHERE user_id=?', (a['user_id'],)).fetchone()
        return jsonify(username=a['username'], data=json.loads(r['data']) if r else None,
                       updated=int(r['updated']) if r else None)

    @app.put('/api/osrs/save')
    def osrs_put():
        a = auth(); limit(('osave', a['user_id']), 40, 60)
        if request.content_length and request.content_length > LIMIT + 4096:
            raise ApiError(413, 'too_large', 'Save too large')
        d = request.get_json(silent=True)
        if not isinstance(d, dict) or not isinstance(d.get('data'), dict):
            raise ApiError(400, 'bad_save', 'Expected {"data": {...}}')
        blob = json.dumps(d['data'], separators=(',', ':'))
        if len(blob.encode()) > LIMIT:
            raise ApiError(413, 'too_large', 'Save too large')
        db().execute('INSERT OR REPLACE INTO osrs_saves VALUES(?,?,?)', (a['user_id'], blob, time.time()))
        db().commit()
        return jsonify(ok=True)
