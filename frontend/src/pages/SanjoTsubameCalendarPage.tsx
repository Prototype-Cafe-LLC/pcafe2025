import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { SanjoTsubameCalendar } from '../components/calendar/SanjoTsubameCalendar';
import styles from './SanjoTsubameCalendarPage.module.css';

export const SanjoTsubameCalendarPage: React.FC = () => {
  const { currentMonth } = useSelector((state: RootState) => state.sanjoTsubameCalendar);
  const [selectedDateInfo, setSelectedDateInfo] = useState<{
    year: number;
    month: number;
    day: number;
    status: 'on' | 'off' | 'undefined';
  } | null>(null);

  const handleDateSelect = (year: number, month: number, day: number, status: 'on' | 'off' | 'undefined') => {
    setSelectedDateInfo({ year, month, day, status });
  };

  const monthStats = useMemo(() => {
    if (!currentMonth) {
      return { businessDays: 0, holidays: 0, undefined: 0, total: 0 };
    }

    const stats = Object.values(currentMonth.data).reduce(
      (acc, status) => {
        acc[status]++;
        acc.total++;
        return acc;
      },
      { on: 0, off: 0, undefined: 0, total: 0 }
    );

    return {
      businessDays: stats.on,
      holidays: stats.off,
      undefined: stats.undefined,
      total: stats.total,
    };
  }, [currentMonth]);

  const getStatusText = (status: 'on' | 'off' | 'undefined') => {
    switch (status) {
      case 'on': return '営業日';
      case 'off': return '休業日';
      case 'undefined': return '未定義';
    }
  };

  const getDateString = (year: number, month: number, day: number) => {
    return `${year}年${month}月${day}日`;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>三条・燕 営業日カレンダー</h1>
          <p className={styles.pageSubtitle}>
            三条・燕地域の商工会議所営業日をご確認いただけます。
            営業日（緑）、休業日（赤）、未定義（グレー）で表示されています。
          </p>
        </header>

        <main className={styles.calendarSection}>
          <SanjoTsubameCalendar 
            showTodayStatus={true}
            showLegend={true}
            onDateSelect={handleDateSelect}
          />
        </main>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>
              📊 月間統計
            </h3>
            <div className={styles.infoCardContent}>
              {currentMonth ? (
                <div className={styles.quickStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{monthStats.businessDays}</span>
                    <span className={styles.statLabel}>営業日</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{monthStats.holidays}</span>
                    <span className={styles.statLabel}>休業日</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{monthStats.undefined}</span>
                    <span className={styles.statLabel}>未定義</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{monthStats.total}</span>
                    <span className={styles.statLabel}>合計日数</span>
                  </div>
                </div>
              ) : (
                <p>カレンダーデータを読み込み中...</p>
              )}
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>
              📅 営業日の説明
            </h3>
            <div className={styles.infoCardContent}>
              <ul>
                <li>
                  <div className={`${styles.statusIcon} ${styles.on}`}></div>
                  <strong>営業日</strong> - 通常営業している日
                </li>
                <li>
                  <div className={`${styles.statusIcon} ${styles.off}`}></div>
                  <strong>休業日</strong> - 休業・祝日・週末
                </li>
                <li>
                  <div className={`${styles.statusIcon} ${styles.undefined}`}></div>
                  <strong>未定義</strong> - 営業状況が未確定の日
                </li>
              </ul>
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                ※ 営業日情報は三条燕商工会議所の公式カレンダーに基づいています。
                最新情報は直接お問い合わせください。
              </p>
            </div>
          </div>

          <div className={styles.contactInfo}>
            <h3 className={styles.contactTitle}>お問い合わせ</h3>
            <div className={styles.contactDetails}>
              <a href="https://tsubame-cci.or.jp/" className={styles.contactLink} target="_blank" rel="noopener noreferrer">
                🌐 燕商工会議所
              </a>
              <a href="https://www.sanjo-cci.or.jp/" className={styles.contactLink} target="_blank" rel="noopener noreferrer">
                🌐 三条商工会議所
              </a>
              <span style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.9 }}>
                営業日の詳細や最新情報については、各商工会議所にお問い合わせください。
              </span>
            </div>
          </div>
        </div>

        {selectedDateInfo && (
          <div className={styles.selectedDateInfo}>
            <h3 className={styles.selectedDateTitle}>選択された日付</h3>
            <div className={styles.selectedDateContent}>
              <p>
                {getDateString(selectedDateInfo.year, selectedDateInfo.month, selectedDateInfo.day)}
              </p>
              <div className={`${styles.selectedDateStatus} ${styles[selectedDateInfo.status]}`}>
                <div className={`${styles.statusIcon} ${styles[selectedDateInfo.status]}`}></div>
                {getStatusText(selectedDateInfo.status)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};