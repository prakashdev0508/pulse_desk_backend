import jwt from 'jsonwebtoken';
import { prisma } from '../config/db/dbconfig';
import { createError } from '../utils/messageResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret_key';

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: '1d' } // Access token expires in 1 day
  );

  const refreshToken = jwt.sign(
    { id: userId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' } // Refresh token expires in 7 days
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw createError(401, 'Invalid access token');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw createError(401, 'Invalid refresh token');
  }
};

export const saveRefreshToken = async (userId: string, refreshToken: string) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken }
    });
  } catch (error) {
    throw createError(500, 'Failed to save refresh token');
  }
};

export const removeRefreshToken = async (userId: string) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });
  } catch (error) {
    throw createError(500, 'Failed to remove refresh token');
  }
}; 