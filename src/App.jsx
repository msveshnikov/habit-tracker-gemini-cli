import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import Dashboard from "./components/analytics/Dashboard";
import HabitList from "./components/habits/HabitList";
import DailyTracker from "./components/tracking/DailyTracker";
import Calendar from "./components/tracking/Calendar";
import "./App.css";

// Custom component to handle sidebar close on navigation click on mobile
const RouteWrapper = ({ children, onCloseSidebar }) => {
  const location = useLocation();

  useEffect(() => {
    // Close sidebar on mobile when route changes
    // Using a simple width check, could use a context/hook for better responsiveness
    if (window.innerWidth <= 768) {
        onCloseSidebar();
    }
  }, [location, onCloseSidebar]);

  return <>{children}</>;
};


function App() {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  // State to control mobile sidebar visibility as an overlay
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // Load state from localStorage on initial mount
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

  // Save habits to localStorage whenever habits state changes
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  // Save completions to localStorage whenever completions state changes
  useEffect(() => {
    localStorage.setItem("completions", JSON.stringify(completions));
  }, [completions]);

  // Function to add a new habit
  const addHabit = (habit) => {
    const newHabit = {
      id: Date.now().toString(), // Simple unique ID based on timestamp
      ...habit,
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  // Function to update an existing habit
  const updateHabit = (id, updates) => {
    setHabits((prev) =>
      prev.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit)),
    );
  };

  // Function to delete a habit and its associated completions
  const deleteHabit = (id) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
    setCompletions((prev) => {
      const updated = { ...prev };
      // Iterate through all dates and remove the completion entry for the deleted habit
      Object.keys(updated).forEach((date) => {
        if (updated[date] && updated[date][id] !== undefined) {
          delete updated[date][id];
          // Optional: Clean up date entry if no completions left for that date
          if (Object.keys(updated[date]).length === 0) {
            delete updated[date];
          }
        }
      });
      return updated;
    });
  };

  // Function to toggle completion status for a habit on a specific date
  const toggleHabitCompletion = (habitId, date) => {
    // Format date to YYYY-MM-DD for consistency
    const dateKey = date
      ? new Date(date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    setCompletions((prev) => {
      const dateCompletions = prev[dateKey] || {};
      // Determine the new status: toggle the current status
      const isCurrentlyCompleted = dateCompletions[habitId] === true;
      const newStatus = !isCurrentlyCompleted;

      const newDateCompletions = {
        ...dateCompletions,
        [habitId]: newStatus,
      };

      // Check if *any* habit for this date is now marked as true
      // This helps clean up localStorage by removing date entries with no true completions
      const hasAnyTrueCompletion = Object.values(newDateCompletions).some(status => status === true);

      if (!hasAnyTrueCompletion && Object.keys(newDateCompletions).length > 0) {
         // If no true completions left and there were entries, remove the date key
         const { [dateKey]: _, ...rest } = prev;
         return rest;
      } else if (!hasAnyTrueCompletion && Object.keys(newDateCompletions).length === 0) {
         // If no true completions and no entries, return prev state (no change needed)
         return prev;
      }
      else {
        // Otherwise, update the date entry with the new status
        return {
          ...prev,
          [dateKey]: newDateCompletions,
        };
      }
    });
  };


  return (
    <BrowserRouter>
      {/* Add class 'sidebar-open' to app container when mobile sidebar is open */}
      <div className={`app ${isSidebarMobileOpen ? 'sidebar-open' : ''}`}>
        {/* Header component - needs to accept onMenuToggle prop */}
        <Header onMenuToggle={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)} />

        <div className="app-body">
          {/* Sidebar component - needs to accept isOpen and onClose props */}
          <Sidebar
            isOpen={isSidebarMobileOpen}
            onClose={() => setIsSidebarMobileOpen(false)}
          />

          {/* Backdrop overlay for mobile sidebar */}
          {isSidebarMobileOpen && (
            <div
              className="sidebar-backdrop"
              onClick={() => setIsSidebarMobileOpen(false)}
              aria-hidden="true" // Hide from screen readers
            ></div>
          )}

          {/* Main content area - its margin is controlled by App.css based on sidebar state */}
          <main className="main-content">
            <Routes>
              {/* Wrap routes with RouteWrapper to close mobile sidebar on navigation */}
              <Route
                path="/"
                element={
                  <RouteWrapper onCloseSidebar={() => setIsSidebarMobileOpen(false)}>
                    <Dashboard habits={habits} completions={completions} />
                  </RouteWrapper>
                }
              />

              <Route
                path="/habits"
                element={
                   <RouteWrapper onCloseSidebar={() => setIsSidebarMobileOpen(false)}>
                    <HabitList
                      habits={habits}
                      onAddHabit={addHabit}
                      onUpdateHabit={updateHabit}
                      onDeleteHabit={deleteHabit}
                      completions={completions}
                    />
                   </RouteWrapper>
                }
              />

              <Route
                path="/tracker"
                element={
                   <RouteWrapper onCloseSidebar={() => setIsSidebarMobileOpen(false)}>
                    <DailyTracker
                      habits={habits}
                      completions={completions}
                      onToggleCompletion={toggleHabitCompletion}
                    />
                   </RouteWrapper>
                }
              />

              <Route
                path="/calendar"
                element={
                   <RouteWrapper onCloseSidebar={() => setIsSidebarMobileOpen(false)}>
                    <Calendar
                      habits={habits}
                      completions={completions}
                      onToggleCompletion={toggleHabitCompletion}
                    />
                   </RouteWrapper>
                }
              />

              {/* Analytics route, currently rendering the same Dashboard component */}
               <Route
                path="/analytics"
                element={
                   <RouteWrapper onCloseSidebar={() => setIsSidebarMobileOpen(false)}>
                    <Dashboard habits={habits} completions={completions} />
                   </RouteWrapper>
                }
              />
            </Routes>
          </main>
        </div>

        {/* Footer component */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;