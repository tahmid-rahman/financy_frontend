import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
// TypeScript may complain about missing type declarations for this css import
// @ts-ignore
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getTasks } from "../../services/api";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

type Task = {
  id: number;
  title: string;
  due_date: string;
  start_time?: string | null;
  end_time?: string | null;
  all_day?: boolean;
  priority?: "low" | "medium" | "high";
  completed: boolean;
};

type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  priority?: "low" | "medium" | "high";
  completed: boolean;
};

export default function CalendarView() {
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchTasks() {
      try {
        setIsLoading(true);
        const res = await getTasks();
        if (cancelled) return;

        // Backend returns { message: "...", data: [...] }
        // After API fix, response is now directly the data
        const rawData = res;
        const tasks: Task[] = rawData?.data || rawData || [];

        const calendarEvents: CalendarEvent[] = [];

        for (const task of tasks) {
          try {
            // Safe date parsing with fallback
            const dueDate = new Date(task.due_date);
            if (isNaN(dueDate.getTime())) {
              console.warn(`Invalid date for task ${task.id}: ${task.due_date}`);
              continue; // Skip invalid tasks
            }

            if (task.all_day || !task.start_time) {
              // All-day event: start and end are the same date
              calendarEvents.push({
                id: task.id,
                title: task.title,
                start: dueDate,
                end: dueDate,
                allDay: true,
                priority: task.priority,
                completed: task.completed,
              });
              continue;
            }

            // Time-specific event
            const [startHours, startMinutes] = task.start_time.split(":").map(Number);
            const startDate = new Date(dueDate);
            startDate.setHours(startHours, startMinutes, 0, 0);

            let endDate: Date;
            if (task.end_time) {
              const [endHours, endMinutes] = task.end_time.split(":").map(Number);
              endDate = new Date(dueDate);
              endDate.setHours(endHours, endMinutes, 0, 0);
            } else {
              // Default end time is 1 hour after start
              endDate = new Date(startDate);
              endDate.setHours(endDate.getHours() + 1);
            }

            calendarEvents.push({
              id: task.id,
              title: task.title,
              start: startDate,
              end: endDate,
              allDay: false,
              priority: task.priority,
              completed: task.completed,
            });
          } catch (err) {
            console.warn(`Failed to process task ${task.id}:`, err);
            // Continue processing other tasks
          }
        }

        setEvents(calendarEvents);
      } catch (err) {
        console.error("Failed to fetch tasks for calendar", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "";
    let borderColor = "";
    let textColor = "text-gray-900 dark:text-gray-100";

    if (event.completed) {
      return {
        className: "opacity-50 line-through",
        style: {
          backgroundColor: "#e5e7eb",
          borderLeft: "4px solid #9ca3af",
        },
      };
    }

    if (event.priority === "high") {
      backgroundColor = "bg-red-100 dark:bg-red-900/40";
      borderColor = "border-l-4 border-red-500 dark:border-red-400";
    } else if (event.priority === "medium") {
      backgroundColor = "bg-amber-100 dark:bg-amber-900/40";
      borderColor = "border-l-4 border-amber-500 dark:border-amber-400";
    } else {
      backgroundColor = "bg-green-100 dark:bg-green-900/40";
      borderColor = "border-l-4 border-green-500 dark:border-green-400";
    }

    return {
      className: `${backgroundColor} ${borderColor} ${textColor} rounded shadow-sm`,
    };
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleToday = () => {
    setDate(new Date());
  };

  const CustomToolbar = () => {
    const formattedDate = format(date, "MMMM yyyy");

    return (
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handleNavigate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}
            className="p-1 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          >
            Today
          </button>
          <button
            onClick={() => handleNavigate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}
            className="p-1 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            aria-label="Next month"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <span className="ml-1 sm:ml-2 font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200">
            {formattedDate}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-[700px] flex flex-col bg-white dark:bg-gray-800 animate-pulse">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <div className="flex-1 p-4">
          <div className="h-full bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-[calc(100vh-100px)] sm:h-[700px] flex flex-col bg-white dark:bg-gray-800">
      {/* Header with view controls */}
      <div className="p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800">
        <CalendarDaysIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200">Calendar</h2>
        <div className="ml-auto flex gap-1 sm:gap-2">
          <button
            onClick={() => setView(Views.MONTH)}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors ${
              view === Views.MONTH
                ? "bg-blue-600 dark:bg-blue-700 text-white"
                : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView(Views.WEEK)}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors ${
              view === Views.WEEK
                ? "bg-blue-600 dark:bg-blue-700 text-white"
                : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView(Views.DAY)}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors ${
              view === Views.DAY
                ? "bg-blue-600 dark:bg-blue-700 text-white"
                : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
            }`}
          >
            Day
          </button>
        </div>
      </div>

      {/* Main calendar container with proper scrolling */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{
              height: "100%",
              minHeight: "400px",
            }}
            view={view}
            onView={(newView) => {
              if (["month", "week", "day", "agenda"].includes(newView)) {
                setView(newView as any);
              }
            }}
            date={date}
            onNavigate={handleNavigate}
            views={[Views.DAY, Views.WEEK, Views.MONTH, "agenda"]}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelectedEvent(event)}
            components={{
              toolbar: CustomToolbar,
            }}
            className={`
              h-full
              [&_.rbc-header]:bg-gray-50 dark:[&_.rbc-header]:bg-gray-700
              [&_.rbc-header]:border-b-gray-200 dark:[&_.rbc-header]:border-b-gray-600
              [&_.rbc-header]:text-gray-800 dark:[&_.rbc-header]:text-gray-200
              [&_.rbc-off-range-bg]:bg-gray-50 dark:[&_.rbc-off-range-bg]:bg-gray-800/30
              [&_.rbc-off-range]:text-gray-400 dark:[&_.rbc-off-range]:text-gray-500
              [&_.rbc-today]:bg-blue-50/50 dark:[&_.rbc-today]:bg-blue-900/20
              [&_.rbc-event]:cursor-pointer
              [&_.rbc-time-content]:min-h-[300px] sm:[&_.rbc-time-content]:min-h-[500px]
              [&_.rbc-time-header]:text-gray-800 dark:[&_.rbc-time-header]:text-gray-200
              [&_.rbc-time-slot]:text-gray-600 dark:[&_.rbc-time-slot]:text-gray-400
              [&_.rbc-day-slot_.rbc-time-slot]:border-t-gray-200 dark:[&_.rbc-day-slot_.rbc-time-slot]:border-t-gray-700
              [&_.rbc-timeslot-group]:border-b-gray-200 dark:[&_.rbc-timeslot-group]:border-b-gray-700
              [&_.rbc-current-time-indicator]:bg-blue-600 dark:[&_.rbc-current-time-indicator]:bg-blue-400
            `}
          />
        </div>
      </div>

      {/* Event details modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg max-w-full sm:max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                aria-label="Close event details"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">When</p>
                <p>
                  {format(selectedEvent.start, "MMMM d, yyyy")}
                  {!selectedEvent.allDay &&
                    ` • ${format(selectedEvent.start, "h:mm a")} - ${format(selectedEvent.end, "h:mm a")}`}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                    selectedEvent.completed
                      ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {selectedEvent.completed ? "Completed" : "Pending"}
                </span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Priority</p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                    selectedEvent.priority === "high"
                      ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                      : selectedEvent.priority === "medium"
                      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
                      : "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                  }`}
                >
                  {selectedEvent.priority ? selectedEvent.priority.charAt(0).toUpperCase() + selectedEvent.priority.slice(1) : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}