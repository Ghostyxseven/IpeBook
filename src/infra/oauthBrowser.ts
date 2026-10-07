import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { OAuthBrowser } from '../model/repositories/AuthRepository';

/** Implementação Expo do `OAuthBrowser` usado pelo login com o Google (ADR 0028). */
export const oauthBrowser: OAuthBrowser = {
  createRedirectUrl: (path) => Linking.createURL(path),
  openAuthSession: (url, redirectUrl) => WebBrowser.openAuthSessionAsync(url, redirectUrl),
};
