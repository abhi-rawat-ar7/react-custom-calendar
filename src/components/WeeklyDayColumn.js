// src/components/WeeklyDayColumn.js
import React from 'react';
import { useDrop } from 'react-dnd';
import { format, parseISO, isSameDay, isAfter, isBefore, addDays } from 'date-fns';
import EventItem from './EventItem';

const WeeklyDayColumn = ({ day, events, onDayClick, onEventClick, onDropEvent }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23 hours

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'event',
    drop: (item, monitor) => {
      if (!monitor.didDrop()) return;
      const oldEventStart = parseISO(item.oldStart);
      const newDroppedDate = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        oldEventStart.getHours(),
        oldEventStart.getMinutes()
      );
      onDropEvent(item.id, newDroppedDate);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [day, onDropEvent]);

  const eventsForThisDay = events.filter(event => {
      const eventStartDate = parseISO(event.start);
      const eventEndDate = parseISO(event.end);

      if (!event.recurrence || event.recurrence === 'none') {
          return isSameDay(day, eventStartDate) ||
                 isSameDay(day, eventEndDate) ||
                 (isAfter(day, eventStartDate) && isBefore(day, eventEndDate));
      }

      switch (event.recurrence) {
          case 'daily':
              return isAfter(day, eventStartDate) || isSameDay(day, eventStartDate);
          case 'weekly':
              const dayOfWeekIndex = day.getDay();
              return (event.selectedDaysOfWeek && event.selectedDaysOfWeek.includes(dayOfWeekIndex)) &&
                     (isAfter(day, eventStartDate) || isSameDay(day, eventStartDate));
          case 'monthly':
              return (eventStartDate.getDate() === day.getDate()) &&
                     (isAfter(day, eventStartDate) || isSameDay(day, eventStartDate));
          default:
              return false;
      }
  }).sort((a, b) => {
      return parseISO(a.start).getTime() - parseISO(b.start).getTime();
  });

  return (
    <div
      key={day.toISOString()} // Use ISO string as key
      ref={drop}
      className={`day-column ${isOver ? 'highlight-drop' : ''} ${isSameDay(day, new Date()) ? 'current-day-column' : ''}`}
      onClick={() => onDayClick(day)}
    >
      {hours.map(hour => (
        <div className="time-slot" key={hour}></div>
      ))}
      <div className="day-events-overlay">
          {eventsForThisDay.map(event => {
              const eventStart = parseISO(event.start);
              const eventEnd = parseISO(event.end);
              const startOfDay = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());

              const topPosition = (eventStart.getHours() * 60 + eventStart.getMinutes()) / 1440 * 100;
              const height = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60) / 1440 * 100;

              let actualTopPosition = topPosition;
              let actualHeight = height;

              if (!isSameDay(day, eventStart) && event.recurrence === 'none') {
                  actualTopPosition = 0;
                  const endOfThisDay = addDays(startOfDay, 1);
                  actualHeight = (Math.min(eventEnd.getTime(), endOfThisDay.getTime()) - day.getTime()) / (1000 * 60) / 1440 * 100;
              }

              return (
                  <EventItem
                      key={event.id}
                      event={event}
                      onEventClick={onEventClick}
                      style={{
                          top: `${actualTopPosition}%`,
                          height: `${actualHeight}%`,
                          position: 'absolute',
                          width: 'calc(100% - 4px)',
                          left: '2px',
                          zIndex: 1,
                      }}
                  />
              );
          })}
      </div>
    </div>
  );
};

export default WeeklyDayColumn;