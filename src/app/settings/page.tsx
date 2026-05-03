'use client';

import React, { useState } from 'react';
import { User, Bell, Shield, Database, Save, Key, Lock, Code, MessageSquare, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
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
            <button 
              onClick={() => setActiveTab('profile')}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === 'profile' ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <User className="w-4 h-4" /> Account Profile
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === 'notifications' ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Bell className="w-4 h-4" /> Notifications
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === 'security' ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Shield className="w-4 h-4" /> Security
            </button>
            <button 
              onClick={() => setActiveTab('integrations')}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === 'integrations' ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Database className="w-4 h-4" /> Integrations
            </button>
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <>
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
                  <button 
                    onClick={() => toast.success('Profile settings saved successfully')}
                    className="bg-indigo-600 text-white flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
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
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Pipeline Alerts</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm text-gray-700">New candidate applications</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm text-gray-700">Candidate reaches &apos;Offer&apos; stage</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm text-gray-700">Weekly pipeline digest</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">System Alerts</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm text-gray-700">Team member mentions you in a note</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => toast.success('Notification preferences updated')}
                    className="bg-indigo-600 text-white flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Authentication</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  </div>
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={() => toast.success('Password updated securely')}
                      className="bg-white border border-gray-300 text-gray-700 flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Key className="w-4 h-4 mr-2" /> Update Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-500" /> Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account. We recommend using an authenticator app.</p>
                <button 
                  onClick={() => toast.success('2FA setup instructions sent to email')}
                  className="bg-indigo-50 text-indigo-700 flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Apps</h3>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Slack</h4>
                      <p className="text-xs text-gray-500">Send notifications to a specific Slack channel</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.success('Slack integration successfully connected')}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Connect
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-indigo-100 bg-indigo-50/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Code className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        GitHub <CheckCircle className="w-3 h-3 text-emerald-500" />
                      </h4>
                      <p className="text-xs text-gray-500">Authenticate using GitHub SSO</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.success('GitHub integration disconnected')}
                    className="text-sm font-medium text-gray-500 hover:text-red-600"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
