// src/components/EventItem.js
import React from 'react';
import { useDrag } from 'react-dnd';
import { format, parseISO } from 'date-fns';

const EventItem = ({ event, onEventClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'event',
    item: { id: event.id, oldStart: event.start, oldEnd: event.end, recurrence: event.recurrence },
    canDrag: !event.recurrence || event.recurrence === 'none',
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const itemStyle = {
    opacity: isDragging ? 0.5 : 1,
    cursor: (!event.recurrence || event.recurrence === 'none') ? 'move' : 'default',
  };

  // Generate a class name based on the category for styling
  const categoryClass = event.category ? `category-${event.category.toLowerCase().replace(/\s/g, '-')}` : '';

  return (
    <div
      ref={(!event.recurrence || event.recurrence === 'none') ? drag : null}
      className={`event-item ${event.recurrence && event.recurrence !== 'none' ? 'recurring-event' : ''} ${categoryClass}`}
      style={itemStyle}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event);
      }}
    >
      {format(parseISO(event.start), 'HH:mm')} {event.title}
      {event.recurrence && event.recurrence !== 'none' && (
        <span className="recurrence-indicator"> (R)</span>
      )}
    </div>
  );
};

export default EventItem;