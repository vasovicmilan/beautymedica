import * as userRepository from '../repositories/user.repository.js';
import * as roleRepository from '../repositories/role.repository.js';
import { notFound, badRequest, internalError } from '../utils/error.util.js';
import logger from '../utils/logger.config.js';

export async function findOrCreateGoogleUser(googleProfile) {
  try {
    const { id: googleId, email, given_name: firstName, family_name: lastName, picture: avatar } = googleProfile;

    if (!email) badRequest('Google profil nema email adresu');


    let user = await userRepository.findUserByGoogleId(googleId);

    if (user) {

      await userRepository.updateUserById(user._id, {
        lastLoginAt: new Date(),
        avatar: avatar || user.avatar,
      });
      logger.info({ userId: user._id, email }, 'User logged in via Google');
      return await userRepository.findUserById(user._id, { path: 'roleId', select: 'name permissions' });
    }

    user = await userRepository.findUserByEmail(email);
    if (user) {
      await userRepository.updateUserById(user._id, {
        googleId,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        avatar: avatar || user.avatar,
        lastLoginAt: new Date(),
      });
      logger.info({ userId: user._id, email }, 'Google account linked to existing user');
      return await userRepository.findUserById(user._id, { path: 'roleId', select: 'name permissions' });
    }

    const defaultRole = await roleRepository.findRoleByName('user');
    if (!defaultRole) {
      throw internalError('Default role "user" not found');
    }

    const newUser = await userRepository.createUser({
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      googleId,
      avatar: avatar || null,
      roleId: defaultRole._id,
      acceptedTerms: true,
      isActive: true,
      lastLoginAt: new Date(),
    });
    logger.info({ userId: newUser._id, email }, 'New user created via Google');
    return await userRepository.findUserById(newUser._id, { path: 'roleId', select: 'name permissions' });
  } catch (error) {
    logger.error({ error, googleProfile }, 'findOrCreateGoogleUser failed');
    throw error;
  }
}

export async function getCurrentUser(userId) {
  try {
    if (!userId) return null;
    const user = await userRepository.findUserById(userId, { path: 'roleId', select: 'name permissions' });
    if (!user) return null;
    if (!user.isActive) return null;
    return user;
  } catch (error) {
    logger.error({ error, userId }, 'getCurrentUser failed');
    return null;
  }
}

export async function logout(userId) {
  try {
    logger.info({ userId }, 'User logged out');
    return { success: true };
  } catch (error) {
    logger.error({ error, userId }, 'logout failed');
    throw internalError('Greška prilikom odjave');
  }
}