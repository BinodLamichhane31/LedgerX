import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
    useGetNotifications, 
    useMarkAsRead, 
    useMarkAllAsRead 
} from '../../hooks/useNotification';
import { socket } from '../../socket';
import { Bell, BellRing, CheckCheck, CircleAlert, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Popover, Transition } from '@headlessui/react'; 

const formatDistanceToNow = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${days} days ago`;
};

const Notification= () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: notificationData, isLoading, isError, error } = useGetNotifications();
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

    React.useEffect(() => {
        const onNewNotification = (notification) => {
            toast.info(<span>🔔 {notification.message}</span>);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        };
        socket.on('new_notification', onNewNotification);
        return () => { socket.off('new_notification', onNewNotification); };
    }, [queryClient]);
    
    const handleNotificationClick = (notification, close) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        close(); // <-- Close the popover
        if (notification.link) navigate(notification.link);
    };

    const unreadCount = notificationData?.count || 0;
    const notifications = notificationData?.data || [];

    return (
        <Popover className="relative">
            {({ open, close }) => ( 
                <>
                    <Popover.Button 
                        className={`relative p-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            open ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                        aria-label={`Notifications (${unreadCount} unread)`}
                    >
                        {unreadCount > 0 ? (
                            <BellRing className="w-5 h-5 text-indigo-600" />
                        ) : (
                            <Bell size={20} className="text-slate-600" />
                        )}
                        {unreadCount > 0 && (
                            <span className="absolute top-[-5px] right-[-5px] flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </Popover.Button>
            
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel 
                            className="absolute left-0 z-50 mt-2 bg-white border border-slate-200 rounded-lg shadow-2xl w-80"
                        >
                            <div className="flex items-center justify-between p-3 font-semibold text-slate-800 border-b border-slate-100">
                                <span>Reminders</span>
                                {unreadCount > 0 && 
                                    <button onClick={() => !isMarkingAll && markAllAsRead()} disabled={isMarkingAll} className="text-xs font-medium text-indigo-600 hover:underline disabled:opacity-50">
                                        <CheckCheck size={14} className="inline mr-1" /> Mark all as read
                                    </button>
                                }
                            </div>
                            
                            <div className="overflow-y-auto max-h-96">
                                {isLoading ? (
                                     <div className="flex items-center justify-center p-8 text-slate-500"><Loader2 className="animate-spin" /></div>
                                ) : isError ? (
                                    <div className="p-4 text-sm text-center text-red-600"><CircleAlert className="inline-block mr-2" /> {error?.message || 'Could not load.'}</div>
                                ) : notifications.length > 0 ? (
                                    <ul>
                                        {notifications.map(notif => (
                                            <li key={notif._id}>
                                                <button onClick={() => handleNotificationClick(notif, close)} className={`flex w-full p-3 text-sm text-left hover:bg-slate-50 ${!notif.isRead && 'bg-indigo-50/50'}`}>
                                                    <div className="flex-grow">
                                                        <p className={`font-medium ${!notif.isRead ? 'text-slate-800' : 'text-slate-600'}`}>{notif.message}</p>
                                                        <p className="mt-1 text-xs text-slate-400">{formatDistanceToNow(notif.createdAt)}</p>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                     <div className="p-8 text-sm text-center text-gray-500">You're all caught up!</div>
                                )}
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
};

export default Notification;