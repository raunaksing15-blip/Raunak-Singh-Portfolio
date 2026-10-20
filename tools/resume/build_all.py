"""Rebuild every resume file from content/profile.json:  python3 tools/resume/build_all.py"""
import subprocess, sys, pathlib
here = pathlib.Path(__file__).resolve().parent
for s in ("build_designed.py", "build_ats.py", "build_docx_txt.py"):
    subprocess.run([sys.executable, str(here / s)], check=True, cwd=here)
print("Resume files rebuilt in src/assets/")
