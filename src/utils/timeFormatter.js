import moment from "moment-timezone";

export const formatDate = (date) => {
  // return new Intl.DateTimeFormat("en-US", {
  //   year: "numeric",
  //   month: "short",
  //   day: "numeric",
  //   hour: "2-digit",
  //   minute: "2-digit",
  //   // timeZoneName: "short",
  //   timeZoneName: "shortOffset",
  // }).format(new Date(date));
  const tz = moment.tz.guess();
  return moment.utc(date).tz(tz).format("MMM D, YYYY, hh:mm A z");
};
