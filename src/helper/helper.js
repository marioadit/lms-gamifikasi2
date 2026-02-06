import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");
export const formatDate = (date) => {
  return dayjs(date).format("D MMMM YYYY");
};

export const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  // Handle database format "2025-06-10 08:00:00"
  // Replace space with 'T' and remove seconds
  const formatted = dateString.replace(' ', 'T').slice(0, 16);

  return formatted; // Returns "2025-06-10T08:00"
}