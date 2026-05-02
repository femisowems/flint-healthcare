'use client';

import React from 'react';
import { User, Bell, Shield, Database, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto h-[calc(100vh-0rem)] overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account and platform preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Settings Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            <a href="#" className="bg-indigo-50 text-indigo-700 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium">
              <User className="w-4 h-4" /> Account Profile
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              <Bell className="w-4 h-4" /> Notifications
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              <Shield className="w-4 h-4" /> Security
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              <Database className="w-4 h-4" /> Integrations
            </a>
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  defaultValue="Admin User"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="admin@flint.test"
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500 text-sm cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Contact IT support to change your email address.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input 
                  type="text" 
                  defaultValue="Super Admin"
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-gray-100">
              <button className="bg-indigo-600 text-white flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-xs text-gray-500">Receive emails when candidates move stages</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                  <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-indigo-600 cursor-pointer"></label>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Dark Mode</h4>
                  <p className="text-xs text-gray-500">Currently not supported in prototype</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle2" id="toggle2" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" disabled />
                  <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-not-allowed"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
