import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format } from "date-fns";
import { parse } from "date-fns";
import { startOfWeek } from "date-fns";
import { getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

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

type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  priority?: "low" | "medium" | "high";
};

export default function CalendarView() {
  const [view, setView] = useState<"month" | "week" | "day">(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const events: CalendarEvent[] = [
    {
      id: 1,
      title: "Team Meeting",
      start: new Date(2023, 5, 18, 10, 0),
      end: new Date(2023, 5, 18, 11, 30),
      priority: "high",
    },
    {
      id: 2,
      title: "Project Deadline",
      start: new Date(2023, 5, 20),
      end: new Date(2023, 5, 20),
      allDay: true,
      priority: "medium",
    },
  ];

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "";
    if (event.priority === "high") {
      backgroundColor = darkMode ? "#7f1d1d" : "#fecaca";
    } else if (event.priority === "medium") {
      backgroundColor = darkMode ? "#9a3412" : "#fed7aa";
    } else {
      backgroundColor = darkMode ? "#166534" : "#bbf7d0";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        border: "0px",
        color: darkMode ? "#f8fafc" : "#1e293b",
      },
    };
  };

  return (
    <div
      className={`bg-surface border border-border/50 rounded-lg overflow-hidden h-[600px] flex flex-col ${
        darkMode ? "dark" : ""
      }`}
    >
      <div className="p-4 border-b border-border/50 flex items-center gap-2">
        <CalendarDaysIcon className="h-5 w-5 text-primary" />
        <h2 className="font-medium">Calendar View</h2>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setView(Views.MONTH)}
            className={`px-3 py-1 text-sm rounded-md ${
              view === Views.MONTH ? "bg-primary text-surface" : "bg-background"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView(Views.WEEK)}
            className={`px-3 py-1 text-sm rounded-md ${
              view === Views.WEEK ? "bg-primary text-surface" : "bg-background"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView(Views.DAY)}
            className={`px-3 py-1 text-sm rounded-md ${
              view === Views.DAY ? "bg-primary text-surface" : "bg-background"
            }`}
          >
            Day
          </button>
        </div>
      </div>

      <div className="flex-1 p-2">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          view={view}
          onView={(newView) => {
            if (newView === Views.MONTH || newView === Views.WEEK || newView === Views.DAY) {
              setView(newView);
            }
          }}
          date={date}
          onNavigate={setDate}
          views={[Views.DAY, Views.WEEK, Views.MONTH]}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: () => null, // Hide default toolbar
          }}
        />
      </div>
    </div>
  );
}
