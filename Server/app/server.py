"""Bramblewick Link: accounts, cloud saves, hiscores and chat for Bramblewick.

Config (environment variables):
  BWL_DATA_DIR      data folder (default ./data next to this project)
  BWL_HOST/BWL_PORT bind address (default 127.0.0.1:5088)
  BWL_CORS_ORIGINS  comma list of allowed origins ("null" = file:// WKWebView)
  BWL_TOKEN_DAYS    session lifetime in days (default 30)
  BWL_XP_PER_MIN    max XP gain per skill per minute of play (default 5000)
  SECRET_KEY        optional; otherwise generated into DATA_DIR/secret_key (0600)
"""
import hashlib, hmac, json, os, re, secrets, sqlite3, threading, time
from collections import defaultdict, deque
from flask import Flask, g, jsonify, request, render_template
from werkzeug.exceptions import HTTPException
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS = ["attack", "strength", "defence", "hitpoints", "ranged", "magic", "prayer",
          "mining", "smithing", "woodcutting", "fishing", "cooking", "firemaking", "crafting",
          "farming", "thieving", "slayer"]  # last three: skills the web game has beyond the original list
MAX_XP = 200_000_000
SAVE_LIMIT = 512 * 1024
PAGE_SIZE = 25
CHAT_MAX = 200
BAD_WORDS = ["fuck", "shit", "cunt", "bitch", "nigger", "nigga", "faggot", "retard", "whore", "slut", "dick", "pussy"]
BAD_RE = re.compile("|".join(BAD_WORDS), re.I)
USER_RE = re.compile(r"^[A-Za-z0-9_ -]{3,12}$")
ph = PasswordHasher()


class RateLimiter:
    def __init__(self):
        self.hits = defaultdict(deque); self.lock = threading.Lock()

    def allow(self, key, limit, window):
        now = time.monotonic()
        with self.lock:
            q = self.hits[key]
            while q and q[0] <= now - window:
                q.popleft()
            if len(q) >= limit:
                return False
            q.append(now); return True


def load_secret(data_dir):
    if os.environ.get("SECRET_KEY"):
        return os.environ["SECRET_KEY"].encode()
    path = os.path.join(data_dir, "secret_key")
    if not os.path.exists(path):
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "w") as f:
            f.write(secrets.token_hex(32))
    os.chmod(path, 0o600)
    with open(path) as f:
        return f.read().strip().encode()


SCHEMA = """
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT UNIQUE COLLATE NOCASE NOT NULL,
  pw_hash TEXT NOT NULL, created REAL NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires REAL NOT NULL);
CREATE TABLE IF NOT EXISTS saves(user_id INTEGER PRIMARY KEY, version INTEGER NOT NULL, data TEXT NOT NULL, updated REAL NOT NULL);
CREATE TABLE IF NOT EXISTS scores(user_id INTEGER PRIMARY KEY, total_level INTEGER, combat_level INTEGER,
  total_xp INTEGER, skills TEXT NOT NULL, play_seconds INTEGER NOT NULL, updated REAL NOT NULL);
CREATE TABLE IF NOT EXISTS chat(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, username TEXT NOT NULL,
  text TEXT NOT NULL, ts REAL NOT NULL);
"""


class ApiError(Exception):
    def __init__(self, status, code, message, **extra):
        self.status, self.code, self.message, self.extra = status, code, message, extra


