#!/usr/bin/env python3
"""Local static server that honors exact Vercel routes. No API/backend mocks."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import json

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'vercel.json').read_text())
REWRITES = {item['source']: item['destination'] for item in CONFIG['rewrites']}
REDIRECTS = {item['source']: item['destination'] for item in CONFIG['redirects']}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        url = urlsplit(self.path)
        if url.path in REDIRECTS:
            self.send_response(308)
            self.send_header('Location', REDIRECTS[url.path] + ('?' + url.query if url.query else ''))
            self.end_headers()
            return
        if url.path in REWRITES:
            self.path = REWRITES[url.path]
        super().do_GET()

    def log_message(self, *args):
        pass


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8080)
    options = parser.parse_args()
    print(f'Serving static mirror on port {options.port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', options.port), Handler).serve_forever()
