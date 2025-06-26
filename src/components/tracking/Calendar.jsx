import React, { useState, useEffect } from "react";
// import './Calendar.css';

const Calendar = ({ habits = [], habitCompletions = {}, onDateSelect, selectedDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);

    useEffect(() => {
        generateCalendarDays();
    }, [currentDate]);

    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const currentDay = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }

        setCalendarDays(days);
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const formatDateKey = (date) => {
        return date.toISOString().split("T")[0];
    };

    const getCompletionRate = (date) => {
        const dateKey = formatDateKey(date);
        const dayCompletions = habitCompletions[dateKey] || {};
        const totalHabits = habits.length;

        if (totalHabits === 0) return 0;

        const completedHabits = Object.values(dayCompletions).filter(Boolean).length;
        return (completedHabits / totalHabits) * 100;
    };

    const getCompletionClass = (completionRate) => {
        if (completionRate === 100) return "full-completion";
        if (completionRate >= 75) return "high-completion";
        if (completionRate >= 50) return "medium-completion";
        if (completionRate >= 25) return "low-completion";
        return "no-completion";
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isCurrentMonth = (date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    const isSelected = (date) => {
        return selectedDate && date.toDateString() === selectedDate.toDateString();
    };

    const handleDateClick = (date) => {
        if (onDateSelect) {
            onDateSelect(date);
        }
    };

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        if (onDateSelect) {
            onDateSelect(today);
        }
    };

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button className="nav-button" onClick={() => navigateMonth(-1)} aria-label="Previous month">
                    &#8249;
                </button>

                <h2 className="calendar-title">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>

                <button className="nav-button" onClick={() => navigateMonth(1)} aria-label="Next month">
                    &#8250;
                </button>
            </div>

            <div className="calendar-controls">
                <button className="today-button" onClick={goToToday}>
                    Today
                </button>
            </div>

            <div className="calendar-grid">
                <div className="day-headers">
                    {dayNames.map((day) => (
                        <div key={day} className="day-header">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="calendar-days">
                    {calendarDays.map((date, index) => {
                        const completionRate = getCompletionRate(date);
                        const completionClass = getCompletionClass(completionRate);

                        return (
                            <div
                                key={index}
                                className={`calendar-day ${isCurrentMonth(date) ? "current-month" : "other-month"} ${
                                    isToday(date) ? "today" : ""
                                } ${isSelected(date) ? "selected" : ""} ${completionClass}`}
                                onClick={() => handleDateClick(date)}
                            >
                                <span className="day-number">{date.getDate()}</span>
                                {isCurrentMonth(date) && habits.length > 0 && (
                                    <div className="completion-indicator">
                                        <div className="completion-bar" style={{ width: `${completionRate}%` }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-color no-completion" />
                    <span>No habits completed</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color low-completion" />
                    <span>25% completed</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color medium-completion" />
                    <span>50% completed</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color high-completion" />
                    <span>75% completed</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color full-completion" />
                    <span>All habits completed</span>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
