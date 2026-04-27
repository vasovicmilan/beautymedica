// src/controllers/auth.controller.js
import * as authService from '../../../services/auth.service.js';
import { internalError } from '../../../utils/error.util.js';
import logger from '../../../config/logger.config.js';

// Helper za SEO na auth stranicama (ne indeksira se)
function getAuthSeo(title) {
  return {
    title: title,
    robots: 'noindex, follow',
    description: '',
  };
}

async function exchangeGoogleCodeForProfile(code) {
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });
  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange code for token');
  }
  const tokenData = await tokenResponse.json();
  const { access_token } = tokenData;

  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!userInfoResponse.ok) {
    throw new Error('Failed to fetch user info');
  }
  const profile = await userInfoResponse.json();

  return {
    id: profile.id,
    email: profile.email,
    given_name: profile.given_name,
    family_name: profile.family_name,
    picture: profile.picture,
  };
}

export function showLoginPage(req, res) {
  const flash = req.session.flash;
  req.session.flash = null;
  const seo = getAuthSeo('Prijava');
  res.render('auth/login', { seo, flash });
}

export function showRegisterPage(req, res) {
  const flash = req.session.flash;
  req.session.flash = null;
  const seo = getAuthSeo('Registracija');
  res.render('auth/register', { seo, flash });
}

export function redirectToGoogle(req, res) {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email profile`;
  res.redirect(authUrl);
}

export async function googleCallback(req, res, next) {
  try {
    const { code } = req.query;
    if (!code) {
      req.session.flash = { type: 'danger', message: 'Nedostaje autorizacioni kod.' };
      return res.redirect('/auth/prijava');
    }
    const googleProfile = await exchangeGoogleCodeForProfile(code);
    const user = await authService.findOrCreateGoogleUser(googleProfile);
    if (!user) {
      req.session.flash = { type: 'danger', message: 'Greška pri kreiranju korisnika.' };
      return res.redirect('/auth/prijava');
    }

    // ✅ Extract only plain, serializable data
    const plainUser = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.roleId?.name || 'user',
      avatar: user.avatar,
    };

    req.session.isLoggedIn = true;
    req.session.user = plainUser;
    // Store role name as string instead of the whole roleId document
    req.session.userRole = plainUser.role;

    req.session.flash = { type: 'success', message: `Dobrodošli, ${user.firstName}!` };
    const redirectTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
  } catch (error) {
    logger.error({ error }, 'Google callback failed');
    req.session.flash = { type: 'danger', message: 'Došlo je do greške prilikom prijave.' };
    res.redirect('/auth/prijava');
  }
}

export async function logout(req, res, next) {
  try {
    const userId = req.session.user?.id;
    if (userId) {
      await authService.logout(userId);
    }
    req.session.destroy((err) => {
      if (err) {
        logger.error({ err }, 'Session destroy error');
        req.session.flash = { type: 'danger', message: 'Neuspešna odjava.' };
        return res.redirect('/');
      }
      res.redirect('/');
    });
  } catch (error) {
    next(error);
  }
}

export async function currentUser(req, res) {
  if (!req.session.isLoggedIn || !req.session.user) {
    return res.json({ user: null });
  }
  const user = await authService.getCurrentUser(req.session.user.id);
  if (!user) {
    req.session.destroy();
    return res.json({ user: null });
  }
  res.json({ user });
}