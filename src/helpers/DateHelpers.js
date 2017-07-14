
export function getDateStringFromTimeStamp(timeStamp) {
  var date = new Date(timeStamp * 1000);
  const Y = date.getFullYear() + '年';
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '月';
  const D = date.getDate() + '日';
  return Y + M + D;
}

export function getTheTimeDiffer(created_time) {
  const timestamp = new Date().getTime();
  const timeDiffer = timestamp - (created_time * 1000);
  const differDay = Math.floor(timeDiffer / (24 * 3600 * 1000));
  if (differDay < 1) {
    const leave1 = timeDiffer % (24 * 3600 * 1000);
    const differHour = Math.floor(leave1 / (3600 * 1000));
    if (differHour < 1) {
      const leave2 = leave1 % (3600 * 1000);
      const differMin = Math.floor(leave2 / (60 * 1000));
      if (differMin < 1) {
        const leave3 = leave2 % (60 * 1000);
        const differSec = Math.round(leave3 / 1000);
        return differSec + '秒前';
      } return differMin + '分钟前';
    } return differHour + '小时前';
  } return differDay + '天前';
}
