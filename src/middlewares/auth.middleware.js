import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      message: '인증이 필요합니다.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: payload.userUuid,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: '유효하지 않은 토큰입니다.',
    });
  }
};
