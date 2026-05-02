/**
 * One-command repair: remove stale Vite "hot" file, clear Laravel caches, rebuild frontend.
 * Run: npm run fix
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function sh(cmd) {
    console.log(`\n\x1b[36m> ${cmd}\x1b[0m\n`);
    execSync(cmd, { cwd: root, stdio: 'inherit', shell: true });
}

const hotPath = path.join(root, 'public', 'hot');
if (fs.existsSync(hotPath)) {
    fs.unlinkSync(hotPath);
    console.log('\x1b[32m✓ Removed public/hot\x1b[0m (Laravel will use built assets from public/build).');
}

try {
    sh('php artisan optimize:clear');
} catch {
    console.warn('\x1b[33m! php artisan optimize:clear failed — run from project root with PHP in PATH.\x1b[0m');
}

sh('npm run build');

console.log(
    '\n\x1b[32m✓ Ready.\x1b[0m Start the app: \x1b[1mphp artisan serve\x1b[0m → http://127.0.0.1:8000\n',
);
