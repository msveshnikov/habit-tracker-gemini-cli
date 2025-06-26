import React, { useState, useEffect } from "react";
// import "./DailyTracker.css";

const DailyTracker = () => {
    const [habits, setHabits] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [completions, setCompletions] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadHabits();
        loadCompletions();
    }, [selectedDate]);

    const loadHabits = () => {
        const storedHabits = JSON.parse(localStorage.getItem("habits") || "[]");
        setHabits(storedHabits);
    };

    const loadCompletions = () => {
        const dateKey = selectedDate.toISOString().split("T")[0];
        const storedCompletions = JSON.parse(localStorage.getItem("completions") || "{}");
        setCompletions(storedCompletions[dateKey] || {});
    };

    const saveCompletions = (newCompletions) => {
        const dateKey = selectedDate.toISOString().split("T")[0];
        const allCompletions = JSON.parse(localStorage.getItem("completions") || "{}");
        allCompletions[dateKey] = newCompletions;
        localStorage.setItem("completions", JSON.stringify(allCompletions));
    };

    const toggleHabitCompletion = (habitId) => {
        const newCompletions = {
            ...completions,
            [habitId]: !completions[habitId],
        };
        setCompletions(newCompletions);
        saveCompletions(newCompletions);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const navigateDate = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + direction);
        setSelectedDate(newDate);
    };

    const isToday = () => {
        const today = new Date();
        return selectedDate.toDateString() === today.toDateString();
    };

    const getCompletionRate = () => {
        if (habits.length === 0) return 0;
        const completedCount = Object.values(completions).filter(Boolean).length;
        return Math.round((completedCount / habits.length) * 100);
    };

    const getCompletedCount = () => {
        return Object.values(completions).filter(Boolean).length;
    };

    return (
        <div className="daily-tracker">
            <div className="tracker-header">
                <div className="date-navigation">
                    <button className="nav-button" onClick={() => navigateDate(-1)} aria-label="Previous day">
                        ←
                    </button>
                    <h2 className="current-date">{formatDate(selectedDate)}</h2>
                    <button className="nav-button" onClick={() => navigateDate(1)} aria-label="Next day">
                        →
                    </button>
                </div>

                {isToday() && (
                    <div className="today-indicator">
                        <span className="today-badge">Today</span>
                    </div>
                )}
            </div>

            <div className="progress-summary">
                <div className="progress-circle">
                    <div className="circle-progress" style={{ "--progress": getCompletionRate() }}>
                        <span className="progress-text">{getCompletionRate()}%</span>
                    </div>
                </div>
                <div className="progress-details">
                    <p className="completion-text">
                        {getCompletedCount()} of {habits.length} habits completed
                    </p>
                    {getCompletionRate() === 100 && habits.length > 0 && (
                        <p className="celebration-text">🎉 Perfect day!</p>
                    )}
                </div>
            </div>

            <div className="habits-list">
                {habits.length === 0 ? (
                    <div className="empty-state">
                        <p>No habits to track yet.</p>
                        <p>Create your first habit to get started!</p>
                    </div>
                ) : (
                    habits.map((habit) => (
                        <div key={habit.id} className={`habit-item ${completions[habit.id] ? "completed" : ""}`}>
                            <div className="habit-info">
                                <div className="habit-icon">{habit.icon || "📋"}</div>
                                <div className="habit-details">
                                    <h3 className="habit-name">{habit.name}</h3>
                                    <p className="habit-description">{habit.description}</p>
                                    {habit.target && <span className="habit-target">Target: {habit.target}</span>}
                                </div>
                            </div>

                            <button
                                className={`completion-button ${completions[habit.id] ? "completed" : ""}`}
                                onClick={() => toggleHabitCompletion(habit.id)}
                                aria-label={`Mark ${habit.name} as ${
                                    completions[habit.id] ? "incomplete" : "complete"
                                }`}
                            >
                                {completions[habit.id] ? "✓" : "○"}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="quick-actions">
                <button className="action-button" onClick={() => setSelectedDate(new Date())} disabled={isToday()}>
                    Go to Today
                </button>

                <button
                    className="action-button secondary"
                    onClick={() => {
                        const allCompleted = {};
                        habits.forEach((habit) => {
                            allCompleted[habit.id] = true;
                        });
                        setCompletions(allCompleted);
                        saveCompletions(allCompleted);
                    }}
                    disabled={habits.length === 0}
                >
                    Complete All
                </button>

                <button
                    className="action-button secondary"
                    onClick={() => {
                        setCompletions({});
                        saveCompletions({});
                    }}
                    disabled={Object.keys(completions).length === 0}
                >
                    Reset Day
                </button>
            </div>
        </div>
    );
};

export default DailyTracker;
