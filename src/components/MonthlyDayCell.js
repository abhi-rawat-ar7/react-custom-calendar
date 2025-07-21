// src/components/MonthlyDayCell.js
import React from 'react';
import { useDrop } from 'react-dnd';
import { isSameMonth, isSameDay, format, parseISO, isAfter, isBefore } from 'date-fns';
import EventItem from './EventItem';

const MonthlyDayCell = ({ day, monthStart, events, onDayClick, onEventClick, onDropEvent }) => {
  const formattedDate = format(day, 'd');

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'event',
    drop: (item, monitor) => {
      // Only allow drops on days within the current month
      if (!isSameMonth(day, monthStart) || !monitor.didDrop()) {
        return;
      }
      onDropEvent(item.id, day);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [day, monthStart, onDropEvent]);

  // Filter events for the current day, considering recurrence
  const dayEvents = events.filter(event => {
      const eventStartDate = parseISO(event.start);
      const eventEndDate = parseISO(event.end);

      // Condition for non-recurring events
      if (!event.recurrence || event.recurrence === 'none') {
          // Event starts/ends on this day, or spans across this day
          return isSameDay(day, eventStartDate) ||
                 isSameDay(day, eventEndDate) ||
                 (isAfter(day, eventStartDate) && isBefore(day, eventEndDate));
      }

      // Conditions for recurring events
      switch (event.recurrence) {
          case 'daily':
              // Daily events show from their start date onwards
              return isAfter(day, eventStartDate) || isSameDay(day, eventStartDate);
          case 'weekly':
              // Weekly events show if their selected day of week matches the current day
              // and they are on or after their start date
              const dayOfWeekIndex = day.getDay(); // 0 for Sunday, 1 for Monday...
              return (event.selectedDaysOfWeek && event.selectedDaysOfWeek.includes(dayOfWeekIndex)) &&
                     (isAfter(day, eventStartDate) || isSameDay(day, eventStartDate));
          case 'monthly':
              // Monthly events show if their day of month matches the current day
              // and they are on or after their start date
              return (eventStartDate.getDate() === day.getDate()) &&
                     (isAfter(day, eventStartDate) || isSameDay(day, eventStartDate));
          default:
              return false;
      }
  }).sort((a, b) => {
      // Sort events by start time for consistent display
      return parseISO(a.start).getTime() - parseISO(b.start).getTime();
  });

  return (
    <div
      ref={drop}
      className={`col cell ${
        !isSameMonth(day, monthStart)
          ? 'disabled' // Style for days outside the current month
          : isSameDay(day, new Date())
          ? 'current-day' // Style for today's date
          : ''
      } ${isOver ? 'highlight-drop' : ''}`} // Style for drag-and-drop hover
      onClick={() => onDayClick(day)} // Handle click to add new event
    >
      {/* Only one span for the date number */}
      <span className="number">{formattedDate}</span>
      <div className="events">
        {dayEvents.map(event => (
          <EventItem key={event.id} event={event} onEventClick={onEventClick} />
        ))}
      </div>
    </div>
  );
};

export default MonthlyDayCell;