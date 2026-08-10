export const getWeek = (date: any = null): number => {
  const curDate: any = date || new Date();
  curDate.setUTCDate(curDate.getUTCDate() + 4 - (curDate.getUTCDay() || 7));
  const yearStart: any = new Date(Date.UTC(curDate.getUTCFullYear(), 0, 1));
  const weekNo: number = Math.ceil((((curDate - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};
