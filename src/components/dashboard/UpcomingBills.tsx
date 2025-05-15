import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

const scheduleItems = [
  {
    title: "Team Meeting",
    description: "Quarterly planning session",
    date: "2023-06-20",
    time: "10:00 AM",
    type: "meeting",
  },
  {
    title: "Doctor Appointment",
    description: "Annual checkup",
    date: "2023-06-22",
    time: "2:30 PM",
    type: "appointment",
  },
  {
    title: "Project Deadline",
    description: "Submit final deliverables",
    date: "2023-06-25",
    time: "11:59 PM",
    type: "deadline",
  },
];

const typeColors = {
  meeting: "bg-blue-500/10 text-blue-500",
  appointment: "bg-green-500/10 text-green-500",
  deadline: "bg-red-500/10 text-red-500",
};

export default function UpcomingSchedule() {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h2 className="text-lg font-semibold mb-4 text-text">Upcoming Schedule</h2>
      <div className="space-y-4">
        {scheduleItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3 p-3 hover:bg-background rounded-lg transition-colors">
            <div
              className={`flex-shrink-0 mt-1 w-2 h-2 rounded-full ${typeColors[item.type as keyof typeof typeColors]}`}
            ></div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text truncate">{item.title}</p>
              <p className="text-sm text-text-muted truncate">{item.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {item.date}
                </p>
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  {item.time}
                </p>
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded-md text-xs font-medium ${typeColors[item.type as keyof typeof typeColors]}`}
            >
              {item.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
