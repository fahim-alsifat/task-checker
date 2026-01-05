// Task and Checklist type definitions

export type TaskCategory = 'news' | 'solution' | 'image' | 'prompt' | 'other';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
    id: string;
    name: string;
    scheduledTime: string; // "HH:mm" format (24-hour)
    category: TaskCategory;
    status: TaskStatus;
    notes?: string;
    createdAt: string;
    completedAt?: string;
}

export interface Checklist {
    id: string;
    name: string;
    tasks: Task[];
    createdAt: string;
    color: string;
    autoReset: boolean; // Auto-reset completed tasks at midnight (12 AM)
    lastResetDate?: string; // Track last reset date (YYYY-MM-DD)
}

// Time period for grouping tasks
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

// Category configuration with colors and icons
export const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string; bgColor: string; borderColor: string }> = {
    news: { label: 'News', color: 'text-blue-400', bgColor: 'bg-blue-500/15', borderColor: 'border-blue-500/30' },
    solution: { label: 'Solution', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15', borderColor: 'border-emerald-500/30' },
    image: { label: 'Image', color: 'text-purple-400', bgColor: 'bg-purple-500/15', borderColor: 'border-purple-500/30' },
    prompt: { label: 'Prompt', color: 'text-amber-400', bgColor: 'bg-amber-500/15', borderColor: 'border-amber-500/30' },
    other: { label: 'Other', color: 'text-gray-400', bgColor: 'bg-gray-500/15', borderColor: 'border-gray-500/30' },
};

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

// Sort tasks by time
export const sortTasksByTime = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
};

// Get today's date as YYYY-MM-DD
export const getTodayDate = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
