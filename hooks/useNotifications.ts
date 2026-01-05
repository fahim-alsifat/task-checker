'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Task, Checklist } from '@/types';

export type NotificationPermission = 'default' | 'granted' | 'denied';

interface UseNotificationsReturn {
    permission: NotificationPermission;
    isSupported: boolean;
    requestPermission: () => Promise<boolean>;
    sendNotification: (title: string, options?: NotificationOptions) => void;
}

// Hook for managing browser notifications
export const useNotifications = (): UseNotificationsReturn => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    // Check support and permission on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setIsSupported(true);
            setPermission(Notification.permission as NotificationPermission);
        }
    }, []);

    // Request permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) return false;

        try {
            const result = await Notification.requestPermission();
            setPermission(result as NotificationPermission);
            return result === 'granted';
        } catch {
            return false;
        }
    }, [isSupported]);

    // Send notification
    const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (!isSupported || permission !== 'granted') return;

        try {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options,
            });

            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }, [isSupported, permission]);

    return {
        permission,
        isSupported,
        requestPermission,
        sendNotification,
    };
};

// Get current time string in HH:mm format
const getCurrentTimeString = (): string => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// Hook for monitoring tasks and sending notifications
export const useTaskNotifications = (
    checklists: Checklist[],
    notifiedTasksKey = 'notified-tasks'
) => {
    const { permission, isSupported, requestPermission, sendNotification } = useNotifications();
    const notifiedTasks = useRef<Set<string>>(new Set());

    // Load notified tasks from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(notifiedTasksKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Only keep today's notifications
                const today = new Date().toDateString();
                if (parsed.date === today) {
                    notifiedTasks.current = new Set(parsed.tasks);
                }
            }
        } catch { }
    }, [notifiedTasksKey]);

    // Save notified tasks to localStorage
    const saveNotifiedTasks = useCallback(() => {
        try {
            localStorage.setItem(notifiedTasksKey, JSON.stringify({
                date: new Date().toDateString(),
                tasks: Array.from(notifiedTasks.current)
            }));
        } catch { }
    }, [notifiedTasksKey]);

    // Check tasks every 10 seconds (for testing) -> change to 60000 for production
    useEffect(() => {
        if (!isSupported || permission !== 'granted') {
            console.log('[Notifications] Not active - supported:', isSupported, 'permission:', permission);
            return;
        }

        const checkTasks = () => {
            const currentTime = getCurrentTimeString();
            console.log('[Notifications] Checking tasks at', currentTime);

            checklists.forEach(checklist => {
                // Skip if notifications disabled for this checklist
                if (!checklist.notifications) return;

                checklist.tasks.forEach(task => {
                    // Skip completed tasks or already notified
                    if (task.status === 'completed') return;
                    if (notifiedTasks.current.has(task.id)) return;

                    console.log('[Notifications] Task:', task.name, 'scheduled:', task.scheduledTime, 'current:', currentTime);

                    // Check if task time matches current time
                    if (task.scheduledTime === currentTime) {
                        console.log('[Notifications] Sending notification for:', task.name);
                        sendNotification(`⏰ Task Due: ${task.name}`, {
                            body: `Time: ${task.scheduledTime} • ${checklist.name}`,
                            tag: task.id,
                        });
                        notifiedTasks.current.add(task.id);
                        saveNotifiedTasks();
                    }
                });
            });
        };

        // Check immediately and then every 10 seconds (for testing)
        checkTasks();
        const interval = setInterval(checkTasks, 10000);

        return () => clearInterval(interval);
    }, [checklists, permission, isSupported, sendNotification, saveNotifiedTasks]);

    // Reset notified tasks at midnight
    useEffect(() => {
        const checkMidnight = () => {
            const now = new Date();
            if (now.getHours() === 0 && now.getMinutes() === 0) {
                notifiedTasks.current.clear();
                saveNotifiedTasks();
            }
        };

        const interval = setInterval(checkMidnight, 60000);
        return () => clearInterval(interval);
    }, [saveNotifiedTasks]);

    return {
        permission,
        isSupported,
        requestPermission,
    };
};
