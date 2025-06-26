import React, { useState, useEffect } from "react";
// import "./Dashboard.css";

const Dashboard = () => {
    const [habits, setHabits] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalHabits: 0,
        completedToday: 0,
        currentStreaks: 0,
        completionRate: 0,
        weeklyProgress: [],
        monthlyStats: {},
        topPerformingHabits: [],
        strugglingHabits: [],
    });
    const [timeRange, setTimeRange] = useState("week");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHabitsData();
    }, []);

    useEffect(() => {
        if (habits.length > 0) {
            calculateAnalytics();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [habits, timeRange]);

    const loadHabitsData = () => {
        try {
            const storedHabits = localStorage.getItem("habits");
            const habitsData = storedHabits ? JSON.parse(storedHabits) : [];
            setHabits(habitsData);
        } catch (error) {
            console.error("Error loading habits data:", error);
            setHabits([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = () => {
        const today = new Date().toDateString();
        const totalHabits = habits.length;

        const completedToday = habits.filter((habit) => {
            const completions = habit.completions || [];
            return completions.some(
                (completion) => new Date(completion.date).toDateString() === today && completion.completed
            );
        }).length;

        const currentStreaks = habits.reduce((total, habit) => {
            return total + calculateCurrentStreak(habit);
        }, 0);

        const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

        const weeklyProgress = calculateWeeklyProgress();
        const monthlyStats = calculateMonthlyStats();
        const { topPerformingHabits, strugglingHabits } = categorizeHabits();

        setAnalytics({
            totalHabits,
            completedToday,
            currentStreaks,
            completionRate,
            weeklyProgress,
            monthlyStats,
            topPerformingHabits,
            strugglingHabits,
        });
    };

    const calculateCurrentStreak = (habit) => {
        const completions = habit.completions || [];
        if (completions.length === 0) return 0;

        const sortedCompletions = completions
            .filter((c) => c.completed)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedCompletions.length === 0) return 0;

        let streak = 0;
        let currentDate = new Date();

        for (let i = 0; i < sortedCompletions.length; i++) {
            const completionDate = new Date(sortedCompletions[i].date);
            const daysDiff = Math.floor((currentDate - completionDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === streak) {
                streak++;
                currentDate = completionDate;
            } else {
                break;
            }
        }

        return streak;
    };

    const calculateWeeklyProgress = () => {
        const weekProgress = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();

            const dayCompletions = habits.reduce((total, habit) => {
                const completions = habit.completions || [];
                const dayCompletion = completions.find(
                    (c) => new Date(c.date).toDateString() === dateString && c.completed
                );
                return total + (dayCompletion ? 1 : 0);
            }, 0);

            weekProgress.push({
                date: date.toLocaleDateString("en-US", { weekday: "short" }),
                completions: dayCompletions,
                total: habits.length,
                percentage: habits.length > 0 ? Math.round((dayCompletions / habits.length) * 100) : 0,
            });
        }

        return weekProgress;
    };

    const calculateMonthlyStats = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let totalPossible = 0;
        let totalCompleted = 0;

        habits.forEach((habit) => {
            const habitCreated = new Date(habit.createdAt || now);
            const startDate =
                habitCreated.getMonth() === currentMonth && habitCreated.getFullYear() === currentYear
                    ? habitCreated.getDate()
                    : 1;

            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const currentDay = now.getDate();
            const relevantDays = Math.min(daysInMonth, currentDay) - startDate + 1;

            totalPossible += relevantDays;

            const completions = habit.completions || [];
            const monthCompletions = completions.filter((c) => {
                const completionDate = new Date(c.date);
                return (
                    completionDate.getMonth() === currentMonth &&
                    completionDate.getFullYear() === currentYear &&
                    c.completed
                );
            });

            totalCompleted += monthCompletions.length;
        });

        return {
            totalPossible,
            totalCompleted,
            completionRate: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
        };
    };

    const categorizeHabits = () => {
        const habitStats = habits.map((habit) => {
            const completions = habit.completions || [];
            const last7Days = [];
            const today = new Date();

            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateString = date.toDateString();

                const completion = completions.find((c) => new Date(c.date).toDateString() === dateString);

                last7Days.push(completion?.completed || false);
            }

            const completionRate = (last7Days.filter(Boolean).length / 7) * 100;

            return {
                ...habit,
                completionRate,
                currentStreak: calculateCurrentStreak(habit),
            };
        });

        const topPerformingHabits = habitStats
            .filter((h) => h.completionRate >= 70)
            .sort((a, b) => b.completionRate - a.completionRate)
            .slice(0, 3);

        const strugglingHabits = habitStats
            .filter((h) => h.completionRate < 50)
            .sort((a, b) => a.completionRate - b.completionRate)
            .slice(0, 3);

        return { topPerformingHabits, strugglingHabits };
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Analytics Dashboard</h1>
                <div className="time-range-selector">
                    <button className={timeRange === "week" ? "active" : ""} onClick={() => setTimeRange("week")}>
                        Week
                    </button>
                    <button className={timeRange === "month" ? "active" : ""} onClick={() => setTimeRange("month")}>
                        Month
                    </button>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>Total Habits</h3>
                        <p className="stat-number">{analytics.totalHabits}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>Completed Today</h3>
                        <p className="stat-number">{analytics.completedToday}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-content">
                        <h3>Active Streaks</h3>
                        <p className="stat-number">{analytics.currentStreaks}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <h3>Completion Rate</h3>
                        <p className="stat-number">{analytics.completionRate}%</p>
                    </div>
                </div>
            </div>

            <div className="charts-section">
                <div className="chart-container">
                    <h3>Weekly Progress</h3>
                    <div className="weekly-chart">
                        {analytics.weeklyProgress.map((day, index) => (
                            <div key={index} className="day-progress">
                                <div className="day-label">{day.date}</div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ height: `${day.percentage}%` }}></div>
                                </div>
                                <div className="day-stats">
                                    {day.completions}/{day.total}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-container">
                    <h3>Monthly Overview</h3>
                    <div className="monthly-stats">
                        <div className="monthly-circle">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path
                                    className="circle-bg"
                                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="circle"
                                    strokeDasharray={`${analytics.monthlyStats.completionRate}, 100`}
                                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <text x="18" y="20.35" className="percentage">
                                    {analytics.monthlyStats.completionRate}%
                                </text>
                            </svg>
                        </div>
                        <div className="monthly-details">
                            <p>Completed: {analytics.monthlyStats.totalCompleted}</p>
                            <p>Total: {analytics.monthlyStats.totalPossible}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="habits-performance">
                <div className="performance-section">
                    <h3>🌟 Top Performing Habits</h3>
                    <div className="habits-list">
                        {analytics.topPerformingHabits.length > 0 ? (
                            analytics.topPerformingHabits.map((habit, index) => (
                                <div key={habit.id || index} className="habit-item success">
                                    <span className="habit-name">{habit.name}</span>
                                    <span className="habit-rate">{Math.round(habit.completionRate)}%</span>
                                    <span className="habit-streak">🔥 {habit.currentStreak}</span>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No top performing habits yet</p>
                        )}
                    </div>
                </div>

                <div className="performance-section">
                    <h3>💪 Needs Attention</h3>
                    <div className="habits-list">
                        {analytics.strugglingHabits.length > 0 ? (
                            analytics.strugglingHabits.map((habit, index) => (
                                <div key={habit.id || index} className="habit-item warning">
                                    <span className="habit-name">{habit.name}</span>
                                    <span className="habit-rate">{Math.round(habit.completionRate)}%</span>
                                    <span className="habit-streak">🔥 {habit.currentStreak}</span>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">All habits are performing well!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
