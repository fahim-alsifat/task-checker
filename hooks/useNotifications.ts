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
    // Check tasks every 10 seconds (check last 2 minutes window to handle throttling)
    useEffect(() => {
        if (!isSupported) {
            console.log('[Notifications] Not supported');
            return;
        }

        const checkTasks = () => {
            // Read permission directly
            const currentPermission = typeof window !== 'undefined' && 'Notification' in window
                ? Notification.permission
                : 'default';

            if (currentPermission !== 'granted') return;

            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();

            checklists.forEach(checklist => {
                if (!checklist.notifications) return;

                checklist.tasks.forEach(task => {
                    if (task.status === 'completed') return;
                    if (!task.scheduledTime) return; // Skip tasks without scheduled time

                    // Parse task time
                    const [taskHours, taskMinutes] = task.scheduledTime.split(':').map(Number);

                    // Calculate minutes until task
                    let minutesUntil = (taskHours * 60 + taskMinutes) - (currentHours * 60 + currentMinutes);

                    // Get notification times based on priority
                    const priority = task.priority || 'normal';
                    let notifyMinutesBefore: number[] = [0]; // default: on time only

                    if (priority === 'high') {
                        notifyMinutesBefore = [5, 2, 0]; // 5min, 2min, on time
                    } else if (priority === 'medium') {
                        notifyMinutesBefore = [2, 0]; // 2min, on time
                    }

                    // Check each notification time
                    for (const minutesBefore of notifyMinutesBefore) {
                        // Unique key for this specific notification timing
                        const notificationKey = `${task.id}-${task.scheduledTime}-${minutesBefore}`;

                        if (notifiedTasks.current.has(notificationKey)) continue;

                        // Check if current time matches notification time (with 1 min window for reliability)
                        const shouldNotify = (
                            minutesUntil === minutesBefore ||
                            minutesUntil === minutesBefore - 1
                        );

                        if (shouldNotify && minutesUntil >= -1) {
                            const prefix = minutesBefore === 0
                                ? '⏰ Now:'
                                : minutesBefore === 2
                                    ? '⚡ 2 min:'
                                    : '🔥 5 min:';

                            console.log(`[Notifications] 🔔 Sending ${minutesBefore}min notification for:`, task.name);
                            try {
                                new Notification(`${prefix} ${task.name}`, {
                                    body: `${task.scheduledTime} • ${checklist.name}${priority !== 'normal' ? ` • ${priority.toUpperCase()} priority` : ''}`,
                                    icon: '/favicon.ico',
                                    tag: `${task.id}-${minutesBefore}`,
                                });
                                notifiedTasks.current.add(notificationKey);
                                saveNotifiedTasks();
                            } catch (err) {
                                console.error('[Notifications] Failed:', err);
                            }
                        }
                    }
                });
            });
        };

        // Check immediately and then every 10 seconds
        checkTasks();
        const interval = setInterval(checkTasks, 10000);

        return () => clearInterval(interval);
    }, [checklists, isSupported, saveNotifiedTasks]);

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
