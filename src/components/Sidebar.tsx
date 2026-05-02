'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, Kanban } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Pipeline', href: '/', icon: Kanban },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Candidates', href: '/candidates', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Flint CRM</h1>
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
  );
}
