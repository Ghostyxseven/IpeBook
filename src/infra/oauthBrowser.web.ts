import * as WebBrowser from 'expo-web-browser';
import type { OAuthBrowser } from '../model/repositories/AuthRepository';

/** O app Web é publicado em /app (ADR 0025); Linking.createURL usa só a origem. */
export const oauthBrowser: OAuthBrowser = {
  createRedirectUrl: (path) => {
    const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';
    const prefix = isDev ? '/' : '/app/';
    return new URL(`${prefix}${path}`, window.location.origin).toString();
  },
  openAuthSession: (url, redirectUrl) => WebBrowser.openAuthSessionAsync(url, redirectUrl),
};
