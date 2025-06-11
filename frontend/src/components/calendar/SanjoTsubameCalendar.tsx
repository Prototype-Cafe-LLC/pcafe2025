import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  fetchMonthDataStart, 
  fetchTodayStatusStart, 
  setSelectedDate 
} from '../../store/slices/sanjoTsubameCalendarSlice';
import styles from './SanjoTsubameCalendar.module.css';

interface SanjoTsubameCalendarProps {
  initialYear?: number;
  initialMonth?: number;
  showTodayStatus?: boolean;
  showLegend?: boolean;
  onDateSelect?: (year: number, month: number, day: number, status: 'on' | 'off' | 'undefined') => void;
}

export const SanjoTsubameCalendar: React.FC<SanjoTsubameCalendarProps> = ({
  initialYear,
  initialMonth,
  showTodayStatus = true,
  showLegend = true,
  onDateSelect,
}) => {
  const dispatch = useDispatch();
  const { 
    currentMonth, 
    todayStatus, 
    loading, 
    error, 
    selectedDate 
  } = useSelector((state: RootState) => state.sanjoTsubameCalendar);

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return {
      year: initialYear || now.getFullYear(),
      month: initialMonth || now.getMonth() + 1,
    };
  });

  const today = new Date();

  useEffect(() => {
    dispatch(fetchMonthDataStart(currentDate));
    if (showTodayStatus) {
      dispatch(fetchTodayStatusStart());
    }
  }, [dispatch, currentDate, showTodayStatus]);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => {
      const newMonth = prev.month === 1 ? 12 : prev.month - 1;
      const newYear = prev.month === 1 ? prev.year - 1 : prev.year;
      return { year: newYear, month: newMonth };
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newMonth = prev.month === 12 ? 1 : prev.month + 1;
      const newYear = prev.month === 12 ? prev.year + 1 : prev.year;
      return { year: newYear, month: newMonth };
    });
  };

  const handleDateClick = (day: number) => {
    const dateKey = `${currentDate.year}-${String(currentDate.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const status = currentMonth?.data[dateKey] || 'undefined';
    
    dispatch(setSelectedDate({ year: currentDate.year, month: currentDate.month, day }));
    
    if (onDateSelect) {
      onDateSelect(currentDate.year, currentDate.month, day, status);
    }
  };

  const renderCalendarDays = () => {
    if (!currentMonth) return null;

    const daysInMonth = new Date(currentDate.year, currentDate.month, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.year, currentDate.month - 1, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className={`${styles.dayCell} ${styles.otherMonth}`} />
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentDate.year}-${String(currentDate.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status = currentMonth.data[dateKey] || 'undefined';
      
      const isToday = today.getFullYear() === currentDate.year && 
                     today.getMonth() + 1 === currentDate.month && 
                     today.getDate() === day;
      
      const isSelected = selectedDate?.year === currentDate.year && 
                        selectedDate?.month === currentDate.month && 
                        selectedDate?.day === day;
      
      days.push(
        <div
          key={day}
          className={`
            ${styles.dayCell} 
            ${styles[status]} 
            ${isToday ? styles.today : ''} 
            ${isSelected ? styles.selected : ''}
          `}
          onClick={() => handleDateClick(day)}
        >
          <span className={styles.dayNumber}>{day}</span>
          <div className={`${styles.statusDot} ${styles[status]}`} />
        </div>
      );
    }
    
    return days;
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    return monthNames[month - 1];
  };

  const getDayNames = () => {
    return ['日', '月', '火', '水', '木', '金', '土'];
  };

  if (loading.monthData) {
    return (
      <div className={styles.calendarContainer}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          カレンダーを読み込み中...
        </div>
      </div>
    );
  }

  if (error.monthData) {
    return (
      <div className={styles.calendarContainer}>
        <div className={styles.error}>
          エラー: {error.monthData}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <h2 className={styles.calendarTitle}>
          三条・燕 営業日カレンダー
        </h2>
        <div className={styles.navigationButtons}>
          <button
            className={styles.navButton}
            onClick={handlePreviousMonth}
            aria-label="前の月"
          >
            ‹
          </button>
          <span style={{ padding: '0 1rem', fontWeight: 600 }}>
            {currentDate.year}年 {getMonthName(currentDate.month)}
          </span>
          <button
            className={styles.navButton}
            onClick={handleNextMonth}
            aria-label="次の月"
          >
            ›
          </button>
        </div>
      </div>

      {showTodayStatus && todayStatus && (
        <div className={`${styles.todayStatus} ${styles[todayStatus.status]}`}>
          <div className={`${styles.statusIndicator} ${styles[todayStatus.status]}`} />
          <span>
            今日 ({todayStatus.year}/{todayStatus.month}/{todayStatus.date}) は
            <strong>{todayStatus.status === 'on' ? '営業日' : todayStatus.status === 'off' ? '休業日' : '未定義'}</strong>
            です
          </span>
        </div>
      )}

      <div className={styles.calendarGrid}>
        {getDayNames().map(dayName => (
          <div key={dayName} className={styles.dayHeader}>
            {dayName}
          </div>
        ))}
        {renderCalendarDays()}
      </div>

      {showLegend && (
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.on}`} />
            <span>営業日</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.off}`} />
            <span>休業日</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.undefined}`} />
            <span>未定義</span>
          </div>
        </div>
      )}
    </div>
  );
};