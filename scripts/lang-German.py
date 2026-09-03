#!/usr/bin/env python3
import subprocess
import os

if __name__ == "__main__":
    script_dir = os.path.dirname(__file__)
    gen_script = os.path.join(script_dir, "generate_wordlists.py")
    subprocess.run(["python3", gen_script], check=True)
