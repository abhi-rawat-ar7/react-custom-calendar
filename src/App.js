// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MonthlyCalendar from './components/MonthlyCalendar'; // Renamed import
import WeeklyCalendar from './components/WeeklyCalendar';   // New import
import DailyCalendar from './components/DailyCalendar';     // New import
import EventForm from './components/EventForm';
import './App.css';
import {
  parseISO,
  format,
  differenceInMinutes,
  addDays,
  isBefore,
  isAfter,
  isSameDay,
  areIntervalsOverlapping,
  addMinutes,
} from 'date-fns';

function App() {
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentView, setCurrentView] = useState('month'); // New state for current view

  // Predefined categories (must match EventForm.js)
  const categories = ['All', 'General', 'Work', 'Personal', 'Meeting', 'Holiday', 'Study', 'Health'];

  // Load events from local storage on initial render
  useEffect(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  // Save events to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  // Helper function to check for conflicts (no change needed here, it's generic)
  const checkEventConflicts = useCallback((newEvent, allEvents) => {
    const newEventStart = parseISO(newEvent.start);
    const newEventEnd = parseISO(newEvent.end);

    if (isNaN(newEventStart.getTime()) || isNaN(newEventEnd.getTime())) {
        console.error("Invalid date for new event conflict check:", newEvent);
        return false;
    }

    return allEvents.some(existingEvent => {
      if (existingEvent.id === newEvent.id) return false;

      const existingEventStart = parseISO(existingEvent.start);
      const existingEventEnd = parseISO(existingEvent.end);

      if (isNaN(existingEventStart.getTime()) || isNaN(existingEventEnd.getTime())) {
          console.error("Invalid date for existing event conflict check:", existingEvent);
          return false;
      }

      if (!existingEvent.recurrence || existingEvent.recurrence === 'none') {
        return areIntervalsOverlapping(
          { start: newEventStart, end: newEventEnd },
          { start: existingEventStart, end: existingEventEnd },
          { inclusive: true }
        );
      }

      if (!newEvent.recurrence || newEvent.recurrence === 'none') {
        if (isBefore(newEventStart, existingEventStart) && !isSameDay(newEventStart, existingEventStart)) {
            return false;
        }

        let simulatedExistingEventStart;
        let simulatedExistingEventEnd;

        switch (existingEvent.recurrence) {
          case 'daily':
             simulatedExistingEventStart = new Date(newEventStart.getFullYear(), newEventStart.getMonth(), newEventStart.getDate(), existingEventStart.getHours(), existingEventStart.getMinutes());
             simulatedExistingEventEnd = addMinutes(simulatedExistingEventStart, differenceInMinutes(existingEventEnd, existingEventStart));
            break;
          case 'weekly':
            const newEventDayOfWeek = newEventStart.getDay();
            if (existingEvent.selectedDaysOfWeek && existingEvent.selectedDaysOfWeek.includes(newEventDayOfWeek) &&
                (isSameDay(newEventStart, existingEventStart) || isAfter(newEventStart, existingEventStart))) {
                simulatedExistingEventStart = new Date(newEventStart.getFullYear(), newEventStart.getMonth(), newEventStart.getDate(), existingEventStart.getHours(), existingEventStart.getMinutes());
                simulatedExistingEventEnd = addMinutes(simulatedExistingEventStart, differenceInMinutes(existingEventEnd, existingEventStart));
            } else {
                return false;
            }
            break;
          case 'monthly':
            if (newEventStart.getDate() === existingEventStart.getDate() &&
                (isSameDay(newEventStart, existingEventStart) || isAfter(newEventStart, existingEventStart))) {
                simulatedExistingEventStart = new Date(newEventStart.getFullYear(), newEventStart.getMonth(), newEventStart.getDate(), existingEventStart.getHours(), existingEventStart.getMinutes());
                simulatedExistingEventEnd = addMinutes(simulatedExistingEventStart, differenceInMinutes(existingEventEnd, existingEventStart));
            } else {
                return false;
            }
            break;
          default:
            return false;
        }

        return areIntervalsOverlapping(
            { start: newEventStart, end: newEventEnd },
            { start: simulatedExistingEventStart, end: simulatedExistingEventEnd },
            { inclusive: true }
        );
      }
      return false;
    });
  }, []);

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEventClick = (event) => {
    setEditingEvent(event);
    setSelectedDate(null);
    setShowEventForm(true);
  };

  const handleSaveEvent = (newEvent) => {
    if (newEvent.id) {
      const updatedEvents = events.map(e => e.id === newEvent.id ? newEvent : e);
      if (checkEventConflicts(newEvent, updatedEvents)) {
        alert('This event conflicts with an existing event. Please choose a different time.');
        return;
      }
      setEvents(updatedEvents);
    } else {
      const eventWithId = { ...newEvent, id: Date.now() };
      if (checkEventConflicts(eventWithId, events)) {
        alert('This event conflicts with an existing event. Please choose a different time.');
        return;
      }
      setEvents([...events, eventWithId]);
    }
    setShowEventForm(false);
    setSelectedDate(null);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
    setShowEventForm(false);
    setSelectedDate(null);
    setEditingEvent(null);
  };

  const handleCloseForm = () => {
    setShowEventForm(false);
    setSelectedDate(null);
    setEditingEvent(null);
  };

  const handleDropEvent = (eventId, newDate) => {
    setEvents(prevEvents => {
      const updatedEvents = prevEvents.map(event => {
        if (event.id === eventId) {
          const oldStart = parseISO(event.start);
          const oldEnd = parseISO(event.end);
          const duration = differenceInMinutes(oldEnd, oldStart);

          const newStart = new Date(
            newDate.getFullYear(),
            newDate.getMonth(),
            newDate.getDate(),
            oldStart.getHours(),
            oldStart.getMinutes()
          );
          const newEnd = addMinutes(newStart, duration);

          const updatedEvent = {
            ...event,
            start: format(newStart, "yyyy-MM-dd'T'HH:mm:ss"),
            end: format(newEnd, "yyyy-MM-dd'T'HH:mm:ss"),
          };

          const eventsForConflictCheck = prevEvents.filter(e => e.id !== eventId).concat(updatedEvent);

          if (checkEventConflicts(updatedEvent, eventsForConflictCheck)) {
            alert('Cannot reschedule: This event would conflict with another event.');
            return event;
          }
          return updatedEvent;
        }
        return event;
      });
      return updatedEvents;
    });
  };

  // Filtered events based on search term AND category filter
  const filteredEvents = events.filter(event => {
    const matchesSearchTerm =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'All' || event.category === categoryFilter;

    return matchesSearchTerm && matchesCategory;
  });

  const renderCalendar = () => {
    switch (currentView) {
      case 'week':
        return (
          <WeeklyCalendar
            events={filteredEvents}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            onDropEvent={handleDropEvent}
          />
        );
      case 'day':
        return (
          <DailyCalendar
            events={filteredEvents}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            onDropEvent={handleDropEvent}
          />
        );
      case 'month':
      default:
        return (
          <MonthlyCalendar
            events={filteredEvents}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            onDropEvent={handleDropEvent}
          />
        );
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <h1>Custom Event Calendar</h1>
        <div className="filter-controls">
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search events by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="category-filter-container">
            <label htmlFor="categoryFilter">Filter by Category:</label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-filter-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="view-selector"> {/* New container for view buttons */}
          <button
            className={`view-button ${currentView === 'month' ? 'active' : ''}`}
            onClick={() => setCurrentView('month')}
          >
            Month
          </button>
          <button
            className={`view-button ${currentView === 'week' ? 'active' : ''}`}
            onClick={() => setCurrentView('week')}
          >
            Week
          </button>
          <button
            className={`view-button ${currentView === 'day' ? 'active' : ''}`}
            onClick={() => setCurrentView('day')}
          >
            Day
          </button>
        </div>

        {renderCalendar()} {/* Render the selected calendar component */}

        {showEventForm && (
          <EventForm
            date={selectedDate}
            event={editingEvent}
            onClose={handleCloseForm}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;