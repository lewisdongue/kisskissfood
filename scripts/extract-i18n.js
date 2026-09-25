import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// support __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very small extractor: scans .tsx files and reports literal strings that look like visible text
function scanDir(dir) {
  const results = [];
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...scanDir(full));
    } else if (full.endsWith('.tsx') || full.endsWith('.jsx')) {
      const content = fs.readFileSync(full, 'utf8');
      // crude regex: strings between >Text< or text in quotes in JSX
      const jsxText = [...content.matchAll(/>([^<>\n]{2,200})</g)].map(m => ({file: full, text: m[1].trim()}));
      const quoted = [...content.matchAll(/\{?\s*['\"]([^"']{2,200})['\"]\s*\}?/g)].map(m => ({file: full, text: m[1].trim()}));
      const merged = [...jsxText, ...quoted];
      for (const m of merged) {
        // filter out HTML tags or single words like icons
        if (m.text && /[a-zA-Z]/.test(m.text) && m.text.length > 1 && m.text.length < 200) {
          results.push(m);
        }
      }
    }
  }
  return results;
}

const root = path.resolve(__dirname, '..', 'src');
const found = scanDir(root);
console.log('Found potentially translatable strings:');
for (const f of found) {
  console.log(`${path.relative(process.cwd(), f.file)} => "${f.text.replace(/\n/g, ' ')}"`);
}

// write a simple JSON sample file
const sample = {};
let counter = 1;
for (const f of found) {
  const key = `AUTOGEN.key_${counter++}`;
  sample[key] = f.text;
}
fs.writeFileSync(path.join(root, 'i18n-extracted-sample.json'), JSON.stringify(sample, null, 2));
console.log('\nWrote src/i18n-extracted-sample.json with sample keys. Review and integrate into locales.');
