import { refreshSignedAssetToken } from './api';

function parseTokenFromSignedUrl(signedUrl) {
  const value = String(signedUrl || '').trim();
  if (!value) {
    return '';
  }

  try {
    const url = new URL(value);
    return String(url.searchParams.get('token') || '').trim();
  } catch (error) {
    return '';
  }
}

function getRefreshWindowMs(manifest) {
  const policy = manifest && manifest.tokenPolicy ? manifest.tokenPolicy : {};
  const seconds = Number(policy.refreshWindowSeconds);
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 60;
  return safeSeconds * 1000;
}

function getExpiresAtMs(manifest) {
  const expiresAt = manifest && manifest.scene ? manifest.scene.expiresAt : '';
  const parsed = Date.parse(String(expiresAt || ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function createModel3dTokenRefresher(manifest, onRefreshed) {
  let timer = null;
  let stopped = false;

  async function runRefresh(currentToken) {
    if (stopped || !currentToken) {
      return;
    }

    try {
      const result = await refreshSignedAssetToken(currentToken);
      if (result && result.shouldRefresh && typeof onRefreshed === 'function') {
        onRefreshed(result);
      }
    } catch (error) {
      // Refresh failure should not break current viewing session.
      console.warn('3D token refresh failed', error);
    }
  }

  function start() {
    const sceneEntry = manifest && manifest.scene ? manifest.scene.entry : '';
    const token = parseTokenFromSignedUrl(sceneEntry);
    if (!token) {
      return;
    }

    const expiresAtMs = getExpiresAtMs(manifest);
    const refreshWindowMs = getRefreshWindowMs(manifest);
    const delay = Math.max(0, expiresAtMs - Date.now() - refreshWindowMs);

    timer = setTimeout(() => {
      runRefresh(token);
    }, delay);
  }

  function stop() {
    stopped = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return {
    start,
    stop
  };
}

export {
  parseTokenFromSignedUrl,
  createModel3dTokenRefresher
};
