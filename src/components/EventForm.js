// src/components/EventForm.js
import React, { useState, useEffect } from 'react';
import './EventForm.css';
import { format, parseISO } from 'date-fns';

const EventForm = ({ event, date, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [eventDate, setEventDate] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState([]);
  const [category, setCategory] = useState('General'); // New state for category

  // Predefined categories
  const categories = ['General', 'Work', 'Personal', 'Meeting', 'Holiday', 'Study', 'Health'];

  const daysOfWeek = [
    { name: 'Monday', short: 'Mon', index: 1 },
    { name: 'Tuesday', short: 'Tue', index: 2 },
    { name: 'Wednesday', short: 'Wed', index: 3 },
    { name: 'Thursday', short: 'Thu', index: 4 },
    { name: 'Friday', short: 'Fri', index: 5 },
    { name: 'Saturday', short: 'Sat', index: 6 },
    { name: 'Sunday', short: 'Sun', index: 0 },
  ];

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setStartTime(format(parseISO(event.start), 'HH:mm'));
      setEndTime(format(parseISO(event.end), 'HH:mm'));
      setEventDate(format(parseISO(event.start), 'yyyy-MM-dd'));
      setRecurrence(event.recurrence || 'none');
      setSelectedDaysOfWeek(event.selectedDaysOfWeek || []);
      setCategory(event.category || 'General'); // Initialize category
    } else if (date) {
      setTitle('');
      setDescription('');
      setStartTime('09:00');
      setEndTime('10:00');
      setEventDate(format(date, 'yyyy-MM-dd'));
      setRecurrence('none');
      setSelectedDaysOfWeek([]);
      setCategory('General'); // Default category for new events
    }
  }, [event, date]);

  const handleDayOfWeekChange = (dayIndex) => {
    setSelectedDaysOfWeek(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      id: event ? event.id : Date.now(),
      title,
      description,
      start: `${eventDate}T${startTime}:00`,
      end: `${eventDate}T${endTime}:00`,
      recurrence,
      ...(recurrence === 'weekly' && { selectedDaysOfWeek }),
      category, // Include category in the event object
    };
    onSave(newEvent);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
      onClose();
    }
  };

  return (
    <div className="event-form-overlay">
      <div className="event-form-container">
        <h2>{event ? 'Edit Event' : 'Add New Event'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Event Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventDate">Date:</label>
            <input
              type="date"
              id="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group time-group">
            <label htmlFor="startTime">Time:</label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <span> - </span>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="recurrence">Recurrence:</label>
            <select
              id="recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly (on selected days)</option>
              <option value="monthly">Monthly (on same day of month)</option>
            </select>
          </div>

          {recurrence === 'weekly' && (
            <div className="form-group days-of-week-selection">
              <label>Repeat on:</label>
              <div className="days-checkboxes">
                {daysOfWeek.map((day) => (
                  <label key={day.index} className="day-checkbox">
                    <input
                      type="checkbox"
                      value={day.index}
                      checked={selectedDaysOfWeek.includes(day.index)}
                      onChange={() => handleDayOfWeekChange(day.index)}
                    />
                    {day.short}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button">Save Event</button>
            {event && (
              <button type="button" onClick={handleDelete} className="delete-button">
                Delete Event
              </button>
            )}
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;