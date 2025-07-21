// src/components/DailyCalendar.js
import React, { useState } from 'react';
import {
  format,
  addDays,
  subDays,
  isSameDay,
  parseISO,
  isBefore,
  isAfter,
} from 'date-fns';
import { useDrop } from 'react-dnd';
import EventItem from './EventItem';
import './DailyCalendar.css';

const DailyCalendar = ({ events, onDayClick, onEventClick, onDropEvent }) => {
  const [currentDay, setCurrentDay] = useState(new Date());

  const header = () => {
    const dateFormat = 'EEEE, MMM d, yyyy';
    return (
      <div className="daily-header row flex-middle">
        <div className="col col-start">
          {/* Added 'material-icons' class here */}
          <div className="icon material-icons" onClick={() => setCurrentDay(subDays(currentDay, 1))}>
            chevron_left
          </div>
        </div>
        <div className="col col-center">
          <span>{format(currentDay, dateFormat)}</span>
        </div>
        <div className="col col-end" onClick={() => setCurrentDay(addDays(currentDay, 1))}>
          {/* Added 'material-icons' class here */}
          <div className="icon material-icons">chevron_right</div>
        </div>
      </div>
    );
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // useDrop Hook at the top level of the functional component
  const [{ isOver }, drop] = useDrop(() => ({
      accept: 'event',
      drop: (item, monitor) => {
          if (!monitor.didDrop()) return;
          const oldEventStart = parseISO(item.oldStart);
          const newDroppedDate = new Date(
              currentDay.getFullYear(),
              currentDay.getMonth(),
              currentDay.getDate(),
              oldEventStart.getHours(),
              oldEventStart.getMinutes()
          );
          onDropEvent(item.id, newDroppedDate);
      },
      collect: (monitor) => ({
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
      }),
  }), [currentDay, onDropEvent]);


  const eventsForThisDay = events.filter(event => {
      const eventStartDate = parseISO(event.start);
      const eventEndDate = parseISO(event.end);

      if (!event.recurrence || event.recurrence === 'none') {
          return isSameDay(currentDay, eventStartDate) ||
                 isSameDay(currentDay, eventEndDate) ||
                 (isAfter(currentDay, eventStartDate) && isBefore(currentDay, eventEndDate));
      }

      switch (event.recurrence) {
          case 'daily':
              return isAfter(currentDay, eventStartDate) || isSameDay(currentDay, eventStartDate);
          case 'weekly':
              const dayOfWeekIndex = currentDay.getDay();
              return (event.selectedDaysOfWeek && event.selectedDaysOfWeek.includes(dayOfWeekIndex)) &&
                     (isAfter(currentDay, eventStartDate) || isSameDay(currentDay, eventStartDate));
          case 'monthly':
              return (eventStartDate.getDate() === currentDay.getDate()) &&
                     (isAfter(currentDay, eventStartDate) || isSameDay(currentDay, eventStartDate));
          default:
              return false;
      }
  }).sort((a, b) => {
      return parseISO(a.start).getTime() - parseISO(b.start).getTime();
  });

  return (
    <div className="daily-calendar">
      {header()}
      <div
        ref={drop}
        className={`daily-event-grid ${isOver ? 'highlight-drop' : ''} ${isSameDay(currentDay, new Date()) ? 'current-day-column' : ''}`}
        onClick={() => onDayClick(currentDay)}
      >
        <div className="time-column">
          {hours.map(hour => (
            <div className="time-slot-label" key={hour}>
              {format(new Date(2000, 0, 1, hour, 0), 'ha')}
            </div>
          ))}
        </div>
        <div className="main-day-column">
          {hours.map(hour => (
            <div className="time-slot" key={hour}></div>
          ))}
          <div className="daily-events-overlay">
              {eventsForThisDay.map(event => {
                  const eventStart = parseISO(event.start);
                  const eventEnd = parseISO(event.end);
                  // The startOfDay variable is not strictly needed for position/height calculation relative to current day
                  // const startOfDay = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());

                  const totalMinutesInDay = 24 * 60; // Total minutes in a day
                  const eventStartMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
                  const eventDurationMinutes = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60);

                  let topPosition = (eventStartMinutes / totalMinutesInDay) * 100;
                  let height = (eventDurationMinutes / totalMinutesInDay) * 100;

                  // Adjust event display if it spans across midnight or is a recurring event starting before currentDay
                  if (!isSameDay(currentDay, eventStart) && event.recurrence === 'none') {
                      // If a non-recurring event starts before this day but extends into it,
                      // its top should be 0 and its height calculated from the beginning of this day.
                      topPosition = 0;
                      // Calculate duration from start of currentDay to eventEnd
                      height = (eventEnd.getTime() - currentDay.getTime()) / (1000 * 60) / totalMinutesInDay * 100;
                  } else if (isSameDay(currentDay, eventStart) && isAfter(eventEnd, addDays(eventStart, 1))) {
                    // If an event starts on this day but spans past midnight into the next day
                    // Its height should be capped at the end of the current day.
                    height = (addDays(eventStart, 1).getTime() - eventStart.getTime()) / (1000 * 60) / totalMinutesInDay * 100;
                  }

                  // Ensure height and topPosition are non-negative
                  topPosition = Math.max(0, topPosition);
                  height = Math.max(0, height);


                  return (
                      <EventItem
                          key={event.id}
                          event={event}
                          onEventClick={onEventClick}
                          style={{
                              top: `${topPosition}%`,
                              height: `${height}%`,
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
      </div>
    </div>
  );
};

export default DailyCalendar;