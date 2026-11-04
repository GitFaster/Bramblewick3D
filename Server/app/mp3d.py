"""Bramblewick 3D multiplayer relay: presence + chat over short polling (/mp/3d/*).

Separate tables from the 2D /mp/ world (different map size/coords). Clients POST
/mp/3d/pulse every game tick (600 ms) with their tile/facing/look and get back
everyone else plus new chat lines. Players silent for 10 s are dropped.
Polling (not WebSocket) because the iOS app reaches the server through a
WKURLSchemeHandler proxy and gunicorn runs a single sync worker.
"""
import hashlib, math, secrets, time
from flask import request, jsonify

DROP = 10      # seconds of silence before a player disappears
MAXP = 200


def register_mp3d(app, db, limit, ApiError, auth):
    with app.app_context():
        db().executescript('''
        CREATE TABLE IF NOT EXISTS mp3_players (
          token TEXT PRIMARY KEY, id TEXT NOT NULL, name TEXT NOT NULL, guest INTEGER NOT NULL,
          x INTEGER NOT NULL, y INTEGER NOT NULL, plane INTEGER NOT NULL, facing REAL NOT NULL,
          run INTEGER NOT NULL, look TEXT NOT NULL, seen REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS mp3_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT, player TEXT NOT NULL,
          name TEXT NOT NULL, text TEXT NOT NULL, ts REAL NOT NULL);
        ''')
        db().commit()

    def body():
        v = request.get_json(silent=True)
        if not isinstance(v, dict):
            raise ApiError(400, 'bad_json', 'Expected a JSON object')
        return v

    def num(d, k, lo, hi, default=None, integer=True):
        v = d.get(k, default)
        if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) or not lo <= v <= hi:
            raise ApiError(400, 'bad_' + k, k + ' out of range')
        return int(v) if integer else float(v)

    def state(d):
        look = d.get('look', '')
        look = ''.join(c for c in str(look) if c.isalnum())[:16] if isinstance(look, (str, int)) else ''
        return (num(d, 'x', 0, 4095), num(d, 'y', 0, 4095), num(d, 'plane', 0, 3, 0),
                num(d, 'facing', -10, 10, 0, integer=False), int(d.get('run') is True), look)

    def clean_name(v):
        v = v if isinstance(v, str) else ''
        return ''.join(c for c in v if c.isalnum() or c in ' _-').strip()[:12] or 'Adventurer'

    def who(d):
        try:
            return auth()['username'][:12], 0
        except ApiError:
            return clean_name(d.get('name')), 1

    def session():
        tok = request.headers.get('X-Player-Token', '')
        if not tok or len(tok) > 100:
            raise ApiError(401, 'expired', 'Rejoin the world')
        key = hashlib.sha256(tok.encode()).hexdigest()
        row = db().execute('SELECT * FROM mp3_players WHERE token=? AND seen>?', (key, time.time() - DROP)).fetchone()
        if not row:
            raise ApiError(401, 'expired', 'Rejoin the world')
        return key, row

    def others(me):
        return [dict(id=r['id'], name=r['name'], guest=bool(r['guest']), x=r['x'], y=r['y'], plane=r['plane'],
                     facing=r['facing'], run=bool(r['run']), look=r['look'])
                for r in db().execute('SELECT * FROM mp3_players WHERE id<>? ORDER BY id', (me,))]

    @app.post('/mp/3d/join')
    def mp3_join():
        limit(('mp3_join', request.remote_addr), 30, 60)
        d = body()
        x, y, plane, facing, run, look = state(d)
        name, guest = who(d)
        now = time.time()
        db().execute('DELETE FROM mp3_players WHERE seen<?', (now - DROP,))
        if db().execute('SELECT count(*) FROM mp3_players').fetchone()[0] >= MAXP:
            db().commit()
            raise ApiError(503, 'world_full', 'World is full; try again shortly')
        tok, pid = secrets.token_urlsafe(32), secrets.token_hex(6)
        db().execute('INSERT INTO mp3_players VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                     (hashlib.sha256(tok.encode()).hexdigest(), pid, name, guest, x, y, plane, facing, run, look, now))
        last = db().execute('SELECT COALESCE(MAX(id),0) FROM mp3_messages').fetchone()[0]
        db().commit()
        return jsonify(token=tok, id=pid, name=name, guest=bool(guest), since=last)

    @app.post('/mp/3d/pulse')
    def mp3_pulse():
        key, row = session()
        limit(('mp3_pulse', row['id']), 240, 60)
        d = body()
        x, y, plane, facing, run, look = state(d)
        since = num(d, 'since', 0, 2**62, 0)
        now = time.time()
        db().execute('UPDATE mp3_players SET x=?,y=?,plane=?,facing=?,run=?,look=?,seen=? WHERE token=?',
                     (x, y, plane, facing, run, look, now, key))
        db().execute('DELETE FROM mp3_players WHERE seen<?', (now - DROP,))
        msgs = [dict(r) for r in db().execute(
            'SELECT id,player,name,text FROM mp3_messages WHERE id>? ORDER BY id LIMIT 50', (since,))]
        db().commit()
        return jsonify(players=others(row['id']), messages=msgs)

    @app.post('/mp/3d/chat')
    def mp3_chat():
        key, row = session()
        limit(('mp3_chat', row['id']), 5, 10)
        t = body().get('text')
        t = ' '.join(t.split()) if isinstance(t, str) else ''
        if not 1 <= len(t) <= 120:
            raise ApiError(400, 'bad_message', 'Use 1-120 characters')
        cur = db().execute('INSERT INTO mp3_messages(player,name,text,ts) VALUES(?,?,?,?)',
                           (row['id'], row['name'], t, time.time()))
        db().execute('DELETE FROM mp3_messages WHERE id <= (SELECT MAX(id)-300 FROM mp3_messages)')
        db().commit()
        return jsonify(ok=True, id=cur.lastrowid)

    @app.post('/mp/3d/leave')
    def mp3_leave():
        key, row = session()
        db().execute('DELETE FROM mp3_players WHERE token=?', (key,))
        db().commit()
        return jsonify(ok=True)
