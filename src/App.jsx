import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import Dashboard from "./components/analytics/Dashboard";
import HabitList from "./components/habits/HabitList";
import DailyTracker from "./components/tracking/DailyTracker";
import Calendar from "./components/tracking/Calendar";
import "./App.css";

function App() {
    const [habits, setHabits] = useState([]);
    const [completions, setCompletions] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const savedHabits = localStorage.getItem("habits");
        const savedCompletions = localStorage.getItem("completions");

        if (savedHabits) {
            try {
                setHabits(JSON.parse(savedHabits));
            } catch (e) {
                console.error("Failed to parse habits from localStorage", e);
                setHabits([]);
            }
        }

        if (savedCompletions) {
            try {
                 setCompletions(JSON.parse(savedCompletions));
            } catch (e) {
                 console.error("Failed to parse completions from localStorage", e);
                 setCompletions({});
            }
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
                if (updated[date] && updated[date][id] !== undefined) {
                    delete updated[date][id];
                    if (Object.keys(updated[date]).length === 0) {
                         delete updated[date];
                    }
                }
            });
            return updated;
        });
    };

    const toggleHabitCompletion = (habitId, date) => {
        const dateKey = date ? new Date(date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

        setCompletions((prev) => {
             const dateCompletions = prev[dateKey] || {};
            return {
                ...prev,
                [dateKey]: {
                    ...dateCompletions,
                    [habitId]: !dateCompletions[habitId],
                },
            };
        });
    };

    return (
        <BrowserRouter>
            <div className="app">
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                <div className="app-body">
                    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Dashboard habits={habits} completions={completions} />} />

                            <Route
                                path="/habits"
                                element={
                                    <HabitList
                                        habits={habits}
                                        onAddHabit={addHabit}
                                        onUpdateHabit={updateHabit}
                                        onDeleteHabit={deleteHabit}
                                        completions={completions}
                                    />
                                }
                            />

                            <Route
                                path="/tracker"
                                element={
                                    <DailyTracker
                                        habits={habits}
                                        completions={completions}
                                        onToggleCompletion={toggleHabitCompletion}
                                    />
                                }
                            />

                            <Route
                                path="/calendar"
                                element={
                                    <Calendar
                                        habits={habits}
                                        completions={completions}
                                        onToggleCompletion={toggleHabitCompletion}
                                    />
                                }
                            />

                            <Route path="/analytics" element={<Dashboard habits={habits} completions={completions} />} />
                        </Routes>
                    </main>
                </div>

                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;