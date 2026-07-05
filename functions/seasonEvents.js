// Zeitspannen der Season-Events (aus der alten interactionCreate.js)
export const eventPeriods = {
    easter: { start: new Date('2024-03-01T00:00:00Z'), end: new Date('2024-04-30T23:59:59Z') },
    halloween: { start: new Date('2024-10-27T00:00:00Z'), end: new Date('2024-11-02T23:59:59Z') },
    christmas: { start: new Date('2024-12-20T00:00:00Z'), end: new Date('2024-12-26T23:59:59Z') },
    newyear: { start: new Date('2024-12-27T00:00:00Z'), end: new Date('2025-01-02T23:59:59Z') },
};

export const isEventActive = (event) => {
    const now = new Date();
    return now >= event.start && now <= event.end;
};
