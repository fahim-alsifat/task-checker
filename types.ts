// Task and Checklist type definitions

export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'normal';

// Dynamic category created per checklist
export interface Category {
    id: string;
    name: string;
    color: string; // hex color
}

export interface Task {
    id: string;
    name: string;
    scheduledTime?: string; // Optional "HH:mm" format (24-hour)
    categoryId: string; // References Category.id
    priority: TaskPriority; // high = 3 notifications, medium = 2, normal = 1
    status: TaskStatus;
    notes?: string;
    createdAt: string;
    completedAt?: string;
}

// Priority notification config
export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; notifyMinutesBefore: number[] }> = {
    high: { label: 'High', color: '#ef4444', notifyMinutesBefore: [5, 2, 0] },
    medium: { label: 'Medium', color: '#f59e0b', notifyMinutesBefore: [2, 0] },
    normal: { label: 'Normal', color: '#6b7280', notifyMinutesBefore: [0] },
};

export interface Checklist {
    id: string;
    name: string;
    tasks: Task[];
    categories: Category[]; // Custom categories for this checklist
    createdAt: string;
    color: string;
    autoReset: boolean;
    lastResetDate?: string;
    notifications?: boolean;
}

// Default categories for new checklists
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
    { name: 'General', color: '#6b7280' },
];

// Category color presets
export const CATEGORY_COLORS = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#6b7280', // gray
];

// Checklist colors
export const CHECKLIST_COLORS = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#06b6d4', // cyan
];

// Time period for grouping tasks
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

// Time period configuration
export const TIME_PERIOD_CONFIG: Record<TimePeriod, { label: string; icon: string; hours: [number, number] }> = {
    morning: { label: 'Morning', icon: '🌅', hours: [5, 12] },
    afternoon: { label: 'Afternoon', icon: '☀️', hours: [12, 17] },
    evening: { label: 'Evening', icon: '🌆', hours: [17, 21] },
    night: { label: 'Night', icon: '🌙', hours: [21, 5] },
};

// Helper to generate unique IDs
export const generateId = (): string => {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
};

// Helper to get time period from hour
export const getTimePeriod = (time: string): TimePeriod => {
    const hour = parseInt(time.split(':')[0], 10);
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
};

// Helper to format time for display (12-hour format)
export const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

// Get random color for new checklist
export const getRandomColor = (): string => {
    return CHECKLIST_COLORS[Math.floor(Math.random() * CHECKLIST_COLORS.length)];
};

// Sort tasks by time (tasks without time go to end)
export const sortTasksByTime = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
        if (!a.scheduledTime && !b.scheduledTime) return 0;
        if (!a.scheduledTime) return 1;
        if (!b.scheduledTime) return -1;
        return a.scheduledTime.localeCompare(b.scheduledTime);
    });
};

// Get today's date as YYYY-MM-DD
export const getTodayDate = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
