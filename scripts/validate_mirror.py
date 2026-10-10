#!/usr/bin/env python3
"""Read-only checks for the static mirror. No third-party Python dependencies."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
FEATURES = {f'/assets/js/{name}.js' for name in ('nav', 'method', 'globe', 'progress', 'media', 'blog', 'forms', 'services')}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}


class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.assets = []
        self.links = []
        self.scripts = []
        self.executable_inline = 0
        self.stack = []
        self.blog_cards = 0
        self.blog_hidden = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'src' in attrs:
            self.assets.append(attrs['src'])
        if tag == 'video':
            self.assets.extend(attrs[key] for key in ('poster', 'data-src') if key in attrs)
        if tag == 'source' and 'data-src' in attrs:
            self.assets.append(attrs['data-src'])
        if tag == 'link' and 'href' in attrs and attrs.get('rel') not in ('canonical', 'alternate', 'preconnect', 'dns-prefetch'):
            self.assets.append(attrs.get('href', ''))
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag == 'script':
            if 'src' in attrs:
                self.scripts.append(urlsplit(attrs['src']).path)
            elif attrs.get('type') not in ('application/ld+json', 'application/json'):
                self.executable_inline += 1
        if tag == 'li' and self.stack and 'data-blog-grid' in self.stack[-1][1]:
            self.blog_cards += 1
            self.blog_hidden += 'hidden' in attrs
        if tag not in VOID:
            self.stack.append((tag, attrs))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                return


def main():
    errors = []
    external = Counter()
    config = json.loads((ROOT / 'vercel.json').read_text())
    rewrites = {item['source']: item['destination'] for item in config['rewrites']}
    redirects = {item['source']: item['destination'] for item in config['redirects']}
    if len(rewrites) != len(config['rewrites']):
        errors.append('Duplicate Vercel rewrite source')
    for source, destination in rewrites.items():
        if not (ROOT / destination.lstrip('/')).is_file():
            errors.append(f'Missing Vercel destination: {source} -> {destination}')
    for alias, target in (('/business-diagnosis', '/ai-business-check'), ('/ai-visibility-check', '/ai-check'), ('/free-seo-check', '/seo-check')):
        for prefix in ('', '/es'):
            for suffix in ('', '.html'):
                if redirects.get(prefix + alias + suffix) != prefix + target:
                    errors.append(f'Missing canonical redirect: {prefix + alias + suffix}')

    documents = list(ROOT.rglob('*.html'))
    for path in documents:
        relative = path.relative_to(ROOT)
        text = path.read_text()
        document = Document()
        document.feed(text)
        if document.executable_inline:
            errors.append(f'{relative}: executable inline loader remains')
        if Counter(document.scripts) != Counter(FEATURES | {'/next-stability-guard.js'}):
            errors.append(f'{relative}: duplicate or unexpected script loader')
        for raw in document.assets:
            parsed = urlsplit(raw)
            if parsed.scheme in ('data', 'blob'):
                continue
            if parsed.netloc:
                external[parsed.hostname] += 1
                if parsed.hostname in ('weevolveit.com', 'www.weevolveit.com'):
                    errors.append(f'{relative}: original-host runtime asset: {raw}')
                continue
            asset = (ROOT / unquote(parsed.path).lstrip('/')) if parsed.path.startswith('/') else path.parent / unquote(parsed.path)
            if not asset.is_file():
                errors.append(f'{relative}: missing asset {raw}')
        for raw in document.links:
            parsed = urlsplit(raw)
            if parsed.netloc or parsed.scheme or not parsed.path:
                continue
            route = parsed.path.rstrip('/') or '/'
            if route == '/':
                continue
            destination = redirects.get(route, rewrites.get(route, route))
            target = ROOT / destination.lstrip('/') if destination.startswith('/') else path.parent / destination
            if not (target.is_file() or (target / 'index.html').is_file() or target.with_suffix('.html').is_file()):
                errors.append(f'{relative}: missing internal link {raw}')
        if relative.as_posix() in ('blog.html', 'es/blog.html'):
            if document.blog_cards != 103 or document.blog_hidden != 83:
                errors.append(f'{relative}: expected 103 articles with 20 initially visible; got {document.blog_cards}/{document.blog_hidden}')

    for path in (ROOT / 'assets').rglob('*.css'):
        for raw in re.findall(r'url\(([^)]+)\)', path.read_text()):
            raw = raw.strip(' \"\'')
            parsed = urlsplit(raw)
            if parsed.scheme or parsed.netloc or raw.startswith('#'):
                continue
            target = ROOT / parsed.path.lstrip('/') if parsed.path.startswith('/') else path.parent / parsed.path
            if not target.is_file():
                errors.append(f'{path.relative_to(ROOT)}: missing CSS asset {raw}')
    for path in sorted((ROOT / 'assets/js').glob('*.js')) + [ROOT / 'next-stability-guard.js']:
        result = subprocess.run(['node', '--check', str(path)], capture_output=True, text=True)
        if result.returncode:
            errors.append(result.stderr)
        if re.search(r'\bMutationObserver\b|\bsetInterval\s*\(|location\.reload\s*\(', path.read_text()):
            errors.append(f'{path.name}: prohibited observer, polling or reload')
    workflow = ROOT / '.github/workflows'
    for path in workflow.glob('*.yml'):
        if 'git push' in path.read_text() or 'contents: write' in path.read_text():
            errors.append(f'{path.name}: workflow still mutates the mirror')
    if errors:
        print('\n'.join(errors))
        raise SystemExit(1)
    print(f'PASS: {len(documents)} HTML documents; assets, routes, loaders, JS syntax and Vercel configuration.')
    print(f'External runtime media hosts: {dict(external)}')


if __name__ == '__main__':
    main()
