"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/generate", label: "Generate" },
        { href: "/history", label: "History" },
    ];

    return (
        <nav className="sticky top-0 z-50" style={{ background: "rgba(15, 15, 26, 0.9)", backdropFilter: "blur(10px)" }}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                        <span className="text-2xl">✨</span>
                        <span className="gradient-text hidden sm:inline">NosBot</span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => {
                            const isHistory = link.label === "History";
                            const isDisabled = isHistory && !session;

                            return (
                                <Link
                                    key={link.href}
                                    href={isDisabled ? "/login" : link.href}
                                    className={`text-sm font-medium transition-colors ${pathname === link.href
                                        ? "gradient-text"
                                        : ""
                                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                    style={{
                                        color: pathname === link.href ? undefined : "var(--foreground-muted)",
                                    }}
                                    onClick={(e) => {
                                        if (isDisabled) {
                                            e.preventDefault();
                                            // Optional: visual feedback or redirect logic could go here
                                        }
                                    }}
                                >
                                    {link.label}
                                    {isDisabled && <span className="ml-1 text-[10px] opacity-70">🔒</span>}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-3">
                        {status === "loading" ? (
                            <div className="w-8 h-8 rounded-full" style={{ background: "var(--background-card)" }} />
                        ) : session?.user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full transition-all hover:ring-2"
                                    style={{ background: "var(--background-card)" }}
                                >
                                    {session.user.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                                            style={{ background: "var(--primary-start)" }}
                                        >
                                            {session.user.name?.[0] || "U"}
                                        </div>
                                    )}
                                </button>

                                {/* Dropdown */}
                                {menuOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg overflow-hidden"
                                        style={{ background: "var(--background-card)", border: "1px solid var(--border)" }}
                                    >
                                        <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
                                            <p className="font-medium text-sm truncate">{session.user.name}</p>
                                            <p className="text-xs truncate" style={{ color: "var(--foreground-muted)" }}>
                                                {session.user.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => signOut()}
                                            className="w-full px-3 py-2 text-left text-sm transition-colors"
                                            style={{ color: "var(--error)" }}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn("google")}
                                className="btn-primary text-sm px-4 py-2"
                            >
                                Sign In
                            </button>
                        )}

                        {/* Mobile menu toggle */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {menuOpen && (
                    <div className="md:hidden py-3 border-t" style={{ borderColor: "var(--border)" }}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block py-2 text-sm"
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    color: pathname === link.href ? "var(--primary-start)" : "var(--foreground-muted)",
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
