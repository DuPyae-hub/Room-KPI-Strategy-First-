import { useMemo, useState } from 'react';

/**
 * Logo files are served from Laravel `public/` → URL `/assets/...`.
 * Place your file as e.g. `public/assets/logo.png` or `public/assets/logo.svg`.
 */
const DEFAULT_CANDIDATES = [
    '/assets/strategy-first-logo.png',
    '/assets/logo.svg',
    '/assets/logo.png',
    '/assets/logo.webp',
    '/assets/logo.jpg',
    // Typo folder name some setups use
    '/assests/logo.svg',
    '/assests/logo.png',
];

/**
 * Optional override: full URL or path (e.g. CDN or different filename).
 * Set in `.env`: VITE_LOGO_URL=https://example.com/logo.png
 */
function candidatePaths() {
    const custom = import.meta.env.VITE_LOGO_URL;
    const trimmed = typeof custom === 'string' ? custom.trim() : '';
    if (trimmed) {
        return [trimmed, ...DEFAULT_CANDIDATES];
    }
    return DEFAULT_CANDIDATES;
}

export default function StrategyFirstLogo({ className = '' }) {
    const paths = useMemo(() => candidatePaths(), []);
    const [index, setIndex] = useState(0);
    const [exhausted, setExhausted] = useState(false);

    if (exhausted || index >= paths.length) {
        return (
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[10px] font-medium uppercase tracking-wide text-white/70 ${className}`}
                aria-hidden
            >
                SF
            </div>
        );
    }

    return (
        <img
            src={paths[index]}
            alt="Strategy First"
            width={160}
            height={48}
            className={`h-12 w-auto max-h-12 max-w-[min(180px,40vw)] object-contain object-left ${className}`}
            loading="eager"
            decoding="async"
            onError={() => {
                if (index + 1 >= paths.length) {
                    setExhausted(true);
                } else {
                    setIndex((i) => i + 1);
                }
            }}
        />
    );
}
