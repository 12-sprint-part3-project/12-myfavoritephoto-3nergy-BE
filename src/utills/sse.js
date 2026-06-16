const clients = new Map();

// SSE 클라이언트 연결 추가
export const addSseClient = (userUuid, res) => {
  clients.set(userUuid, res);
};

// SSE 클라이언트 연결 제거
export const removeSseClient = (userUuid) => {
  clients.delete(userUuid);
};

export const getConnectedClientsCount = () => {
  return clients.size;
};

// 특정 사용자에게 SSE 알림 전송
export const sendNotificationToUser = (userUuid, notification) => {
  const client = clients.get(userUuid);

  if (!client) {
    return;
  }

  client.write(`event: notification\n`);
  client.write(`data: ${JSON.stringify(notification)}\n\n`);
};
