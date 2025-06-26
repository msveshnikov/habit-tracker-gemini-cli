import React, { useState, useEffect } from "react";
import Loading from "../ui/Loading";
import Button from "../ui/Button";
// import "./Dashboard.css"; // Assuming CSS file exists

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalHabits: 0,
    completedToday: 0,
    totalCurrentStreaks: 0, // Renamed to avoid confusion with individual habit streak
    overallCompletionRate: 0, // Renamed for clarity
    weeklyProgress: [],
    monthlyStats: {},
    topPerformingHabits: [],
    strugglingHabits: [],
  });
  const [timeRange, setTimeRange] = useState("week"); // State exists but only styles buttons currently
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabitsData();
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      calculateAnalytics();
    } else if (!loading) {
      // If habits are loaded and empty, set analytics to default empty state
      setAnalytics({
        totalHabits: 0,
        completedToday: 0,
        totalCurrentStreaks: 0,
        overallCompletionRate: 0,
        weeklyProgress: calculateWeeklyProgress([]), // Calculate for empty habits
        monthlyStats: calculateMonthlyStats([]), // Calculate for empty habits
        topPerformingHabits: [],
        strugglingHabits: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, timeRange]); // Added timeRange dependency, though it doesn't affect calculations yet

  const loadHabitsData = () => {
    setLoading(true);
    try {
      const storedHabits = localStorage.getItem("habits");
      const habitsData = storedHabits ? JSON.parse(storedHabits) : [];
      // Ensure completions are sorted by date descending for easier processing if needed elsewhere
      const processedHabits = habitsData.map(habit => ({
        ...habit,
        completions: habit.completions ? habit.completions.sort((a, b) => new Date(b.date) - new Date(a.date)) : []
      }));
      setHabits(processedHabits);
    } catch (error) {
      console.error("Error loading habits data:", error);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    const totalHabits = habits.length;

    const completedToday = habits.filter((habit) => {
      const completions = habit.completions || [];
      return completions.some(
        (completion) =>
          new Date(completion.date).toDateString() === today.toDateString() &&
          completion.completed,
      );
    }).length;

    const totalCurrentStreaks = habits.reduce((total, habit) => {
      return total + calculateCurrentStreak(habit);
    }, 0);

    // Calculate overall completion rate across all recorded completions
    let totalPossibleCompletions = 0;
    let actualCompletedCompletions = 0;

    habits.forEach(habit => {
        const completions = habit.completions || [];
        // A simple approach: count how many days a habit *could* have been completed since its creation
        // This is complex with arbitrary frequencies. A simpler approach is to count total entries vs completed entries,
        // or average daily completion rate over a period.
        // Let's stick to the daily completion rate average over the last 30 days for a meaningful "overall" rate
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const relevantCompletions = completions.filter(c => new Date(c.date) >= thirtyDaysAgo);
        const completedInPeriod = relevantCompletions.filter(c => c.completed).length;
        const totalEntriesInPeriod = relevantCompletions.length;

        // This calculation is still problematic because it counts *entries*, not *days the habit could have been done*.
        // Let's use the daily completion rate over the last 7 days averaged across habits instead,
        // or just keep the simple "completed today" rate as the main display.
        // The original code's "completionRate" was just completedToday / totalHabits. Let's keep that for the main stat.
        // A true overall rate would require knowing which days were "active" for each habit.
        // Let's keep the original simple overall rate calculation for the stat card.
    });

    const overallCompletionRate =
      totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;


    const weeklyProgress = calculateWeeklyProgress(habits);
    const monthlyStats = calculateMonthlyStats(habits);
    const { topPerformingHabits, strugglingHabits } = categorizeHabits(habits);

    setAnalytics({
      totalHabits,
      completedToday,
      totalCurrentStreaks,
      overallCompletionRate,
      weeklyProgress,
      monthlyStats,
      topPerformingHabits,
      strugglingHabits,
    });
  };

  // Refined streak calculation
  const calculateCurrentStreak = (habit) => {
    const completions = habit.completions || [];
    if (completions.length === 0) return 0;

    const completedDates = new Set(
        completions
            .filter(c => c.completed)
            .map(c => new Date(c.date).toISOString().split('T')[0])
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let tempDate = new Date(today);

    // Check today first
    const todayString = tempDate.toISOString().split('T')[0];
    const completedToday = completedDates.has(todayString);

    if (completedToday) {
        currentStreak = 1;
        tempDate.setDate(tempDate.getDate() - 1); // Move to yesterday
    } else {
        // If not completed today, the streak calculation starts from yesterday
        tempDate.setDate(tempDate.getDate() - 1); // Move to yesterday
    }

    // Check days before today (or starting from yesterday if today was missed)
    while (true) {
        const checkDateString = tempDate.toISOString().split('T')[0];
        const isCompleted = completedDates.has(checkDateString);

        if (isCompleted) {
            currentStreak++;
            tempDate.setDate(tempDate.getDate() - 1);
        } else {
            break; // Streak broken
        }

        // Optional: Stop if date is significantly before habit creation date
        // (Requires habit.createdAt to be reliable)
        // if (habit.createdAt && new Date(tempDate) < new Date(habit.createdAt)) {
        //     break;
        // }

         // Prevent infinite loops for habits with very old dates if needed
         // if (currentStreak > 365 * 10) break; // Cap streak check at 10 years
    }

    return currentStreak;
  };


  const calculateWeeklyProgress = (habitsData) => {
    const weekProgress = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();

      const dayCompletions = habitsData.reduce((total, habit) => {
        const completions = habit.completions || [];
        // Check if habit was completed on this specific date
        const dayCompletionEntry = completions.find(
          (c) => new Date(c.date).toDateString() === dateString && c.completed,
        );
        // For simplicity, assumes a habit *could* have been completed each day in the last 7 days
        // A more complex version would check habit frequency and start date
        return total + (dayCompletionEntry ? 1 : 0);
      }, 0);

       // Total possible habits for this day - assumes all habits were active.
       // A more accurate count would filter by habit creation date <= date.
       const totalPossibleOnDay = habitsData.length;


      weekProgress.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        completions: dayCompletions,
        total: totalPossibleOnDay,
        percentage:
            totalPossibleOnDay > 0
            ? Math.round((dayCompletions / totalPossibleOnDay) * 100)
            : 0,
      });
    }

    return weekProgress;
  };

  const calculateMonthlyStats = (habitsData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    let totalPossibleCompletionsInMonth = 0;
    let totalCompletedCompletionsInMonth = 0;

    habitsData.forEach((habit) => {
      const habitCreated = habit.createdAt ? new Date(habit.createdAt) : new Date(2000, 0, 1); // Default to a past date if no creation date
      habitCreated.setHours(0, 0, 0, 0);

      // Determine the start date for counting completions in the current month for this habit
      const startCountDate = new Date(currentYear, currentMonth, 1);
      if (habitCreated > startCountDate) {
          startCountDate.setTime(habitCreated.getTime()); // Start counting from creation date if it's in the current month
      }

      // Count days from startCountDate up to today within the current month
      let daysRelevantForHabit = 0;
      const tempDate = new Date(startCountDate);
      while (tempDate <= today && tempDate.getMonth() === currentMonth && tempDate.getFullYear() === currentYear) {
          // Check if this habit's frequency applies to tempDate
          // (Requires frequency implementation - skipping for now, assuming daily or counting all days since creation in month)
          // For simplicity, count every day since habit creation within the current month up to today.
           daysRelevantForHabit++;
           tempDate.setDate(tempDate.getDate() + 1);
      }

      totalPossibleCompletionsInMonth += daysRelevantForHabit;

      const completions = habit.completions || [];
      const monthCompletions = completions.filter((c) => {
        const completionDate = new Date(c.date);
         completionDate.setHours(0, 0, 0, 0);
        return (
          completionDate.getMonth() === currentMonth &&
          completionDate.getFullYear() === currentYear &&
           completionDate <= today && // Only count up to today
          c.completed
        );
      });

      totalCompletedCompletionsInMonth += monthCompletions.length;
    });

    return {
      totalPossible: totalPossibleCompletionsInMonth,
      totalCompleted: totalCompletedCompletionsInMonth,
      completionRate:
        totalPossibleCompletionsInMonth > 0
          ? Math.round((totalCompletedCompletionsInMonth / totalPossibleCompletionsInMonth) * 100)
          : 0,
    };
  };

  const categorizeHabits = (habitsData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habitStats = habitsData.map((habit) => {
      const completions = habit.completions || [];
      const last7Days = [];
      const relevantDaysCount = 7; // Count performance over the last 7 days

      let completedInLast7Days = 0;
      let possibleInLast7Days = 0; // Count days habit was active in last 7 days

      for (let i = 0; i < relevantDaysCount; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
         const isoDateString = date.toISOString().split('T')[0];

        // Check if the habit was created on or before this date
        const habitCreated = habit.createdAt ? new Date(habit.createdAt) : new Date(2000, 0, 1);
        habitCreated.setHours(0,0,0,0);

        if (habitCreated <= date) {
            possibleInLast7Days++; // This day is relevant for this habit
            const completion = completions.find(
              (c) => new Date(c.date).toDateString() === dateString,
            );
            if (completion?.completed) {
                completedInLast7Days++;
            }
        }
      }

      const completionRate = possibleInLast7Days > 0 ? (completedInLast7Days / possibleInLast7Days) * 100 : 0;

      return {
        ...habit,
        completionRate,
        currentStreak: calculateCurrentStreak(habit),
      };
    });

    const topPerformingHabits = habitStats
      .filter((h) => h.completionRate >= 70) // Threshold for top performers
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3); // Top 3

    const strugglingHabits = habitStats
      .filter((h) => h.completionRate < 50) // Threshold for struggling
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 3); // Up to 3 struggling habits

    return { topPerformingHabits, strugglingHabits };
  };


  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loading message="Loading analytics..." />
      </div>
    );
  }

  // Show message if no habits exist
   if (habits.length === 0 && !loading) {
       return (
           <div className="dashboard no-habits">
               <h1>Analytics Dashboard</h1>
               <p>Add some habits to see your progress here!</p>
           </div>
       );
   }


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        {/* Time range selector - currently only styles buttons, calculations are fixed to week/month */}
        <div className="time-range-selector">
          <Button
            variant={timeRange === "week" ? "primary" : "secondary"}
            onClick={() => setTimeRange("week")}
            small
          >
            Week
          </Button>
          <Button
            variant={timeRange === "month" ? "primary" : "secondary"}
            onClick={() => setTimeRange("month")}
            small
          >
            Month
          </Button>
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
            <h3>Total Active Streaks</h3> {/* Updated label */}
            <p className="stat-number">{analytics.totalCurrentStreaks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Today's Completion Rate</h3> {/* Updated label */}
            <p className="stat-number">{analytics.overallCompletionRate}%</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container weekly-chart-container"> {/* Added class */}
          <h3>Weekly Progress (Last 7 Days)</h3> {/* Added clarity */}
           {analytics.weeklyProgress.length > 0 && analytics.weeklyProgress.some(d => d.total > 0) ? (
                <div className="weekly-chart">
                {analytics.weeklyProgress.map((day, index) => (
                    <div key={index} className="day-progress">
                    <div className="day-label">{day.date}</div>
                    <div className="progress-bar">
                        {/* Use inline style for height */}
                        <div
                        className="progress-fill"
                        style={{ height: `${day.percentage}%` }}
                        ></div>
                    </div>
                    <div className="day-stats">
                        {day.completions}/{day.total}
                    </div>
                    </div>
                ))}
                </div>
           ) : (
               <p className="no-data">No data for the last 7 days.</p>
           )}
        </div>

        <div className="chart-container monthly-chart-container"> {/* Added class */}
          <h3>Monthly Overview ({new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})</h3> {/* Added clarity */}
            {analytics.monthlyStats.totalPossible > 0 ? (
                <div className="monthly-stats">
                    <div className="monthly-circle">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                        <path
                        className="circle-bg"
                        d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {/* Use inline style for strokeDasharray */}
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
                    <p>Completed Days: {analytics.monthlyStats.totalCompleted}</p> {/* Clarified label */}
                    <p>Possible Days: {analytics.monthlyStats.totalPossible}</p> {/* Clarified label */}
                    </div>
                </div>
            ) : (
                 <p className="no-data">No data for the current month.</p>
            )}
        </div>
      </div>

      <div className="habits-performance">
        <div className="performance-section top-performing"> {/* Added class */}
          <h3>🌟 Top Performing Habits (Last 7 Days)</h3> {/* Added clarity */}
          <div className="habits-list">
            {analytics.topPerformingHabits.length > 0 ? (
              analytics.topPerformingHabits.map((habit) => (
                <div key={habit.id} className="habit-item success"> {/* Use habit.id if available */}
                  <span className="habit-name">{habit.name}</span>
                  <span className="habit-rate">
                    {Math.round(habit.completionRate)}%
                  </span>
                  <span className="habit-streak">🔥 {habit.currentStreak}</span>
                </div>
              ))
            ) : (
              <p className="no-data">No top performing habits in the last 7 days.</p>
            )}
          </div>
        </div>

        <div className="performance-section struggling"> {/* Added class */}
          <h3>💪 Needs Attention (Last 7 Days)</h3> {/* Added clarity */}
          <div className="habits-list">
            {analytics.strugglingHabits.length > 0 ? (
              analytics.strugglingHabits.map((habit) => (
                <div key={habit.id} className="habit-item warning"> {/* Use habit.id if available */}
                  <span className="habit-name">{habit.name}</span>
                  <span className="habit-rate">
                    {Math.round(habit.completionRate)}%
                  </span>
                  <span className="habit-streak">🔥 {habit.currentStreak}</span>
                </div>
              ))
            ) : (
              <p className="no-data">All habits are performing well in the last 7 days!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;