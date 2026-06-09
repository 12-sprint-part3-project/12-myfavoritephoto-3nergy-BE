// KST 기준 이번 달 시작일 반환
const getStartOfMonthKST = () => {
  const now = new Date();

  // UTC 시간을 KST(+9시간) 기준으로 변환
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  return new Date(
    Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), 1, -9, 0, 0, 0),
  );
};
