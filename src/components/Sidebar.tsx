'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, Kanban, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Pipeline', href: '/', icon: Kanban },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Candidates', href: '/candidates', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-40 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">
              F
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Flint CRM</h1>
              <p className="text-xs font-medium text-slate-500">Global healthcare talent, organized.</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={clsx('w-5 h-5', isActive ? 'text-indigo-600' : 'text-gray-400')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
              FL
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">Admin User</span>
              <span className="text-xs text-gray-500">admin@flint.test</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
