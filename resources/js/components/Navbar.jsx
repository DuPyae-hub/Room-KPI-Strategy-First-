import { Link } from 'react-router-dom';
import StrategyFirstLogo from './StrategyFirstLogo';
import { adminPath, showStaffDashboardLink } from '../lib/adminRoutes';

/**
 * @param {'public' | 'admin'} variant
 */
export default function Navbar({ variant = 'public', adminSignedIn, onSignInClick, onSignOut }) {
    return (
        <header className="bg-sf-navy text-white shadow-md">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex min-w-0 items-center gap-4">
                    <StrategyFirstLogo />
                    <div className="min-w-0">
                        <p className="font-serif text-xs font-medium tracking-wide text-[#E30613]">
                            Student Engagement
                        </p>
                        <h1 className="font-semibold leading-tight text-white sm:text-lg">
                            {variant === 'admin' ? 'Admin · Room Schedule' : 'Academic Room Schedule'}
                        </h1>
                    </div>
                </Link>
                <nav className="flex flex-wrap items-center gap-2">
                    {variant === 'public' && showStaffDashboardLink() && (
                        <Link
                            to={adminPath()}
                            className="rounded-lg bg-sf-blue px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
                        >
                            Staff dashboard
                        </Link>
                    )}
                    {variant === 'admin' && (
                        <>
                            <Link
                                to={adminPath('clubs')}
                                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/20"
                            >
                                Clubs
                            </Link>
                            <Link
                                to="/"
                                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/20"
                            >
                                Public schedule
                            </Link>
                            {adminSignedIn ? (
                                <button
                                    type="button"
                                    onClick={onSignOut}
                                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/20"
                                >
                                    Sign out
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onSignInClick}
                                    className="rounded-lg bg-sf-blue px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
                                >
                                    Sign in
                                </button>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
