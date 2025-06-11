import { useState, useEffect } from 'react';
import {
  useNotify,
} from 'react-admin';
import { Box, Chip, Card, CardContent, Typography, Grid, Button as MuiButton } from '@mui/material';
import { CalendarMonth } from '@mui/icons-material';
import { sanjoTsubameCalendarApi } from '../../services/sanjoTsubameCalendar';

// This component provides calendar management for admin users

// Improved calendar management component with clickable calendar
export const SanjoTsubameCalendarList = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [monthData, setMonthData] = useState<any>(null);
  const [localChanges, setLocalChanges] = useState<Record<string, 'on' | 'off'>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await sanjoTsubameCalendarApi.getMonthStatus(currentYear, currentMonth);
        setMonthData(data);
        setLocalChanges({}); // Clear local changes when switching months
      } catch (error) {
        notify('カレンダーデータの取得に失敗しました', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentYear, currentMonth, notify]);

  // Auto-set weekends to 'off' for new months
  useEffect(() => {
    if (!monthData) return;
    
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const weekendChanges: Record<string, 'on' | 'off'> = {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Auto-set Saturday (6) and Sunday (0) to 'off' if not already set
      if ((dayOfWeek === 0 || dayOfWeek === 6) && !monthData.data[dateKey]) {
        weekendChanges[dateKey] = 'off';
      }
    }
    
    if (Object.keys(weekendChanges).length > 0) {
      setLocalChanges(prev => ({ ...prev, ...weekendChanges }));
    }
  }, [monthData, currentYear, currentMonth]);

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const currentStatus = localChanges[dateKey] || monthData?.data[dateKey] || 'off';
    
    // Toggle between 'on' and 'off'
    const newStatus = currentStatus === 'on' ? 'off' : 'on';
    
    setLocalChanges(prev => ({
      ...prev,
      [dateKey]: newStatus
    }));
  };

  const handleSaveMonth = async () => {
    try {
      setSaving(true);
      
      // Convert local changes to bulk import format
      const changesArray = Object.entries(localChanges);
      
      if (changesArray.length === 0) {
        notify('変更がありません', { type: 'info' });
        return;
      }

      // Group changes by status
      const onDays: number[] = [];
      const offDays: number[] = [];
      
      changesArray.forEach(([dateKey, status]) => {
        const day = parseInt(dateKey.split('-')[2]);
        if (status === 'on') {
          onDays.push(day);
        } else if (status === 'off') {
          offDays.push(day);
        }
      });

      // Send bulk updates
      if (onDays.length > 0) {
        console.log('Saving ON days:', onDays);
        await sanjoTsubameCalendarApi.bulkImportEntries({
          year: currentYear,
          month: currentMonth,
          days: onDays,
          status: 'on',
        });
      }

      if (offDays.length > 0) {
        console.log('Saving OFF days:', offDays);
        await sanjoTsubameCalendarApi.bulkImportEntries({
          year: currentYear,
          month: currentMonth,
          days: offDays,
          status: 'off',
        });
      }

      notify(`${changesArray.length}件の変更を保存しました`, { type: 'success' });
      
      // Refresh data and clear local changes
      const data = await sanjoTsubameCalendarApi.getMonthStatus(currentYear, currentMonth);
      setMonthData(data);
      setLocalChanges({});
      
    } catch (error) {
      console.error('保存エラー:', error);
      notify(`保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>読み込み中...</Typography>
        </CardContent>
      </Card>
    );
  }

  const getDaysArray = () => {
    if (!monthData) return [];
    
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, status: null, dateKey: null, isEmpty: true });
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status = localChanges[dateKey] || monthData.data[dateKey] || 'off';
      const date = new Date(currentYear, currentMonth - 1, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      days.push({ day, status, dateKey, isEmpty: false, isWeekend });
    }
    
    return days;
  };

  const getMonthName = (month: number) => {
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return monthNames[month - 1];
  };

  const getDayHeaders = () => ['日', '月', '火', '水', '木', '金', '土'];

  const hasChanges = Object.keys(localChanges).length > 0;

  return (
    <div>
      <Card style={{ marginBottom: '20px' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">
              三条・燕 営業日カレンダー管理
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <MuiButton onClick={handlePreviousMonth} variant="outlined">
                ← 前月
              </MuiButton>
              <Typography variant="h6" sx={{ minWidth: '140px', textAlign: 'center' }}>
                {currentYear}年 {getMonthName(currentMonth)}
              </Typography>
              <MuiButton onClick={handleNextMonth} variant="outlined">
                次月 →
              </MuiButton>
            </Box>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              日付をクリックして営業日/休業日を切り替え
            </Typography>
            <MuiButton 
              onClick={handleSaveMonth}
              variant="contained" 
              color="primary"
              disabled={!hasChanges || saving}
            >
              {saving ? '保存中...' : `月データを保存 ${hasChanges ? `(${Object.keys(localChanges).length}件の変更)` : ''}`}
            </MuiButton>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {/* Calendar Grid */}
          <Grid container spacing={0} style={{ border: '1px solid #ddd' }}>
            {/* Day headers */}
            {getDayHeaders().map((dayName, index) => (
              <Grid item key={dayName} xs={12/7}>
                <Box
                  p={1}
                  textAlign="center"
                  bgcolor="#f5f5f5"
                  border="1px solid #ddd"
                  fontWeight="bold"
                  color={index === 0 ? 'red' : index === 6 ? 'blue' : 'inherit'}
                >
                  {dayName}
                </Box>
              </Grid>
            ))}
            
            {/* Calendar days */}
            {getDaysArray().map(({ day, status, dateKey, isEmpty, isWeekend }, index) => (
              <Grid item key={dateKey || `empty-${index}`} xs={12/7}>
                <Box
                  p={1}
                  textAlign="center"
                  height="80px"
                  border="1px solid #ddd"
                  bgcolor={
                    isEmpty ? '#fafafa' :
                    status === 'on' ? '#e8f5e8' : '#ffeaea'
                  }
                  sx={{
                    cursor: isEmpty ? 'default' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    '&:hover': isEmpty ? {} : {
                      bgcolor: status === 'on' ? '#d4f2d4' : '#ffdddd'
                    }
                  }}
                  onClick={() => !isEmpty && handleDayClick(day!)}
                >
                  {!isEmpty && (
                    <>
                      <Typography 
                        variant="body1" 
                        fontWeight={isWeekend ? 'bold' : 'normal'}
                        color={isWeekend ? (day === 1 || new Date(currentYear, currentMonth - 1, day!).getDay() === 0 ? 'red' : 'blue') : 'inherit'}
                        sx={{ lineHeight: 1 }}
                      >
                        {day}
                      </Typography>
                      <Chip
                        size="small"
                        label={status === 'on' ? '営業' : '休業'}
                        color={status === 'on' ? 'success' : 'error'}
                        style={{ marginTop: '4px', fontSize: '10px', height: '18px' }}
                      />
                      {localChanges[dateKey!] && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            border: '1px solid white'
                          }}
                        />
                      )}
                    </>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
          
          {/* Legend */}
          <Box mt={2} display="flex" justifyContent="center" gap={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={16} height={16} bgcolor="#e8f5e8" border="1px solid #ddd" />
              <Typography variant="body2">営業日</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={16} height={16} bgcolor="#ffeaea" border="1px solid #ddd" />
              <Typography variant="body2">休業日</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

// Simple placeholder components for React Admin
export const SanjoTsubameCalendarCreate = () => <SanjoTsubameCalendarList />;
export const SanjoTsubameCalendarEdit = () => <SanjoTsubameCalendarList />;

// Export the resource configuration
export const sanjoTsubameCalendarResource = {
  list: SanjoTsubameCalendarList,
  create: SanjoTsubameCalendarCreate,
  edit: SanjoTsubameCalendarEdit,
  icon: CalendarMonth,
  recordRepresentation: (record: any) => `${record.year}/${record.month}/${record.day} (${record.status})`,
};