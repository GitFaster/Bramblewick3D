"""Bramblewick 3D presence and chat. Backwards compatible with older /mp/3d clients.

Presence is real, expiring server sessions. Optional avatar statistics are display
metadata reported by the existing client; this relay does not change combat rules.
"""
import hashlib, json, math, secrets, time
from pathlib import Path
from flask import request, jsonify

DROP = 10
MAXP = 200
ACTIONS = {'idle', 'walk', 'run', 'attack', 'cast', 'chop', 'mine', 'fish', 'emote'}


def load_spawn_tiles(path=None):
    """Optional spacing list. Missing or unreadable files leave placement to the client."""
    path = Path(path) if path else Path(__file__).with_name('spawn82.json')
    try:
        data = json.loads(path.read_text())
    except (OSError, ValueError):
        return []
    tiles = []
    if isinstance(data, list):
        for item in data:
            if (isinstance(item, (list, tuple)) and len(item) == 2
                    and all(isinstance(n, int) and not isinstance(n, bool) and 0 <= n <= 4095 for n in item)):
                tiles.append((int(item[0]), int(item[1])))
    return tiles


SPAWN_TILES = load_spawn_tiles()


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
        columns = {r['name'] for r in db().execute('PRAGMA table_info(mp3_players)')}
        for name, definition in {'world':'INTEGER NOT NULL DEFAULT 1', 'level':'INTEGER',
                'hp':'INTEGER', 'max_hp':'INTEGER', 'action':"TEXT NOT NULL DEFAULT 'idle'",
                'gear':"TEXT NOT NULL DEFAULT '{}'"}.items():
            if name not in columns:
                db().execute('ALTER TABLE mp3_players ADD COLUMN ' + name + ' ' + definition)
        db().execute('CREATE INDEX IF NOT EXISTS mp3_presence_seen ON mp3_players(world, seen)')
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

    def metadata(d):
        level = num(d, 'level', 1, 999) if d.get('level') is not None else None
        maximum = num(d, 'max_hp', 1, 1000000) if d.get('max_hp') is not None else None
        hp = num(d, 'hp', 0, maximum or 1000000) if d.get('hp') is not None else None
        action = d.get('action', 'idle')
        if not isinstance(action, str) or action not in ACTIONS:
            raise ApiError(400, 'bad_action', 'Unsupported character action')
        gear = d.get('gear') or {}
        if not isinstance(gear, dict):
            raise ApiError(400, 'bad_gear', 'Expected equipment slots')
        clean = {}
        for k in ('head','body','legs','feet','hands','weapon','shield','cape'):
            v = gear.get(k)
            if isinstance(v, str) and len(v) <= 40 and all(c.isalnum() or c == '_' for c in v):
                clean[k] = v
        return num(d, 'world', 1, 32, 1), level, hp, maximum, action, json.dumps(clean, separators=(',', ':'))

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

    def public(row):
        return dict(id=row['id'], name=row['name'], guest=bool(row['guest']), x=row['x'], y=row['y'],
                    plane=row['plane'], facing=row['facing'], run=bool(row['run']), look=row['look'],
                    world=row['world'], level=row['level'], hp=row['hp'], max_hp=row['max_hp'],
                    action=row['action'], gear=json.loads(row['gear']))

    def presence(row):
        rows = db().execute('SELECT * FROM mp3_players WHERE world=? AND seen>? ORDER BY id',
                            (row['world'], time.time() - DROP)).fetchall()
        online = sum(r['look'].startswith('om') and r['plane'] == 0 for r in rows)
        return dict(players=[public(r) for r in rows if r['id'] != row['id']],
                    online=online, world=row['world'], self=public(row))

    @app.post('/mp/3d/join')
    def mp3_join():
        limit(('mp3_join', request.remote_addr), 30, 60)
        d = body()
        x, y, plane, facing, run, look = state(d)
        world, level, hp, maximum, action, gear = metadata(d)
        name, guest = who(d)
        now = time.time()
        db().execute('DELETE FROM mp3_players WHERE seen<?', (now - DROP,))
        if db().execute('SELECT count(*) FROM mp3_players').fetchone()[0] >= MAXP:
            db().commit()
            raise ApiError(503, 'world_full', 'World is full; try again shortly')
        assigned = False
        if d.get('new_spawn') is True and look.startswith('om') and world == 1 and plane == 0:
            occupied = {(r['x'],r['y']) for r in db().execute('SELECT x,y FROM mp3_players WHERE world=1 AND plane=0')}
            tile = None
            for spacing in (3, 2, 1):
                tile = next((p for p in SPAWN_TILES if p not in occupied and all(math.hypot(p[0]-q[0],p[1]-q[1]) >= spacing for q in occupied)), None)
                if tile:
                    break
            if tile:
                x, y = tile; assigned = True
        tok, pid = secrets.token_urlsafe(32), secrets.token_hex(6)
        db().execute('INSERT INTO mp3_players(token,id,name,guest,x,y,plane,facing,run,look,seen,world,level,hp,max_hp,action,gear) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                     (hashlib.sha256(tok.encode()).hexdigest(), pid, name, guest, x, y, plane, facing, run, look, now, world, level, hp, maximum, action, gear))
        last = db().execute('SELECT COALESCE(MAX(id),0) FROM mp3_messages').fetchone()[0]
        row = db().execute('SELECT * FROM mp3_players WHERE id=?', (pid,)).fetchone()
        result = presence(row)
        db().commit()
        return jsonify(dict(token=tok, id=pid, name=name, guest=bool(guest), since=last,
                       spawn=dict(x=x,y=y) if assigned else None, **result))

    @app.post('/mp/3d/pulse')
    def mp3_pulse():
        key, row = session()
        limit(('mp3_pulse', row['id']), 240, 60)
        d = body()
        x, y, plane, facing, run, look = state(d)
        world, level, hp, maximum, action, gear = metadata(d)
        since = num(d, 'since', 0, 2**62, 0)
        now = time.time()
        db().execute('UPDATE mp3_players SET x=?,y=?,plane=?,facing=?,run=?,look=?,seen=?,world=?,level=?,hp=?,max_hp=?,action=?,gear=? WHERE token=?',
                     (x,y,plane,facing,run,look,now,world,level,hp,maximum,action,gear,key))
        db().execute('DELETE FROM mp3_players WHERE seen<?', (now - DROP,))
        msgs = [dict(r) for r in db().execute('SELECT id,player,name,text FROM mp3_messages WHERE id>? ORDER BY id LIMIT 50', (since,))]
        row = db().execute('SELECT * FROM mp3_players WHERE token=?', (key,)).fetchone()
        result = presence(row)
        db().commit()
        return jsonify(dict(messages=msgs, **result))

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
