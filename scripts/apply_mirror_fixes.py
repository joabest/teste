#!/usr/bin/env python3
"""Compatibility entrypoint: validate the consolidated mirror; never patch HTML."""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).with_name('validate_mirror.py')), run_name='__main__')
