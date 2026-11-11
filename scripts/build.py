from pathlib import Path
import argparse
import re
import base64

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'src'
parser = argparse.ArgumentParser(description='Build the offline Jacaranda scene using only Python standard libraries.')
parser.add_argument('--output-dir', type=Path, default=ROOT,
                    help='Output directory, relative to the project root or absolute (default: project root).')
args = parser.parse_args()
OUTPUT = args.output_dir if args.output_dir.is_absolute() else ROOT / args.output_dir
OUTPUT.mkdir(parents=True, exist_ok=True)

three = (ROOT / 'vendor/three.module.min.js').read_text(encoding='utf-8')
match = re.search(r'export\s*\{([^}]+)\}\s*;?\s*$', three)
if not match:
    raise RuntimeError('Three.js export list not found')
exports = []
for entry in match.group(1).split(','):
    parts = re.split(r'\s+as\s+', entry.strip())
    exports.append((parts[1] + ':' + parts[0]) if len(parts) == 2 else parts[0])
three = 'const THREE=(()=>{\n' + three[:match.start()] + '\nreturn {' + ','.join(exports) + '};\n})();'

orbit = (ROOT / 'vendor/OrbitControls.js').read_text(encoding='utf-8')
orbit = re.sub(r"import\s*\{([^}]+)\}\s*from\s*'three';", r'const {\1}=THREE;', orbit, count=1)
orbit = re.sub(r'export\s*\{\s*OrbitControls\s*\};?', '', orbit)
orbit = 'const OrbitControls=(()=>{\n' + orbit + '\nreturn OrbitControls;})();'

fonts = []
for family, name, style in [('Cormorant Garamond','cormorant-garamond','normal'),('Cormorant Garamond','cormorant-garamond','italic'),('DM Sans','dm-sans','normal')]:
    file = ROOT / f'vendor/{name}-{style}.woff2'
    data = base64.b64encode(file.read_bytes()).decode('ascii')
    fonts.append(f"@font-face{{font-family:'{family}';font-style:{style};font-weight:400;font-display:swap;src:url(data:font/woff2;base64,{data}) format('woff2');}}")

html = (SOURCE / 'index.template.html').read_text(encoding='utf-8')
html = html.replace('/* EMBED_FONTS */', '\n'.join(fonts))
html = html.replace('/* EMBED_STYLES */', (SOURCE/'style.css').read_text(encoding='utf-8'))
html = html.replace('/* EMBED_VENDOR */', three + '\n' + orbit)
source = '\n'.join((SOURCE/name).read_text(encoding='utf-8') for name in ['scene-core.js','building.js','garden.js','scene-runtime.js'])
html = html.replace('/* EMBED_SCENE */', source)
font_licenses = '\n\n'.join((ROOT / 'vendor' / f'{name}-LICENSE.txt').read_text(encoding='utf-8') for name in ['cormorant-garamond','dm-sans'])
html = html.replace('</body>', '<script type="text/plain" id="font-licenses">\n' + font_licenses + '\n</script>\n</body>')
html = html.replace('</body>', '''<!--
Original scene, modeling, layout and interactions: created for this commission.
Three.js r170 / OrbitControls — Copyright 2010-2024 Three.js Authors, MIT License.
Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the Software), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to the following
conditions: The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED AS
IS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR
ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
Cormorant Garamond: Christian Thalmann / Catharsis Fonts. DM Sans: Colophon Foundry.
Both font families are distributed under the SIL Open Font License 1.1.
-->
</body>''')
if '/* EMBED_' in html:
    raise RuntimeError('The HTML template contains unresolved build placeholders.')
target = OUTPUT / 'index.html'
target.write_text(html, encoding='utf-8', newline='\n')
(OUTPUT / '.nojekyll').write_text('', encoding='utf-8')
print(f'{target}: {target.stat().st_size:,} bytes')
