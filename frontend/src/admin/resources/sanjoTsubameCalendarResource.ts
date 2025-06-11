import { CalendarMonth } from '@mui/icons-material';
import { SanjoTsubameCalendarList, SanjoTsubameCalendarCreate, SanjoTsubameCalendarEdit } from './sanjoTsubameCalendar';
import { SanjoTsubameCalendarEntry } from '../../services/sanjoTsubameCalendar';

// Export the resource configuration
export const sanjoTsubameCalendarResource = {
  list: SanjoTsubameCalendarList,
  create: SanjoTsubameCalendarCreate,
  edit: SanjoTsubameCalendarEdit,
  icon: CalendarMonth,
  recordRepresentation: (record: SanjoTsubameCalendarEntry) => `${record.year}/${record.month}/${record.day} (${record.status})`,
};