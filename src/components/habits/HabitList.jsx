import React, { useState, useEffect } from "react";
import HabitCard from "./HabitCard";
import HabitForm from "./HabitForm";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Loading from "../ui/Loading";

const HabitList = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const savedHabits = localStorage.getItem("habits");
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
    } catch (error) {
      console.error("Failed to load habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = (updatedHabits) => {
    try {
      localStorage.setItem("habits", JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
    } catch (error) {
      console.error("Failed to save habits:", error);
    }
  };

  const handleAddHabit = (habitData) => {
    const newHabit = {
      id: Date.now().toString(),
      ...habitData,
      createdAt: new Date().toISOString(),
      streak: 0,
      completions: [],
    };
    const updatedHabits = [...habits, newHabit];
    saveHabits(updatedHabits);
    setShowForm(false);
  };

  const handleEditHabit = (habitData) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === editingHabit.id
        ? { ...habit, ...habitData, updatedAt: new Date().toISOString() }
        : habit,
    );
    saveHabits(updatedHabits);
    setEditingHabit(null);
    setShowForm(false);
  };

  const handleDeleteHabit = (habitId) => {
    const updatedHabits = habits.filter((habit) => habit.id !== habitId);
    saveHabits(updatedHabits);
  };

  const handleCompleteHabit = (habitId) => {
    const today = new Date().toISOString().split("T")[0];
    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const completions = habit.completions || [];
        const isAlreadyCompleted = completions.includes(today);

        if (isAlreadyCompleted) {
          return {
            ...habit,
            completions: completions.filter((date) => date !== today),
          };
        } else {
          return {
            ...habit,
            completions: [...completions, today],
            streak: calculateStreak([...completions, today]),
          };
        }
      }
      return habit;
    });
    saveHabits(updatedHabits);
  };

  const calculateStreak = (completions) => {
    if (!completions.length) return 0;

    const sortedDates = completions.sort((a, b) => new Date(b) - new Date(a));
    const today = new Date().toISOString().split("T")[0];
    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < sortedDates.length; i++) {
      const completionDate = new Date(sortedDates[i]);
      const diffDays = Math.floor(
        (currentDate - completionDate) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const openEditForm = (habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const getFilteredHabits = () => {
    let filtered = habits;

    if (filter === "active") {
      filtered = habits.filter((habit) => !habit.archived);
    } else if (filter === "completed") {
      const today = new Date().toISOString().split("T")[0];
      filtered = habits.filter(
        (habit) => habit.completions && habit.completions.includes(today),
      );
    } else if (filter === "pending") {
      const today = new Date().toISOString().split("T")[0];
      filtered = habits.filter(
        (habit) => !habit.completions || !habit.completions.includes(today),
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "streak":
          return (b.streak || 0) - (a.streak || 0);
        case "created":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return <Loading />;
  }

  const filteredHabits = getFilteredHabits();

  return (
    <div className="habit-list">
      <div className="habit-list-header">
        <h2>My Habits</h2>
        <Button onClick={() => setShowForm(true)} variant="primary">
          Add New Habit
        </Button>
      </div>

      <div className="habit-controls">
        <div className="filters">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Habits</option>
            <option value="active">Active</option>
            <option value="completed">Completed Today</option>
            <option value="pending">Pending Today</option>
          </select>
        </div>

        <div className="sort">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="streak">Sort by Streak</option>
            <option value="created">Sort by Date Created</option>
          </select>
        </div>
      </div>

      <div className="habits-grid">
        {filteredHabits.length === 0 ? (
          <div className="empty-state">
            <p>No habits found. Start building better habits today!</p>
            <Button onClick={() => setShowForm(true)} variant="primary">
              Create Your First Habit
            </Button>
          </div>
        ) : (
          filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onComplete={() => handleCompleteHabit(habit.id)}
              onEdit={() => openEditForm(habit)}
              onDelete={() => handleDeleteHabit(habit.id)}
            />
          ))
        )}
      </div>

      {showForm && (
        <Modal onClose={closeForm}>
          <HabitForm
            habit={editingHabit}
            onSubmit={editingHabit ? handleEditHabit : handleAddHabit}
            onCancel={closeForm}
          />
        </Modal>
      )}

      <style jsx>{`
        .habit-list {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .habit-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .habit-list-header h2 {
          margin: 0;
          font-size: 2rem;
          color: #333;
        }

        .habit-controls {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .filter-select,
        .sort-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          font-size: 14px;
        }

        .habits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .empty-state p {
          font-size: 1.1rem;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .habit-list {
            padding: 15px;
          }

          .habit-list-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .habit-controls {
            flex-direction: column;
          }

          .habits-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HabitList;
