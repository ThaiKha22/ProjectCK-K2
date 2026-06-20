// services/constants.js
export const STATUS_LABELS = {
  'tiem-nang': 'Tiềm năng',
  'dang-cham-soc': 'Đang chăm sóc',
  'khach-hang': 'Khách hàng',
  'ngung': 'Ngừng hợp tác',
};

export const STATUS_COLORS = {
  'tiem-nang': { bg: '#fef9c3', color: '#854d0e' },
  'dang-cham-soc': { bg: '#dbeafe', color: '#1d4ed8' },
  'khach-hang': { bg: '#dcfce7', color: '#166534' },
  'ngung': { bg: '#f3f4f6', color: '#6b7280' },
};

export const TASK_STATUS = {
  todo: 'Todo',
  inprogress: 'Đang làm',
  done: 'Hoàn thành',
};

export const TASK_COLORS = {
  todo: { bg: '#f3f4f6', color: '#374151' },
  inprogress: { bg: '#dbeafe', color: '#1d4ed8' },
  done: { bg: '#dcfce7', color: '#166534' },
};

export const INTERACTION_TYPES = {
  call: { label: 'Gọi điện', icon: '📞', bg: '#ede9fe', color: '#6d28d9' },
  email: { label: 'Email', icon: '📧', bg: '#dcfce7', color: '#166534' },
  meeting: { label: 'Meeting', icon: '🤝', bg: '#dbeafe', color: '#1d4ed8' },
};

export const MONTH_NAMES = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
export const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
