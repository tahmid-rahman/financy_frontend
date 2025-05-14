import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { format } from "date-fns/format";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

// Properly initialize localizer
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
  const [events] = useState<CalendarEvent[]>([
    {
      id: 1,
      title: "Team Meeting",
      start: new Date(2023, 5, 18, 10, 0), // June 18, 2023 10:00 AM
      end: new Date(2023, 5, 18, 11, 30), // June 18, 2023 11:30 AM
      priority: "high",
    },
    {
      id: 2,
      title: "Project Deadline",
      start: new Date(2023, 5, 20), // June 20, 2023 (all day)
      end: new Date(2023, 5, 20), // June 20, 2023 (all day)
      allDay: true,
      priority: "medium",
    },
    {
      id: 3,
      title: "Client Call",
      start: new Date(2023, 5, 22, 14, 0), // June 22, 2023 2:00 PM
      end: new Date(2023, 5, 22, 14, 30), // June 22, 2023 2:30 PM
      priority: "low",
    },
  ]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "";
    if (event.priority === "high") {
      backgroundColor = "#fecaca"; // red-200
    } else if (event.priority === "medium") {
      backgroundColor = "#fed7aa"; // orange-200
    } else {
      backgroundColor = "#bbf7d0"; // green-200
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        border: "0px",
        color: "#1e293b", // slate-800
      },
    };
  };

  return (
    <div className="bg-surface border border-border/50 rounded-lg overflow-hidden h-[600px] flex flex-col">
      <div className="p-4 border-b border-border/50 flex items-center gap-2">
        <CalendarDaysIcon className="h-5 w-5 text-primary" />
        <h2 className="font-medium">Calendar View</h2>
      </div>

      <div className="flex-1 p-2">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          defaultView="week"
          views={["day", "week", "month"]}
          eventPropGetter={eventStyleGetter}
          components={{
            event: ({ event }) => (
              <div className="px-2 py-1">
                <strong>{event.title}</strong>
                {!event.allDay && (
                  <div className="text-xs">
                    {format(event.start, "h:mm a")}
                    {event.end && ` - ${format(event.end, "h:mm a")}`}
                  </div>
                )}
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
