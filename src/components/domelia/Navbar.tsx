// Navigation Domelia - Design Wahoo Luxe
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NotificationDropdown } from "./NotificationDropdown";
import { DarkModeToggle } from "./DarkModeToggle";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Vérifier l'auth au montage et lors des changements de route
  useEffect(() => {
    let isMounted = true;
    
    const doCheckAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (isMounted) {
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      }
    };
    
    doCheckAuth();
    
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-luxe dark:shadow-slate-800/50"
          : "bg-transparent"
      }`}
    >
      <div className="container-domelia">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#560591] dark:bg-violet-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="font-bold text-xl text-slate-800 dark:text-white">
              Domelia<span className="text-[#560591] dark:text-violet-400">.fr</span>
            </span>
          </Link>

          {/* Liens navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/profils-locataires"
              className="text-slate-600 dark:text-slate-300 hover:text-[#560591] dark:hover:text-violet-400 font-medium transition-colors"
            >
              Locataires
            </Link>
            <Link
              href="/colocation"
              className="text-slate-600 dark:text-slate-300 hover:text-[#560591] dark:hover:text-violet-400 font-medium transition-colors"
            >
              Colocation
            </Link>
            <Link
              href="/je-loue"
              className="text-slate-600 dark:text-slate-300 hover:text-[#560591] dark:hover:text-violet-400 font-medium transition-colors"
            >
              Je loue
            </Link>
            <Link
              href="/services"
              className="text-slate-600 dark:text-slate-300 hover:text-[#560591] dark:hover:text-violet-400 font-medium transition-colors"
            >
              Services
            </Link>
          </div>

          {/* Boutons connexion/inscription ou menu utilisateur */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <DarkModeToggle />
            
            {user ? (
              <>
                {/* Lien Messagerie */}
                <Link
                  href="/messagerie"
                  className="hidden sm:flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-[#560591] dark:hover:text-violet-400 font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="hidden lg:inline">Messages</span>
                </Link>

                {/* Notifications */}
                <NotificationDropdown />

                {/* Menu utilisateur */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#560591] dark:bg-violet-600 flex items-center justify-center text-white font-medium text-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">
                      {user.name || "Mon compte"}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium"
                      >
                        Mon Dashboard
                      </Link>
                      <Link
                        href="/messagerie"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        Mes Messages
                      </Link>
                      <Link
                        href="/dashboard?tab=favoris"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        Mes Favoris
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 text-[#560591] dark:text-violet-400 font-medium"
                        >
                          Administration
                        </Link>
                      )}
                      <hr className="border-gray-100 dark:border-slate-700" />
                      <Link
                        href="/deconnexion"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 text-red-500"
                      >
                        Déconnexion
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="hidden sm:block text-slate-600 dark:text-slate-300 hover:text-[#560591] dark:hover:text-violet-400 font-medium transition-colors px-4 py-2"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="bg-[#560591] dark:bg-violet-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:bg-[#3D0466] dark:hover:bg-violet-700 hover:shadow-lg btn-shimmer"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
