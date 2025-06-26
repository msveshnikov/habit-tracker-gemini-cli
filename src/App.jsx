import { useState, useEffect } from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import Dashboard from "./components/analytics/Dashboard";
import HabitList from "./components/habits/HabitList";
import DailyTracker from "./components/tracking/DailyTracker";
import Calendar from "./components/tracking/Calendar";
import "./App.css";

function App() {
    const [currentView, setCurrentView] = useState("dashboard");
    const [habits, setHabits] = useState([]);
    const [completions, setCompletions] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const savedHabits = localStorage.getItem("habits");
        const savedCompletions = localStorage.getItem("completions");

        if (savedHabits) {
            setHabits(JSON.parse(savedHabits));
        }

        if (savedCompletions) {
            setCompletions(JSON.parse(savedCompletions));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("habits", JSON.stringify(habits));
    }, [habits]);

    useEffect(() => {
        localStorage.setItem("completions", JSON.stringify(completions));
    }, [completions]);

    const addHabit = (habit) => {
        const newHabit = {
            id: Date.now().toString(),
            ...habit,
            createdAt: new Date().toISOString(),
        };
        setHabits((prev) => [...prev, newHabit]);
    };

    const updateHabit = (id, updates) => {
        setHabits((prev) => prev.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit)));
    };

    const deleteHabit = (id) => {
        setHabits((prev) => prev.filter((habit) => habit.id !== id));
        setCompletions((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((date) => {
                if (updated[date][id]) {
                    delete updated[date][id];
                }
            });
            return updated;
        });
    };

    const toggleHabitCompletion = (habitId, date) => {
        const dateKey = date || new Date().toISOString().split("T")[0];
        setCompletions((prev) => ({
            ...prev,
            [dateKey]: {
                ...prev[dateKey],
                [habitId]: !prev[dateKey]?.[habitId],
            },
        }));
    };

    const renderCurrentView = () => {
        switch (currentView) {
            case "dashboard":
                return <Dashboard habits={habits} completions={completions} />;
            case "habits":
                return (
                    <HabitList
                        habits={habits}
                        onAddHabit={addHabit}
                        onUpdateHabit={updateHabit}
                        onDeleteHabit={deleteHabit}
                        completions={completions}
                    />
                );
            case "tracker":
                return (
                    <DailyTracker
                        habits={habits}
                        completions={completions}
                        onToggleCompletion={toggleHabitCompletion}
                    />
                );
            case "calendar":
                return (
                    <Calendar habits={habits} completions={completions} onToggleCompletion={toggleHabitCompletion} />
                );
            default:
                return <Dashboard habits={habits} completions={completions} />;
        }
    };

    return (
        <div className="app">
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} currentView={currentView} />

            <div className="app-body">
                <Sidebar
                    isOpen={sidebarOpen}
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    onClose={() => setSidebarOpen(false)}
                />

                <main className="main-content">{renderCurrentView()}</main>
            </div>

            <Footer />
        </div>
    );
}

export default App;
