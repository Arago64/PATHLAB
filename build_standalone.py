"""Build a portable, dependency-free HTML demo from the same source modules."""
from pathlib import Path
ROOT = Path(__file__).parent
html = (ROOT/'index.html').read_text()
css = (ROOT/'styles.css').read_text()
css = '\n'.join(line for line in css.splitlines() if not line.startswith('@import url('))
js = []
for module in ('graph.js','algorithms.js','app.js'):
    content = (ROOT/'src'/module).read_text()
    content = '\n'.join(line for line in content.splitlines() if not line.startswith('import '))
    content = content.replace('export const ', 'const ').replace('export function ', 'function ').replace('export class ', 'class ')
    js.append('// ---- '+module+' ----\n'+content)
html = html.replace('<link rel="stylesheet" href="styles.css" />','<style>\n'+css+'\n</style>')
html = html.replace('<script type="module" src="src/app.js"></script>','<script>\n'+'\n\n'.join(js)+'\n</script>')
(ROOT/'PATHLAB_Standalone.html').write_text(html)
print('Wrote', (ROOT/'PATHLAB_Standalone.html').stat().st_size, 'bytes')
