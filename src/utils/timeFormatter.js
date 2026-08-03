import moment from "moment-timezone";

export const formatDate = (date) => {
  if (!date) return "-";
  const m = moment.utc(date);
  if (!m.isValid()) return String(date);
  const tz = moment.tz.guess();
  return m.tz(tz).format("MMM D, YYYY, hh:mm A z");
};
