import importlib.util
import json
import sys
import tempfile
import types
import unittest
from pathlib import Path

sys.modules.setdefault("flask", types.SimpleNamespace(request=None, jsonify=lambda **kw: kw))
path = Path(__file__).resolve().parents[1] / "Server" / "app" / "mp3d.py"
spec = importlib.util.spec_from_file_location("mp3d_under_test", path)
mp3d = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mp3d)


class SpawnTiles(unittest.TestCase):
    def test_missing_file_is_empty(self):
        self.assertEqual(mp3d.load_spawn_tiles(Path(tempfile.gettempdir()) / "no-such-spawn82.json"), [])

    def test_valid_pairs_are_kept(self):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as handle:
            json.dump([[3, 4], ["nope"], [1, 2, 3], [-1, 2]], handle)
            name = handle.name
        self.assertEqual(mp3d.load_spawn_tiles(name), [(3, 4)])

    def test_module_imports_without_the_excluded_spawn_file(self):
        self.assertIsInstance(mp3d.SPAWN_TILES, list)


if __name__ == "__main__":
    unittest.main()
