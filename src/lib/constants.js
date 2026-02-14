// ─── Activity-Based QR Configuration ───
// Each activity has: id, name, amount (token cost), duration_mins (null = instant deduction, no session)

export const ACTIVITIES = [
    { id: 'rc_car', name: 'RC Car 3 Laps', amount: 199, duration_mins: null },
    { id: 'rc_excavator', name: 'RC Excavator', amount: 99, duration_mins: 5 },
    { id: 'deduct_30', name: 'Deduction 30', amount: 30, duration_mins: null },
    { id: 'deduct_50', name: 'Deduction 50', amount: 50, duration_mins: null },
    { id: 'deduct_100', name: 'Deduction 100', amount: 100, duration_mins: null },
    { id: 'deduct_120', name: 'Deduction 120', amount: 120, duration_mins: null },
    { id: 'deduct_150', name: 'Deduction 150', amount: 150, duration_mins: null },
    { id: 'deduct_180', name: 'Deduction 180', amount: 180, duration_mins: null },
    { id: 'vr_car', name: 'VR Car Station', amount: 250, duration_mins: 15 },
    { id: 'challenge', name: 'Challenge', amount: 100, duration_mins: null },
    { id: 'dummy', name: 'Dummy', amount: 200, duration_mins: 15 },
];

// Helper: look up activity by id
export function getActivityById(id) {
    return ACTIVITIES.find(a => a.id === id) || null;
}

// Helper: check if activity creates a timed session
export function isTimedActivity(activity) {
    return activity && activity.duration_mins !== null && activity.duration_mins > 0;
}
