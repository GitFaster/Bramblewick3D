"""Guest presence and chat, shared across workers through SQLite."""
import hashlib
import math
import secrets
import time
from flask import request, jsonify


def register_multiplayer(app, db, limit, ApiError):
    with app.app_context():
        db().executescript('''
        CREATE TABLE IF NOT EXISTS mp_players (
          token TEXT PRIMARY KEY, id TEXT NOT NULL, name TEXT NOT NULL,
          x REAL NOT NULL, y REAL NOT NULL, moving INTEGER NOT NULL,
          action TEXT NOT NULL, seen REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS mp_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT, player TEXT NOT NULL,
          name TEXT NOT NULL, text TEXT NOT NULL, ts REAL NOT NULL);
        ''')
        db().commit()

    def body():
        value = request.get_json(silent=True)
        if not isinstance(value, dict):
            raise ApiError(400, 'bad_json', 'Expected a JSON object')
        return value

    def position(d):
        values = []
        for key, bound in [('x', 80), ('y', 70)]:
            value = d.get(key)
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not 0 <= value < bound:
                raise ApiError(400, 'bad_position', 'Position is outside the world')
            values.append(value)
        return values

    def name(d):
        value = d.get('name', 'Adventurer')
        if not isinstance(value, str):
            raise ApiError(400, 'bad_name', 'Name must be text')
        return ''.join(c for c in value if c.isalnum() or c in ' _-').strip()[:12] or 'Adventurer'

    def session():
        token = request.headers.get('X-Player-Token', '')
        if len(token) > 100:
            raise ApiError(401, 'expired', 'Rejoin the world')
        key = hashlib.sha256(token.encode()).hexdigest()
        row = db().execute('SELECT * FROM mp_players WHERE token=? AND seen>?', (key, time.time()-15)).fetchone()
        if not row:
            raise ApiError(401, 'expired', 'Rejoin the world')
        return key, row

    @app.post('/mp/join')
    def mp_join():
        limit(('mp_join', request.remote_addr), 30, 60)
        d = body()
        x, y = position(d)
        player_name = name(d)
        now = time.time()
        db().execute('DELETE FROM mp_players WHERE seen<?', (now-15,))
        if db().execute('SELECT count(*) FROM mp_players').fetchone()[0] >= 200:
            db().commit()
            raise ApiError(503, 'world_full', 'World is full; try again shortly')
        token, player_id = secrets.token_urlsafe(32), secrets.token_hex(6)
        db().execute('INSERT INTO mp_players VALUES(?,?,?,?,?,?,?,?)',
                     (hashlib.sha256(token.encode()).hexdigest(), player_id, player_name, x, y, 0, '', now))
        db().commit()
        return jsonify(token=token, id=player_id)

    @app.post('/mp/pulse')
    def mp_pulse():
        key, row = session()
        limit(('mp_pulse', row['id']), 180, 60)
        d = body()
        x, y = position(d)
        player_name = name(d)
        action = d.get('action', '')
        if action not in ('', 'Mining', 'Chopping', 'Fighting', 'Crafting'):
            action = ''
        since = d.get('since', 0)
        if isinstance(since, bool) or not isinstance(since, int) or not 0 <= since <= 9223372036854775807:
            raise ApiError(400, 'bad_cursor', 'Invalid message cursor')
        now = time.time()
        db().execute('UPDATE mp_players SET name=?,x=?,y=?,moving=?,action=?,seen=? WHERE token=?',
                     (player_name, x, y, int(d.get('moving') is True), action, now, key))
        db().execute('DELETE FROM mp_players WHERE seen<?', (now-15,))
        players = [dict(r) for r in db().execute('SELECT id,name,x,y,moving,action FROM mp_players ORDER BY id')]
        if since == 0:
            messages = [dict(r) for r in db().execute('SELECT * FROM (SELECT id,player,name,text FROM mp_messages ORDER BY id DESC LIMIT 30) ORDER BY id')]
        else:
            messages = [dict(r) for r in db().execute('SELECT id,player,name,text FROM mp_messages WHERE id>? ORDER BY id LIMIT 100', (since,))]
        db().commit()
        return jsonify(players=players, messages=messages)

    @app.post('/mp/chat')
    def mp_chat():
        key, row = session()
        limit(('mp_chat', row['id']), 5, 10)
        value = body().get('text')
        if not isinstance(value, str) or not 1 <= len(value.strip()) <= 200:
            raise ApiError(400, 'bad_message', 'Use 1–200 characters')
        db().execute('INSERT INTO mp_messages(player,name,text,ts) VALUES(?,?,?,?)',
                     (row['id'], row['name'], value.strip(), time.time()))
        db().execute('DELETE FROM mp_messages WHERE id <= (SELECT MAX(id)-500 FROM mp_messages)')
        db().commit()
        return jsonify(ok=True)

    @app.post('/mp/leave')
    def mp_leave():
        key, row = session()
        db().execute('DELETE FROM mp_players WHERE token=?', (key,))
        db().commit()
        return jsonify(ok=True)
