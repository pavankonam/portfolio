"""Dependency-free checks for GitHub Pages assets, anchors and basic semantics."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import sys

ROOT = Path(__file__).resolve().parents[1]

class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.references = []
        self.errors = []
        self.h1_count = 0
        self.main_count = 0
        self.stack = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.errors.append(f"Duplicate id: {attrs['id']}")
            self.ids.add(attrs['id'])
        self.h1_count += tag == 'h1'
        self.main_count += tag == 'main'
        if tag == 'img' and not attrs.get('alt'):
            self.errors.append('Image missing descriptive alt text')
        if tag == 'a' and attrs.get('target') == '_blank' and 'noopener' not in attrs.get('rel', ''):
            self.errors.append('External tab link missing noopener')
        for key in ('src', 'href'):
            if key in attrs:
                self.references.append(attrs[key])
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
            self.stack.append(tag)
    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1] != tag:
            self.errors.append(f'Unbalanced closing tag: {tag}')
        else:
            self.stack.pop()

page = SiteParser()
page.feed((ROOT / 'index.html').read_text())
if page.stack:
    page.errors.append(f'Unclosed tags: {page.stack}')
for reference in page.references:
    url = urlsplit(reference)
    if url.scheme or url.netloc:
        continue
    if not url.path and url.fragment and unquote(url.fragment) not in page.ids:
        page.errors.append(f'Missing anchor: {reference}')
    if url.path and not (ROOT / unquote(url.path)).is_file():
        page.errors.append(f'Missing local asset: {reference}')
    if reference in ('', '#'):
        page.errors.append('Empty or placeholder link')
if page.h1_count != 1 or page.main_count != 1:
    page.errors.append('Expected exactly one h1 and one main landmark')
if page.errors:
    print('\n'.join(page.errors))
    sys.exit(1)
print(f'PASS: HTML structure, {len(page.ids)} unique IDs, {len(page.references)} links/assets, image alt text and main landmark')
