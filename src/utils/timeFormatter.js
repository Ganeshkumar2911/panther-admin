import moment from "moment-timezone";

export const formatDate = (date) => {
  if (!date) return "-";
  const m = moment.utc(date);
  if (!m.isValid()) return String(date);
  const tz = moment.tz.guess();
  return m.tz(tz).format("MMM D, YYYY, hh:mm A z");
};

/**
 * Real-time frontend calculation for Ticket Turnaround Time (TAT) / SLA status.
 * @param {Object} ticket - Ticket object containing due_at, status, tat_formatted, tat_message
 * @param {Date|Number|String} now - Current time reference (e.g. reactive Date.now())
 */
export const calculateTat = (ticket, now = new Date()) => {
  if (!ticket) {
    return {
      tatFormatted: null,
      tatMessage: null,
      isBreached: false,
      hasDeadline: false,
    };
  }

  // If ticket is resolved or closed, deadline countdown is no longer active
  if (ticket.status === "resolved" || ticket.status === "closed") {
    return {
      tatFormatted: ticket.tat_formatted || "Completed",
      tatMessage: ticket.tat_message || `Resolved (${ticket.status})`,
      isBreached: ticket.tat_message?.toLowerCase().includes("breached") || ticket.is_due || false,
      hasDeadline: !!(ticket.due_at || ticket.tat_formatted || ticket.tat_message),
    };
  }

  const dueAt = ticket.due_at;
  if (!dueAt) {
    if (ticket.tat_formatted || ticket.tat_message) {
      return {
        tatFormatted: ticket.tat_formatted || null,
        tatMessage: ticket.tat_message || null,
        isBreached: ticket.tat_message?.toLowerCase().includes("breached") || ticket.is_due || false,
        hasDeadline: true,
      };
    }
    return {
      tatFormatted: null,
      tatMessage: null,
      isBreached: false,
      hasDeadline: false,
    };
  }

  const due = moment.utc(dueAt);
  if (!due.isValid()) {
    return {
      tatFormatted: ticket.tat_formatted || null,
      tatMessage: ticket.tat_message || null,
      isBreached: false,
      hasDeadline: false,
    };
  }

  const current = moment(now);
  const diffSeconds = due.diff(current, "seconds");

  const isBreached = diffSeconds < 0;
  const absSec = Math.abs(diffSeconds);

  const duration = moment.duration(absSec, "seconds");
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  // Short format countdown e.g. "1h 3m 24s"
  const shortParts = [];
  if (days > 0) shortParts.push(`${days}d`);
  if (hours > 0 || days > 0) shortParts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) shortParts.push(`${minutes}m`);
  shortParts.push(`${seconds}s`);
  const countdownStr = shortParts.join(" ");

  // Full descriptive verbose text e.g. "1 hour 3 minutes 24 seconds"
  const verboseParts = [];
  if (days > 0) verboseParts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (hours > 0) verboseParts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  if (minutes > 0) verboseParts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  verboseParts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`);
  const verboseStr = verboseParts.join(" ");

  if (isBreached) {
    return {
      tatFormatted: `Overdue by ${countdownStr}`,
      tatMessage: "Breached",
      isBreached: true,
      hasDeadline: true,
    };
  }

  return {
    tatFormatted: `Due in ${countdownStr}`,
    tatMessage: "On Track",
    isBreached: false,
    hasDeadline: true,
  };
};
