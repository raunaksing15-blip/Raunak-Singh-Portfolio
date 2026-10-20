"""Loads the shared profile used by the website and all resume files."""
import json, pathlib
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ASSETS = ROOT / "src" / "assets"
PROFILE = json.loads((ROOT / "content" / "profile.json").read_text(encoding="utf-8"))
