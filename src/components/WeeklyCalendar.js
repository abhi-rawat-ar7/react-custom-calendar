// src/components/WeeklyCalendar.js
import React, { useState } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  isSameDay,
} from 'date-fns';
import WeeklyDayColumn from './WeeklyDayColumn';
import './WeeklyCalendar.css';

const WeeklyCalendar = ({ events, onDayClick, onEventClick, onDropEvent }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday as start of week

  const daysInWeek = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const header = () => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return (
      <div className="weekly-header row flex-middle">
        <div className="col col-start">
          {/* Added material-icons class here */}
          <div className="icon material-icons" onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}>
            chevron_left
          </div>
        </div>
        <div className="col col-center">
          <span>
            {format(currentWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </span>
        </div>
        <div className="col col-end" onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}>
          {/* Added material-icons class here */}
          <div className="icon material-icons">chevron_right</div>
        </div>
      </div>
    );
  };

  const dayHeaders = () => {
    const dateFormat = 'EEE d';
    return (
      <div className="weekly-days row">
        {daysInWeek.map((day, index) => (
          <div className={`col col-center day-header ${isSameDay(day, new Date()) ? 'current-day-header' : ''}`} key={index}>
            {format(day, dateFormat)}
          </div>
        ))}
      </div>
    );
  };

  const eventGrid = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="weekly-event-grid">
        <div className="time-column">
          {hours.map(hour => (
            <div className="time-slot-label" key={hour}>
              {format(new Date(2000, 0, 1, hour, 0), 'ha')}
            </div>
          ))}
        </div>
        <div className="day-columns">
          {daysInWeek.map((day) => (
            <WeeklyDayColumn
              key={day.toISOString()}
              day={day}
              events={events}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
              onDropEvent={onDropEvent}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="weekly-calendar">
      {header()}
      {dayHeaders()}
      {eventGrid()}
    </div>
  );
};

export default WeeklyCalendar;