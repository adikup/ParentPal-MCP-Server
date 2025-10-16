import React from "react";
import { createRoot } from "react-dom/client";
import { Calendar, MapPin, Clock, User, Heart, GraduationCap, Stethoscope, Cake, Trophy, Users } from "lucide-react";

// Event type mapping for icons and colors
const eventTypeConfig = {
  birthday: { icon: Cake, color: "bg-purple-100 text-purple-800", label: "Birthday" },
  doctor_appointment: { icon: Stethoscope, color: "bg-green-100 text-green-800", label: "Health" },
  school_event: { icon: GraduationCap, color: "bg-blue-100 text-blue-800", label: "Education" },
  vaccination: { icon: Stethoscope, color: "bg-green-100 text-green-800", label: "Health" },
  dental_checkup: { icon: Stethoscope, color: "bg-green-100 text-green-800", label: "Health" },
  sports_activity: { icon: Trophy, color: "bg-orange-100 text-orange-800", label: "Sports" },
  playdate: { icon: Users, color: "bg-pink-100 text-pink-800", label: "Social" },
  family_event: { icon: Users, color: "bg-pink-100 text-pink-800", label: "Family" },
  education: { icon: GraduationCap, color: "bg-blue-100 text-blue-800", label: "Education" },
  financial_benefits: { icon: Heart, color: "bg-red-100 text-red-800", label: "Benefits" },
  health: { icon: Stethoscope, color: "bg-green-100 text-green-800", label: "Health" },
  birthday_wish: { icon: Cake, color: "bg-purple-100 text-purple-800", label: "Birthday" },
  prep: { icon: Calendar, color: "bg-gray-100 text-gray-800", label: "Preparation" },
  baby_photo: { icon: Heart, color: "bg-pink-100 text-pink-800", label: "Photo" },
  custom: { icon: Calendar, color: "bg-gray-100 text-gray-800", label: "Custom" },
  holiday: { icon: Calendar, color: "bg-yellow-100 text-yellow-800", label: "Holiday" },
  school_pickup: { icon: GraduationCap, color: "bg-blue-100 text-blue-800", label: "School" },
  personal: { icon: User, color: "bg-indigo-100 text-indigo-800", label: "Personal" },
  school_vacation: { icon: GraduationCap, color: "bg-blue-100 text-blue-800", label: "School" },
  school_show: { icon: GraduationCap, color: "bg-blue-100 text-blue-800", label: "School" },
  parent_meeting: { icon: Users, color: "bg-blue-100 text-blue-800", label: "Meeting" },
  after_school: { icon: GraduationCap, color: "bg-blue-100 text-blue-800", label: "School" },
  field_trip: { icon: GraduationCap, color: "bg-blue-100 text-blue-800", label: "School" },
  registration: { icon: Calendar, color: "bg-orange-100 text-orange-800", label: "Registration" },
  registration_deadline: { icon: Calendar, color: "bg-red-100 text-red-800", label: "Deadline" },
  homework: { icon: GraduationCap, color: "bg-blue-100 text-blue-800", label: "Education" },
  photo: { icon: Heart, color: "bg-pink-100 text-pink-800", label: "Photo" },
  wish: { icon: Heart, color: "bg-pink-100 text-pink-800", label: "Wish" },
  other: { icon: Calendar, color: "bg-gray-100 text-gray-800", label: "Other" },
};

function EventCard({ event, child, user }) {
  const config = eventTypeConfig[event.eventType] || eventTypeConfig.other;
  const IconComponent = config.icon;
  
  const eventDate = new Date(event.eventDate.seconds * 1000);
  const isToday = eventDate.toDateString() === new Date().toDateString();
  const isPast = eventDate < new Date();
  
  const formatDate = (date) => {
    if (isToday) return "Today";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`px-3 -mx-2 rounded-2xl hover:bg-black/5 transition-colors ${
      isPast ? 'opacity-60' : ''
    }`}>
      <div className="flex w-full items-center gap-3 py-3">
        {/* Event Icon */}
        <div className={`p-2 rounded-lg ${config.color}`}>
          <IconComponent className="h-4 w-4" />
        </div>
        
        {/* Event Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm sm:text-base truncate">
                {event.title}
              </h3>
              {event.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {event.description}
                </p>
              )}
              
              {/* Event Meta */}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className={isToday ? 'font-medium text-blue-600' : ''}>
                    {formatDate(eventDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(eventDate)}</span>
                </div>
                {child && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{child.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Category Badge */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
              {config.label}
            </div>
          </div>
          
          {/* Action Links */}
          {event.actionLinks && event.actionLinks.length > 0 && (
            <div className="mt-2 flex gap-2">
              {event.actionLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                >
                  {link.title}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  // Get data from window.structuredContent (set by MCP server)
  const data = window.structuredContent || {};
  const events = data.events || [];
  const child = data.child;
  const user = data.user;
  const toolName = data.toolName;

  // Determine title based on tool used
  const getTitle = () => {
    switch (toolName) {
      case 'fetch-events-by-category':
        return `Events - ${events[0]?.eventType || 'Category'}`;
      case 'fetch-events-by-child':
        return child ? `${child.name}'s Events` : 'Child Events';
      case 'fetch-nearest-events':
        return 'Upcoming Events';
      default:
        return 'Parent Pal Events';
    }
  };

  const getSubtitle = () => {
    switch (toolName) {
      case 'fetch-events-by-category':
        return `Showing ${events.length} events in this category`;
      case 'fetch-events-by-child':
        return child ? `All events for ${child.name}` : 'Events for selected child';
      case 'fetch-nearest-events':
        return `Events happening soon`;
      default:
        return 'Your family events';
    }
  };

  return (
    <div className="antialiased w-full text-black px-4 pb-2 border border-black/10 rounded-2xl sm:rounded-3xl overflow-hidden bg-white">
      <div className="max-w-full">
        {/* Header */}
        <div className="flex flex-row items-center gap-4 sm:gap-4 border-b border-black/5 py-4">
          <div className="sm:w-18 w-16 aspect-square rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="text-base sm:text-xl font-medium">
              {getTitle()}
            </div>
            <div className="text-sm text-black/60">
              {getSubtitle()}
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="min-w-full text-sm flex flex-col">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div key={event.id}>
                <EventCard event={event} child={child} user={user} />
                {index < events.length - 1 && (
                  <div className="border-b border-black/5 mx-3" />
                )}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No events found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("parent-pal-events-root")).render(<App />);
