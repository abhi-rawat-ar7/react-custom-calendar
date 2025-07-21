// src/components/MonthlyCalendar.js
import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  addDays,
} from 'date-fns';
import MonthlyDayCell from './MonthlyDayCell';
import './Calendar.css';

const MonthlyCalendar = ({ events, onDayClick, onEventClick, onDropEvent }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const header = () => {
    const dateFormat = 'MMMM yyyy';
    return (
      <div className="header row flex-middle">
        <div className="col col-start">
          {/* Added className="material-icons" here */}
          <div className="icon material-icons" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            chevron_left
          </div>
        </div>
        <div className="col col-center">
          <span>{format(currentMonth, dateFormat)}</span>
        </div>
        <div className="col col-end" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          {/* Added className="material-icons" here */}
          <div className="icon material-icons">chevron_right</div>
        </div>
      </div>
    );
  };

  const days = () => {
    const dateFormat = 'EEE'; // Mon, Tue, Wed, etc.
    const days = [];
    let startDate = startOfWeek(currentMonth, { weekStartsOn: 1 }); // Monday as start of week

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col col-center" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="days row">{days}</div>;
  };

  const cells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let daysInWeek = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;

        daysInWeek.push(
          <MonthlyDayCell
            key={cloneDay.toISOString()}
            day={cloneDay}
            monthStart={monthStart}
            events={events}
            onDayClick={onDayClick}
            onEventClick={onEventClick}
            onDropEvent={onDropEvent}
          />
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day.toISOString()}>
          {daysInWeek}
        </div>
      );
      daysInWeek = [];
    }
    return <div className="body">{rows}</div>;
  };

  return (
    <div className="calendar">
      {header()}
      {days()}
      {cells()}
    </div>
  );
};

export default MonthlyCalendar;