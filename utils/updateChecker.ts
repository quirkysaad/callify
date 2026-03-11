import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

const GITHUB_REPO = 'quirkysaad/shizn';
const CURRENT_VERSION = Constants.expoConfig?.version || '1.0.0';

export interface ReleaseInfo {
  version: string;
  url: string;
  notes?: string;
  isNewer: boolean;
}

/**
 * Compares two semantic version strings.
 * Returns true if v2 > v1.
 */
function isVersionNewer(v1: string, v2: string): boolean {
  const parse = (v: string) => v.replace(/^v/, '').split('.').map(Number);
  const p1 = parse(v1 || '0.0.0');
  const p2 = parse(v2 || '0.0.0');

  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n2 > n1) return true;
    if (n2 < n1) return false;
  }
  return false;
}

export async function checkUpdate(): Promise<ReleaseInfo | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('No releases found on GitHub yet.');
        return null;
      }
      throw new Error(`Failed to fetch releases: ${response.statusText}`);
    }

    const data = await response.json();
    const latestVersion = data.tag_name;
    const isNewer = isVersionNewer(CURRENT_VERSION, latestVersion);

    return {
      version: latestVersion,
      url: data.html_url,
      notes: data.body,
      isNewer,
    };
  } catch (error) {
    console.warn('Error checking for updates:', error);
    return null;
  }
}

export function openUpdateLink(url: string) {
  Linking.openURL(url);
}
