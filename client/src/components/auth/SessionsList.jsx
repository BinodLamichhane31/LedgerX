import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  X,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useGetSessions, useRevokeSession, useLogoutAll } from '../../hooks/auth/useSessions';
import { useNavigate } from 'react-router-dom';

const LogoutAllConfirmDialog = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-20 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Logout from All Devices?</h2>
            <p className="mt-2 text-sm text-slate-600 text-balance">
              This will log you out from all devices, including this one. You'll need to login again on all devices.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut size={18} />
                  Logout All
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SessionsList = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetSessions();
  const { mutate: revokeSession, isLoading: isRevoking } = useRevokeSession();
  const { mutate: logoutAll, isLoading: isLoggingOutAll } = useLogoutAll();
  const [revokingId, setRevokingId] = useState(null);
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);

  const sessions = data?.data || [];

  // Parse user agent to get device info
  const getDeviceInfo = (userAgent) => {
    const ua = userAgent.toLowerCase();
    
    let deviceType = 'desktop';
    let icon = Monitor;
    let browser = 'Unknown';
    
    // Device type
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      deviceType = 'mobile';
      icon = Smartphone;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
      icon = Tablet;
    }
    
    // Browser
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('opera')) browser = 'Opera';
    
    return { deviceType, icon, browser };
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const handleRevokeSession = async (sessionId, isCurrent) => {
    if (isCurrent) {
      toast.error('Cannot revoke current session. Use logout instead.');
      return;
    }

    setRevokingId(sessionId);
    revokeSession(sessionId, {
      onSuccess: (response) => {
        toast.success('Session revoked successfully');
        setRevokingId(null);
        
        // If current session was revoked, redirect to login
        if (response.isCurrentSession) {
          navigate('/login');
        }
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to revoke session');
        setRevokingId(null);
      }
    });
  };

  const handleLogoutAllClick = () => {
    setShowLogoutAllDialog(true);
  };

  const handleLogoutAllConfirm = () => {
    logoutAll(undefined, {
      onSuccess: () => {
        toast.success('Logged out from all devices');
        setShowLogoutAllDialog(false);
        // Navigation handled by useLogoutAll hook via logout()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || error.message || 'Failed to logout from all devices');
        setShowLogoutAllDialog(false);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-slate-600">Failed to load sessions</p>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No active sessions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Logout All Button */}
      <div className="flex justify-end">
        <button
          onClick={handleLogoutAllClick}
          disabled={isLoggingOutAll}
          className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 disabled:opacity-50 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Log out all devices
        </button>
      </div>

      {/* Logout All Confirmation Dialog */}
      <LogoutAllConfirmDialog
        isOpen={showLogoutAllDialog}
        onClose={() => setShowLogoutAllDialog(false)}
        onConfirm={handleLogoutAllConfirm}
        isLoading={isLoggingOutAll}
      />

      {/* Sessions List */}
      <AnimatePresence>
        {sessions.map((session) => {
          const { icon: DeviceIcon, browser } = getDeviceInfo(session.userAgent);
          const isRevokingThis = revokingId === session.id;

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={`bg-slate-50 border rounded-2xl p-4 ${
                session.isCurrent ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {/* Device Icon */}
                  <div className={`p-2 rounded-xl ${
                    session.isCurrent ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <DeviceIcon className="w-5 h-5" />
                  </div>

                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900">{browser}</h4>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                          This device
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5 text-sm text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        IP: {session.ip}
                      </p>
                      <p>Created: {formatDate(session.createdAt)}</p>
                      <p>Last used: {formatDate(session.lastUsedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Revoke Button */}
                {!session.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(session.id, session.isCurrent)}
                    disabled={isRevokingThis || isRevoking}
                    className="px-3 py-2 text-sm font-bold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isRevokingThis ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Revoke
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default SessionsList;
