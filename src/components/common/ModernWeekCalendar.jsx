import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import { startOfWeek, addDays, fmt, WEEK_DAYS } from "../../utils/date-helpers";

/**
 * Modern Week Calendar Component
 *
 * @param {Object} props
 * @param {Date} props.currentWeek - Current week date
 * @param {Function} props.onWeekChange - Callback when week changes
 * @param {Array} props.timeSlots - Array of time slots [{id, label, time}]
 * @param {Function} props.getEventsForSlot - Function(dayId, slotId) => events[]
 * @param {Function} props.renderEvent - Function(event, dayId, slotId) => ReactNode
 * @param {Function} props.renderEmptySlot - Function(dayId, slotId) => ReactNode (optional)
 * @param {string} props.accentColor - Primary accent color (default: "indigo")
 * @param {boolean} props.showStats - Show statistics header
 * @param {ReactNode} props.statsContent - Custom stats content
 */
export default function ModernWeekCalendar({
  currentWeek,
  onWeekChange,
  timeSlots = [],
  getEventsForSlot,
  renderEvent,
  renderEmptySlot,
  accentColor = "indigo",
  showStats = false,
  statsContent,
  headerActions,
}) {
  const weekStart = useMemo(() => startOfWeek(currentWeek), [currentWeek]);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const handlePrevWeek = () => {
    onWeekChange?.(addDays(currentWeek, -7));
  };

  const handleNextWeek = () => {
    onWeekChange?.(addDays(currentWeek, 7));
  };

  const handleToday = () => {
    onWeekChange?.(new Date());
  };

  // Get accent color classes
  const getAccentClasses = (type) => {
    const colors = {
      indigo: {
        header: "from-indigo-500 via-indigo-600 to-purple-600",
        headerToday: "from-blue-500 via-blue-600 to-indigo-600",
        todayBg: "bg-blue-50/50",
        badge: "bg-indigo-100 text-indigo-700",
        navBg: "bg-indigo-50 border-indigo-200",
        navText: "text-indigo-700",
      },
      blue: {
        header: "from-blue-500 via-blue-600 to-cyan-600",
        headerToday: "from-cyan-500 via-blue-600 to-blue-700",
        todayBg: "bg-cyan-50/50",
        badge: "bg-blue-100 text-blue-700",
        navBg: "bg-blue-50 border-blue-200",
        navText: "text-blue-700",
      },
      emerald: {
        header: "from-emerald-500 via-emerald-600 to-teal-600",
        headerToday: "from-teal-500 via-emerald-600 to-emerald-700",
        todayBg: "bg-emerald-50/50",
        badge: "bg-emerald-100 text-emerald-700",
        navBg: "bg-emerald-50 border-emerald-200",
        navText: "text-emerald-700",
      },
    };
    return colors[accentColor]?.[type] || colors.indigo[type];
  };

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          {/* Week Navigation */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={handlePrevWeek}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 text-gray-600 hover:text-gray-900"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Current Week Display */}
          <div
            className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${getAccentClasses(
              "navBg"
            )}`}
          >
            <Calendar className={`h-5 w-5 ${getAccentClasses("navText")}`} />
            <div>
              <div
                className={`text-sm font-bold ${getAccentClasses("navText")}`}
              >
                {fmt(weekStart, "dd/MM")} -{" "}
                {fmt(addDays(weekStart, 6), "dd/MM/yyyy")}
              </div>
              <div className="text-xs text-gray-500">
                {fmt(weekStart, "MMMM yyyy")}
              </div>
            </div>
          </div>

          {/* Today Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-10 px-4 rounded-xl font-medium hover:bg-gray-50"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Hôm nay
          </Button>
        </div>

        {/* Custom Header Actions */}
        {headerActions && (
          <div className="flex items-center gap-2">{headerActions}</div>
        )}
      </div>

      {/* Stats Section */}
      {showStats && statsContent && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          {statsContent}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Header Row */}
            <div className="grid grid-cols-[120px_repeat(7,1fr)]">
              {/* Time Column Header */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-r border-b border-gray-200">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Slot
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    Khung giờ
                  </div>
                </div>
              </div>

              {/* Day Headers */}
              {WEEK_DAYS.map((day, index) => {
                const date = weekDates[index];
                const isToday =
                  fmt(date, "yyyy-MM-dd") === fmt(new Date(), "yyyy-MM-dd");
                const dayNum = date.getDate();

                return (
                  <div
                    key={day.id}
                    className={`relative p-4 border-b border-gray-200 ${
                      index < 6 ? "border-r" : ""
                    } bg-gradient-to-br ${
                      isToday
                        ? getAccentClasses("headerToday")
                        : getAccentClasses("header")
                    }`}
                  >
                    {/* Today indicator */}
                    {isToday && (
                      <div className="absolute top-2 right-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-white/80 text-xs font-medium uppercase tracking-wider">
                        {day.short}
                      </div>
                      <div
                        className={`text-3xl font-bold mt-1 ${
                          isToday ? "text-white" : "text-white/90"
                        }`}
                      >
                        {dayNum}
                      </div>
                      <div className="text-white/60 text-xs mt-1">
                        {fmt(date, "dd/MM")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            {timeSlots.map((slot, slotIndex) => (
              <div
                key={slot.id}
                className={`grid grid-cols-[120px_repeat(7,1fr)] ${
                  slotIndex !== timeSlots.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                {/* Slot Label */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-r border-gray-200">
                  <div className="flex flex-col justify-center h-full min-h-[100px]">
                    <div className="inline-flex items-center justify-center w-fit mx-auto px-3 py-1 rounded-full bg-gray-100 mb-2">
                      <span className="text-sm font-bold text-gray-700">
                        {slot.label || `Slot ${slot.id}`}
                      </span>
                    </div>
                    <div className="text-center text-xs text-gray-500 font-medium">
                      {slot.time || `${slot.startTime} - ${slot.endTime}`}
                    </div>
                  </div>
                </div>

                {/* Day Cells */}
                {WEEK_DAYS.map((day, dayIndex) => {
                  const events = getEventsForSlot?.(day.id, slot.id) || [];
                  const isToday =
                    fmt(weekDates[dayIndex], "yyyy-MM-dd") ===
                    fmt(new Date(), "yyyy-MM-dd");

                  return (
                    <div
                      key={day.id}
                      className={`p-2 min-h-[120px] transition-colors duration-200 ${
                        dayIndex < 6 ? "border-r border-gray-100" : ""
                      } ${
                        isToday
                          ? getAccentClasses("todayBg")
                          : "hover:bg-gray-50/50"
                      }`}
                    >
                      {events.length > 0 ? (
                        <div className="space-y-2">
                          {events.map((event, eventIndex) =>
                            renderEvent ? (
                              <React.Fragment key={event.id || eventIndex}>
                                {renderEvent(event, day.id, slot.id)}
                              </React.Fragment>
                            ) : (
                              <DefaultEventCard
                                key={event.id || eventIndex}
                                event={event}
                              />
                            )
                          )}
                        </div>
                      ) : renderEmptySlot ? (
                        renderEmptySlot(day.id, slot.id)
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[100px]">
                          <span className="text-gray-300 text-xs">—</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Default Event Card (fallback)
function DefaultEventCard({ event }) {
  return (
    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="font-semibold text-sm text-gray-800 line-clamp-1">
        {event.title || event.className || "Untitled"}
      </div>
      {event.subtitle && (
        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
          {event.subtitle}
        </div>
      )}
    </div>
  );
}

// Export Event Card Component for custom styling
export function CalendarEventCard({
  children,
  variant = "default",
  onClick,
  className = "",
}) {
  const variants = {
    default: "from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300",
    success:
      "from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300",
    warning:
      "from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300",
    danger: "from-red-50 to-rose-50 border-red-200 hover:border-red-300",
    info: "from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300",
    purple:
      "from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-300",
    gradient: "from-indigo-500 to-purple-600 border-indigo-400 text-white",
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl bg-gradient-to-br border transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

// Status Badge Component
export function CalendarStatusBadge({ status, children }) {
  const statusStyles = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
    default: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
        statusStyles[status] || statusStyles.default
      }`}
    >
      {children}
    </span>
  );
}
