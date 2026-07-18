import { useState, useEffect } from "react";
import { getActivityLog } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  TagIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

// XSS prevention: escape HTML to prevent injection attacks
const escapeHtml = (str: string | number | null | undefined): string => {
  if (str == null) return "";
  const text = String(str);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

type Activity = {
  id: number;
  action: string;
  action_display: string;
  entity_type: string;
  entity_type_display: string;
  entity_id: number | null;
  entity_name: string;
  details: Record<string, any>;
  timestamp: string;
};

const activityIcons: Record<string, React.ElementType> = {
  CREATE: PlusIcon,
  UPDATE: PencilSquareIcon,
  DELETE: TrashIcon,
  RESTORE: ArrowPathIcon,
};

const entityIcons: Record<string, React.ElementType> = {
  EXPENSE_CATEGORY: TagIcon,
  INCOME_SOURCE: BanknotesIcon,
  EXPENSE: CurrencyDollarIcon,
  INCOME: CurrencyDollarIcon,
  BUDGET: ChartBarIcon,
  TASK: ClipboardDocumentListIcon,
  PROFILE: UserCircleIcon,
};

const activityColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  UPDATE: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  DELETE: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  RESTORE: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default function ActivityLogSection() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function fetchActivities() {
      try {
        setIsLoading(true);
        const response = await getActivityLog();
        if (cancelled) return;

        // Handle axios response structure
        // Backend returns { message: "...", data: [...] }
        const rawData = response?.data;
        const activities = Array.isArray(rawData) ? rawData : (rawData?.data || []);
        setActivities(activities);
      } catch (err) {
        console.error("Failed to fetch activities", err);
        showToast({ message: "Failed to load activity log", type: "error" });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchActivities();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const filteredActivities = filter === "all"
    ? activities
    : activities.filter(a => a.action === filter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (action: string) => {
    return activityIcons[action] || ClipboardDocumentListIcon;
  };

  const getEntityIcon = (entityType: string) => {
    return entityIcons[entityType] || ClipboardDocumentListIcon;
  };

  type DetailItem = { label: string; value: string };

  const formatDetails = (details: Record<string, any>): DetailItem[] => {
    const lines: DetailItem[] = [];

    // Amount
    if (details.amount) {
      lines.push({ label: 'Amount', value: `৳${details.amount}` });
    }
    // Category
    if (details.category) {
      lines.push({ label: 'Category', value: details.category });
    }
    // Source
    if (details.source) {
      lines.push({ label: 'Source', value: details.source });
    }
    // Limit/Budget
    if (details.limit) {
      lines.push({ label: 'Budget Limit', value: `৳${details.limit}` });
    }
    // Month
    if (details.month) {
      lines.push({ label: 'Month', value: details.month });
    }
    // Reason (for delete)
    if (details.reason) {
      lines.push({ label: 'Reason', value: details.reason });
    }
    // Date (for expenses/incomes)
    if (details.date) {
      const date = new Date(details.date);
      lines.push({ label: 'Date', value: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });
    }

    return lines;
  };

  const formatChangeField = (field: string) => {
    const fieldLabels: Record<string, string> = {
      amount: 'Amount',
      description: 'Description',
      category: 'Category',
      source: 'Source',
      name: 'Name',
      limit: 'Budget Limit',
    };
    return fieldLabels[field] || field.replace(/_/g, ' ');
  };

  const getDetailedDescription = (activity: Activity) => {
    const { action, entity_type, entity_name, details } = activity;

    // Create actions
    if (action === 'CREATE') {
      const parts: string[] = [];
      if (details.amount) parts.push(`৳${details.amount}`);
      if (entity_type === 'EXPENSE' && details.category) parts.push(`in ${details.category}`);
      if (entity_type === 'INCOME' && details.source) parts.push(`from ${details.source}`);
      if (entity_type === 'BUDGET' && details.month) parts.push(`for ${details.month}`);
      return parts.length > 0 ? parts.join(' ') : '';
    }

    // Delete actions
    if (action === 'DELETE') {
      const parts: string[] = [];
      if (details.amount) parts.push(`৳${details.amount}`);
      if (details.category) parts.push(`from ${details.category}`);
      if (details.source) parts.push(`from ${details.source}`);
      if (details.date) {
        const date = new Date(details.date);
        parts.push(`dated ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
      }
      return parts.length > 0 ? parts.join(' ') : '';
    }

    // Update actions
    if (action === 'UPDATE' && details.changes) {
      const changedFields = Object.keys(details.changes);
      if (changedFields.length === 1) {
        const field = changedFields[0];
        const change = details.changes[field];
        return `Changed ${formatChangeField(field).toLowerCase()} from "${change.old}" to "${change.new}"`;
      }
      return `${changedFields.length} fields updated`;
    }

    return '';
  };

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "CREATE", label: "Created" },
    { value: "UPDATE", label: "Updated" },
    { value: "DELETE", label: "Deleted" },
  ];

  if (isLoading) {
    return (
      <div className="bg-surface border border-border/50 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-6">Activity Log</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-border/50 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-border/50 rounded w-48 mb-2"></div>
                <div className="h-3 bg-border/50 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Activity Log</h2>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 text-sm bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="text-sm text-text-muted">{filteredActivities.length} activities</span>
        </div>
      </div>

      {filteredActivities.length > 0 ? (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredActivities.map((activity) => {
            const ActionIcon = getActionIcon(activity.action);
            const EntityIcon = getEntityIcon(activity.entity_type);
            const colorClass = activityColors[activity.action] || "bg-gray-100 text-gray-600";

            return (
              <div
                key={activity.id}
                onClick={() => setSelectedActivity(activity)}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-background/50 transition-colors cursor-pointer border border-transparent hover:border-border/50"
              >
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <ActionIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-text dark:text-gray-200">
                      {escapeHtml(activity.action_display)} {escapeHtml(activity.entity_type_display)}
                    </span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <EntityIcon className="h-3 w-3" />
                      {escapeHtml(activity.entity_name)}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{formatDate(activity.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-text-muted">
          <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No activities found.</p>
          <p className="text-sm mt-1">Your actions will appear here.</p>
        </div>
      )}

      {/* Activity Detail Modal */}
      <Transition appear show={selectedActivity !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedActivity(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-surface border border-border/50 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium flex items-center gap-2 text-text dark:text-gray-100">
                      <div className={`p-2 rounded-full ${activityColors[selectedActivity?.action || '']}`}>
                        {selectedActivity && (() => {
                          const Icon = getActionIcon(selectedActivity.action);
                          return <Icon className="h-5 w-5" />;
                        })()}
                      </div>
                      Activity Details
                    </Dialog.Title>
                    <button onClick={() => setSelectedActivity(null)} className="text-text-muted hover:text-text">
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {selectedActivity && (
                    <div className="space-y-4">
                      {/* Summary */}
                      <div className="bg-background rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {(() => {
                            const EntityIcon = getEntityIcon(selectedActivity.entity_type);
                            return <EntityIcon className="h-5 w-5 text-text-muted" />;
                          })()}
                          <div>
                            <p className="font-medium text-text dark:text-gray-100">{escapeHtml(selectedActivity.action_display)} {escapeHtml(selectedActivity.entity_type_display)}</p>
                            <p className="text-sm text-text-muted">{escapeHtml(selectedActivity.entity_name)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-text-muted">
                          {formatFullDate(selectedActivity.timestamp)}
                        </p>
                        {selectedActivity.entity_id && (
                          <p className="text-xs text-text-muted mt-1">
                            ID: {selectedActivity.entity_id}
                          </p>
                        )}
                      </div>

                      {/* Detailed Description */}
                      {getDetailedDescription(selectedActivity) && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <p className="text-sm text-text dark:text-gray-200">
                            {getDetailedDescription(selectedActivity)}
                          </p>
                        </div>
                      )}

                      {/* Details */}
                      {formatDetails(selectedActivity.details).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-text-muted dark:text-gray-400 mb-2">Details</h4>
                          <div className="bg-background rounded-lg p-4 space-y-2">
                            {formatDetails(selectedActivity.details).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center">
                                <span className="text-sm text-text-muted">{item.label}</span>
                                <span className="text-sm font-medium text-text dark:text-gray-200">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Changes */}
                      {selectedActivity.details.changes && (
                        <div>
                          <h4 className="text-sm font-medium text-text-muted dark:text-gray-400 mb-2">Changes</h4>
                          <div className="space-y-2">
                            {Object.entries(selectedActivity.details.changes).map(([field, change]: [string, any], idx) => (
                              <div key={idx} className="bg-background rounded-lg p-3">
                                <p className="text-sm font-medium capitalize mb-1 text-text dark:text-gray-100">{formatChangeField(field)}</p>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded flex-1 text-center overflow-hidden text-ellipsis">
                                    {escapeHtml(change.old) || "(empty)"}
                                  </span>
                                  <span className="text-text-muted">→</span>
                                  <span className="px-2 py-0.5 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded flex-1 text-center overflow-hidden text-ellipsis">
                                    {escapeHtml(change.new) || "(empty)"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 flex justify-end">
                        <button
                          onClick={() => setSelectedActivity(null)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}