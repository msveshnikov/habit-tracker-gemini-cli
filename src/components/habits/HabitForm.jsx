import React, { useState, useEffect } from "react";
import Button from "../ui/Button";

const HabitForm = ({ habit, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || "",
        description: habit.description || "",
      });
    }
  }, [habit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Habit name is required.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="habit-form">
      <h2>{habit ? "Edit Habit" : "Create a New Habit"}</h2>

      <div className="form-group">
        <label htmlFor="name">Habit Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Drink 8 glasses of water"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          placeholder="Why is this habit important to you?"
        ></textarea>
      </div>

      <div className="form-actions">
        <Button type="submit" variant="primary">
          {habit ? "Save Changes" : "Create Habit"}
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>

      <style jsx>{`
        .habit-form {
          padding: 25px;
          background: #fff;
          border-radius: 8px;
          width: 100%;
          max-width: 500px;
        }
        .habit-form h2 {
          margin-top: 0;
          margin-bottom: 25px;
          text-align: center;
          font-size: 1.8rem;
          color: #333;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #555;
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
          box-sizing: border-box;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 30px;
        }
      `}</style>
    </form>
  );
};

export default HabitForm;
