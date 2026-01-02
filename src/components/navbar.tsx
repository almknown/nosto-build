"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import NosLogo from "@/components/nosbot-logo";

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/generate", label: "Generate" },
        { href: "/history", label: "History", protected: true },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="sticky top-0 z-50" style={{ background: "rgba(2, 6, 23, 0.9)", backdropFilter: "blur(12px)" }}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <NosLogo size="sm" showText={true} />
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isProtected = link.protected && !session;
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={isProtected ? "/login" : link.href}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? "bg-[var(--background-hover)]"
                                            : "hover:bg-[var(--background-hover)]"
                                        } ${isProtected ? "opacity-50" : ""}`}
                                    style={{
                                        color: isActive ? "var(--foreground)" : "var(--foreground-muted)",
                                    }}
                                    onClick={(e) => {
                                        if (isProtected) {
                                            e.preventDefault();
                                            signIn("google");
                                        }
                                    }}
                                >
                                    {link.label}
                                    {isProtected && <span className="ml-1 text-[10px]">🔒</span>}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-3">
                        {status === "loading" ? (
                            <div className="w-9 h-9 rounded-full skeleton" />
                        ) : session?.user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full transition-all hover:ring-2 hover:ring-[var(--primary-start)]"
                                    style={{ background: "var(--background-card)" }}
                                >
                                    {session.user.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                            className="w-9 h-9 rounded-full"
                                        />
                                    ) : (
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
                                            style={{ background: "linear-gradient(135deg, var(--primary-start), var(--primary-end))" }}
                                        >
                                            {session.user.name?.[0] || "U"}
                                        </div>
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {menuOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl overflow-hidden"
                                        style={{ background: "var(--background-card)", border: "1px solid var(--border)" }}
                                    >
                                        {/* User Info */}
                                        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
                                            <p className="font-semibold truncate">{session.user.name}</p>
                                            <p className="text-xs truncate" style={{ color: "var(--foreground-muted)" }}>
                                                {session.user.email}
                                            </p>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <Link
                                                href="/account"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--background-hover)] transition-colors"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Account
                                            </Link>
                                            <Link
                                                href="/history"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--background-hover)] transition-colors"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                My Playlists
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--background-hover)] transition-colors"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Settings
                                            </Link>
                                        </div>

                                        {/* Sign Out */}
                                        <div className="border-t" style={{ borderColor: "var(--border)" }}>
                                            <button
                                                onClick={() => signOut({ callbackUrl: "/" })}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-red-500/10 transition-colors"
                                                style={{ color: "var(--error)" }}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn("google")}
                                className="px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105"
                                style={{
                                    background: "linear-gradient(135deg, var(--primary-start), var(--primary-end))",
                                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                                }}
                            >
                                Sign In
                            </button>
                        )}

                        {/* Mobile menu toggle */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {menuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {menuOpen && (
                    <div className="md:hidden py-4 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === link.href ? "bg-[var(--background-hover)]" : ""
                                    }`}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    color: pathname === link.href ? "var(--foreground)" : "var(--foreground-muted)",
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {session && (
                            <>
                                <div className="my-2 border-t" style={{ borderColor: "var(--border)" }} />
                                <Link
                                    href="/account"
                                    className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                    style={{ color: "var(--foreground-muted)" }}
                                >
                                    Account
                                </Link>
                                <Link
                                    href="/settings"
                                    className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                    style={{ color: "var(--foreground-muted)" }}
                                >
                                    Settings
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