def create_app(data_dir=None):
    data_dir = data_dir or os.environ.get("BWL_DATA_DIR") or os.path.join(BASE, "data")
    os.makedirs(data_dir, mode=0o700, exist_ok=True)
    app = Flask(__name__)
    app.config.update(
        DB=os.path.join(data_dir, "link.db"),
        SECRET=load_secret(data_dir),
        TOKEN_TTL=float(os.environ.get("BWL_TOKEN_DAYS", "30")) * 86400,
        XP_PER_MIN=int(os.environ.get("BWL_XP_PER_MIN", "5000")),
        ORIGINS={o.strip() for o in os.environ.get(
            "BWL_CORS_ORIGINS", "null,http://localhost,http://127.0.0.1,http://localhost:5088,http://127.0.0.1:5088").split(",") if o.strip()},
        MAX_CONTENT_LENGTH=SAVE_LIMIT + 16 * 1024,
    )
    limiter = RateLimiter(); app.limiter = limiter
    with sqlite3.connect(app.config["DB"]) as c:
        c.executescript(SCHEMA); c.execute("PRAGMA journal_mode=WAL")

    def db():
        if "db" not in g:
            g.db = sqlite3.connect(app.config["DB"], timeout=10); g.db.row_factory = sqlite3.Row
        return g.db

    @app.teardown_appcontext
    def close(_):
        d = g.pop("db", None)
        if d: d.close()

    def thash(tok):
        return hmac.new(app.config["SECRET"], tok.encode(), hashlib.sha256).hexdigest()

    def ip():
        return request.remote_addr or "?"

    def body():
        d = request.get_json(silent=True)
        if not isinstance(d, dict):
            raise ApiError(400, "bad_json", "Request body must be a JSON object")
        return d

    def auth():
        h = request.headers.get("Authorization", "")
        if not h.startswith("Bearer "):
            raise ApiError(401, "unauthorized", "Missing bearer token")
        row = db().execute("SELECT s.user_id, s.expires, u.username FROM sessions s JOIN users u ON u.id=s.user_id "
                           "WHERE token_hash=?", (thash(h[7:].strip()),)).fetchone()
        if not row or row["expires"] < time.time():
            raise ApiError(401, "unauthorized", "Invalid or expired token")
        return row

    def limit(key, n, window):
        if not limiter.allow(key, n, window):
            raise ApiError(429, "rate_limited", "Too many requests, slow down")

    @app.errorhandler(ApiError)
    def api_err(e):
        return jsonify(error=e.code, message=e.message, **e.extra), e.status

    @app.errorhandler(HTTPException)
    def http_err(e):
        code = "too_large" if e.code == 413 else (e.name or "error").lower().replace(" ", "_")
        return jsonify(error=code, message=e.description), e.code

    @app.errorhandler(Exception)
    def other_err(e):
        app.logger.exception(e)
        return jsonify(error="server_error", message="Internal error"), 500

    @app.after_request
    def cors(resp):
        o = request.headers.get("Origin")
        if o and o in app.config["ORIGINS"]:
            resp.headers["Access-Control-Allow-Origin"] = o
            resp.headers["Vary"] = "Origin"
            resp.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, OPTIONS"
            resp.headers["Access-Control-Max-Age"] = "600"
        return resp

    @app.before_request
    def preflight():
        if request.method == "OPTIONS":
            return app.make_response(("", 204))

    @app.get("/")
    def index():
        db().execute("SELECT 1")
        return render_template("index.html")

    @app.get("/health")
    def health():
        db().execute("SELECT 1")
        return jsonify(ok=True, service="bramblewick-link", time=int(time.time()))

    def new_session(uid):
        tok = secrets.token_urlsafe(32)
        exp = time.time() + app.config["TOKEN_TTL"]
        db().execute("DELETE FROM sessions WHERE expires<?", (time.time(),))
        db().execute("INSERT INTO sessions VALUES(?,?,?)", (thash(tok), uid, exp)); db().commit()
        return tok, int(exp)

    @app.post("/api/register")
    def register():
        limit(("reg", ip()), 5, 3600)
        d = body(); u = str(d.get("username", "")).strip(); p = str(d.get("password", ""))
        if not USER_RE.match(u):
            raise ApiError(400, "bad_username", "Username must be 3-12 letters, numbers, spaces, _ or -")
        if BAD_RE.search(u):
            raise ApiError(400, "bad_username", "Pick a different username")
        if not 8 <= len(p) <= 128:
            raise ApiError(400, "bad_password", "Password must be 8-128 characters")
        try:
            cur = db().execute("INSERT INTO users(username,pw_hash,created) VALUES(?,?,?)", (u, ph.hash(p), time.time()))
        except sqlite3.IntegrityError:
            raise ApiError(409, "username_taken", "That username is taken")
        tok, exp = new_session(cur.lastrowid)
        return jsonify(token=tok, expires=exp, username=u), 201

    @app.post("/api/login")
    def login():
        limit(("login", ip()), 10, 300)
        d = body(); u = str(d.get("username", "")).strip(); p = str(d.get("password", ""))
        row = db().execute("SELECT id, username, pw_hash FROM users WHERE username=?", (u,)).fetchone()
        try:
            if not row: raise VerifyMismatchError()
            ph.verify(row["pw_hash"], p)
        except (VerifyMismatchError, InvalidHashError):
            raise ApiError(401, "bad_login", "Wrong username or password")
        if ph.check_needs_rehash(row["pw_hash"]):
            db().execute("UPDATE users SET pw_hash=? WHERE id=?", (ph.hash(p), row["id"]))
        tok, exp = new_session(row["id"])
        return jsonify(token=tok, expires=exp, username=row["username"])

    @app.post("/api/logout")
    def logout():
        auth()
        db().execute("DELETE FROM sessions WHERE token_hash=?", (thash(request.headers["Authorization"][7:].strip()),))
        db().commit(); return jsonify(ok=True)

    @app.get("/api/me")
    def me():
        a = auth(); return jsonify(username=a["username"])

    def apply_stats(uid, s):
        if not isinstance(s, dict) or not isinstance(s.get("skills"), dict):
            raise ApiError(400, "bad_stats", "stats.skills must be an object of skill -> xp")
        skills = {}
        for k, v in s["skills"].items():
            if k not in SKILLS: raise ApiError(400, "bad_stats", f"Unknown skill: {k}")
            if not isinstance(v, int) or isinstance(v, bool) or not 0 <= v <= MAX_XP:
                raise ApiError(400, "bad_stats", f"Bad XP for {k}")
            skills[k] = v
        play = s.get("play_seconds", 0)
        if not isinstance(play, int) or play < 0: raise ApiError(400, "bad_stats", "play_seconds must be >= 0")
        prev = db().execute("SELECT skills, play_seconds FROM scores WHERE user_id=?", (uid,)).fetchone()
        old = json.loads(prev["skills"]) if prev else {}
        old_play = prev["play_seconds"] if prev else 0
        if play < old_play: raise ApiError(422, "stats_rejected", "play_seconds went backwards")
        cap = app.config["XP_PER_MIN"] * ((play - old_play) / 60.0) + 500  # small grace
        for k in SKILLS:
            o = old.get(k, 0); n = skills.get(k, o)
            if n < o: raise ApiError(422, "stats_rejected", f"{k} XP went down")
            if n - o > cap: raise ApiError(422, "stats_rejected", f"{k} XP gain too fast for play time")
            skills[k] = n
        total_xp = sum(skills.values())
        tl = int(s.get("total_level", 0)) if isinstance(s.get("total_level", 0), int) else 0
        cl = int(s.get("combat_level", 0)) if isinstance(s.get("combat_level", 0), int) else 0
        tl = max(0, min(tl, 99 * len(SKILLS))); cl = max(0, min(cl, 126))
        db().execute("INSERT OR REPLACE INTO scores VALUES(?,?,?,?,?,?,?)",
                     (uid, tl, cl, total_xp, json.dumps(skills), play, time.time()))
        return {"total_level": tl, "combat_level": cl, "total_xp": total_xp}

    @app.get("/api/save")
    def get_save():
        a = auth()
        r = db().execute("SELECT version, data, updated FROM saves WHERE user_id=?", (a["user_id"],)).fetchone()
        if not r: return jsonify(version=0, data=None, updated=None)
        return jsonify(version=r["version"], data=json.loads(r["data"]), updated=int(r["updated"]))

    @app.put("/api/save")
    def put_save():
        a = auth(); limit(("save", a["user_id"]), 30, 60)
        if request.content_length and request.content_length > SAVE_LIMIT + 8192:
            raise ApiError(413, "too_large", "Save is over 512 KB")
        d = body()
        if "data" not in d: raise ApiError(400, "bad_save", "Missing data")
        blob = json.dumps(d["data"], separators=(",", ":"))
        if len(blob.encode()) > SAVE_LIMIT: raise ApiError(413, "too_large", "Save is over 512 KB")
        base = d.get("version")
        if not isinstance(base, int) or isinstance(base, bool) or base < 0:
            raise ApiError(400, "bad_save", "version must be the int version this save is based on (0 for new)")
        cur = db().execute("SELECT version FROM saves WHERE user_id=?", (a["user_id"],)).fetchone()
        cur_v = cur["version"] if cur else 0
        if base != cur_v and not d.get("force"):
            raise ApiError(409, "conflict", "Cloud save changed on another device", server_version=cur_v)
        result = {}
        if d.get("stats") is not None:
            result["scores"] = apply_stats(a["user_id"], d["stats"])
        new_v = cur_v + 1
        db().execute("INSERT OR REPLACE INTO saves VALUES(?,?,?,?)", (a["user_id"], new_v, blob, time.time()))
        db().commit()
        return jsonify(ok=True, version=new_v, **result)

    @app.post("/api/scores")
    def post_scores():
        a = auth(); limit(("scores", a["user_id"]), 30, 60)
        r = apply_stats(a["user_id"], body()); db().commit()
        return jsonify(ok=True, **r)

    @app.get("/api/hiscores")
    def hiscores():
        skill = request.args.get("skill", "overall").lower() or "overall"
        try: page = max(1, int(request.args.get("page", "1")))
        except ValueError: raise ApiError(400, "bad_page", "page must be a number")
        if skill != "overall" and skill not in SKILLS: raise ApiError(400, "bad_skill", "Unknown skill")
        if skill == "overall":
            sql = ("SELECT u.username, s.total_level AS level, s.total_xp AS xp FROM scores s JOIN users u ON u.id=s.user_id "
                   "ORDER BY s.total_level DESC, s.total_xp DESC, s.updated ASC LIMIT ? OFFSET ?")
        else:
            sql = (f"SELECT u.username, CAST(json_extract(s.skills,'$.{skill}') AS INTEGER) AS xp FROM scores s "
                   "JOIN users u ON u.id=s.user_id ORDER BY xp DESC, s.updated ASC LIMIT ? OFFSET ?")
        rows = db().execute(sql, (PAGE_SIZE, (page - 1) * PAGE_SIZE)).fetchall()
        out = []
        for i, r in enumerate(rows):
            e = {"rank": (page - 1) * PAGE_SIZE + i + 1, "username": r["username"], "xp": r["xp"] or 0}
            if skill == "overall": e["level"] = r["level"]
            out.append(e)
        return jsonify(skill=skill, page=page, page_size=PAGE_SIZE, entries=out)

    @app.post("/api/chat")
    def chat_send():
        a = auth()
        text = " ".join(str(body().get("text", "")).split())
        if not text: raise ApiError(400, "empty", "Message is empty")
        if len(text) > CHAT_MAX: raise ApiError(400, "too_long", f"Max {CHAT_MAX} characters")
        limit(("chat1", a["user_id"]), 1, 1)
        limit(("chat", a["user_id"]), 5, 10)
        text = BAD_RE.sub(lambda m: "*" * len(m.group()), text)
        cur = db().execute("INSERT INTO chat(user_id,username,text,ts) VALUES(?,?,?,?)",
                           (a["user_id"], a["username"], text, time.time()))
        db().execute("DELETE FROM chat WHERE id <= ?", (cur.lastrowid - 5000,))
        db().commit()
        return jsonify(id=cur.lastrowid, username=a["username"], text=text), 201

    @app.get("/api/chat")
    def chat_poll():
        limit(("poll", ip()), 120, 60)
        try: since = int(request.args.get("since", "0"))
        except ValueError: raise ApiError(400, "bad_since", "since must be a number")
        if since <= 0:
            rows = db().execute("SELECT * FROM (SELECT id,username,text,ts FROM chat ORDER BY id DESC LIMIT 50) ORDER BY id").fetchall()
        else:
            rows = db().execute("SELECT id,username,text,ts FROM chat WHERE id>? ORDER BY id LIMIT 50", (since,)).fetchall()
        msgs = [dict(id=r["id"], username=r["username"], text=r["text"], ts=int(r["ts"])) for r in rows]
        return jsonify(messages=msgs, last_id=msgs[-1]["id"] if msgs else since)

    from .multiplayer import register_multiplayer
    from werkzeug.middleware.proxy_fix import ProxyFix
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)
    register_multiplayer(app, db, limit, ApiError)
    return app


if __name__ == "__main__":
    create_app().run(host=os.environ.get("BWL_HOST", "127.0.0.1"), port=int(os.environ.get("BWL_PORT", "5088")))
