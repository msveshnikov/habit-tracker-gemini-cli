import React from "react";
import Button from "../ui/Button";

const HabitCard = ({ habit, onComplete, onEdit, onDelete }) => {
  const today = new Date().toISOString().split("T")[0];
  const isCompletedToday =
    habit.completions && habit.completions.includes(today);

  return (
    <div className={`habit-card ${isCompletedToday ? "completed" : ""}`}>
      <div className="habit-info">
        <h3>{habit.name}</h3>
        <p>{habit.description}</p>
        <div className="habit-streak">
          <span>Streak: {habit.streak || 0}</span>
        </div>
      </div>
      <div className="habit-actions">
        <Button
          onClick={onComplete}
          variant={isCompletedToday ? "secondary" : "primary"}
        >
          {isCompletedToday ? "Undo" : "Complete"}
        </Button>
        <Button onClick={onEdit} variant="secondary">
          Edit
        </Button>
        <Button onClick={onDelete} variant="danger">
          Delete
        </Button>
      </div>
      <style jsx>{`
        .habit-card {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s ease-in-out;
        }
        .habit-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
        }
        .habit-card.completed {
          background-color: #f0fdf4;
          border-left: 4px solid #22c55e;
        }
        .habit-info h3 {
          margin: 0 0 10px;
          font-size: 1.4rem;
          color: #333;
        }
        .habit-info p {
          margin: 0 0 15px;
          color: #666;
          font-size: 0.95rem;
          min-height: 40px;
        }
        .habit-streak {
          font-weight: bold;
          color: #16a34a;
        }
        .habit-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
};

export default HabitCard;
