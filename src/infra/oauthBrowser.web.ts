import * as WebBrowser from 'expo-web-browser';
import type { OAuthBrowser } from '../model/repositories/AuthRepository';

/** O app Web é publicado em /app (ADR 0025); Linking.createURL usa só a origem. */
export const oauthBrowser: OAuthBrowser = {
  createRedirectUrl: (path) => new URL(`/app/${path}`, window.location.origin).toString(),
  openAuthSession: (url, redirectUrl) => WebBrowser.openAuthSessionAsync(url, redirectUrl),
};
