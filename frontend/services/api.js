const DEFAULT_API_BASE_URL = "http://39.106.6.53";
const IMAGE_SOURCE_STORAGE_KEY = "IMAGE_SOURCE_SETTING";
const DEFAULT_IMAGE_SOURCE = "server";

function normalizeBaseUrl(url) {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }
  return value.replace(/\/$/, "");
}

function getRuntimeBaseUrl() {
  try {
    if (typeof uni !== "undefined" && uni.getStorageSync) {
      return normalizeBaseUrl(uni.getStorageSync("API_BASE_URL"));
    }
  } catch (error) {
    return "";
  }
  return "";
}

function getEnvBaseUrl() {
  if (typeof process === "undefined" || !process.env) {
    return "";
  }

  const envValue =
    process.env.UNI_APP_API_BASE_URL || process.env.VUE_APP_API_BASE_URL;

  return normalizeBaseUrl(envValue);
}

function isHttpUrl(url) {
  return /^https?:\/\//i.test(String(url || "").trim());
}

function normalizeImageSource(value) {
  const mode = String(value || "").trim().toLowerCase();
  if (mode === "local" || mode === "object" || mode === "server") {
    return mode;
  }
  return "object";
}

function getRuntimeImageSource() {
  try {
    if (typeof uni !== "undefined" && uni.getStorageSync) {
      return normalizeImageSource(uni.getStorageSync(IMAGE_SOURCE_STORAGE_KEY));
    }
  } catch (error) {
    return DEFAULT_IMAGE_SOURCE;
  }
  return DEFAULT_IMAGE_SOURCE;
}

let apiBaseUrl =
  getRuntimeBaseUrl() ||
  getEnvBaseUrl() ||
  normalizeBaseUrl(DEFAULT_API_BASE_URL);
let imageSource = getRuntimeImageSource();

function normalizeError(error, fallbackMessage) {
  if (!error) {
    return new Error(fallbackMessage);
  }

  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  if (error.msg) {
    return new Error(error.msg);
  }

  if (error.message) {
    return new Error(error.message);
  }

  return new Error(fallbackMessage);
}

function buildHttpErrorMessage(statusCode, serverMsg) {
  const defaultMessageMap = {
    400: "请求参数有误，请检查输入",
    401: "未授权，请先登录或检查认证信息",
    403: "无权限访问该资源",
    404: "接口或资源不存在",
    408: "请求超时，请稍后重试",
    429: "请求过于频繁，请稍后再试",
    500: "服务端异常，请稍后重试",
    502: "网关异常，请稍后重试",
    503: "服务暂不可用，请稍后重试",
    504: "网关超时，请稍后重试",
  };

  const defaultMessage =
    defaultMessageMap[statusCode] || `请求失败（HTTP ${statusCode || "unknown"}）`;

  return serverMsg ? `${serverMsg}（HTTP ${statusCode || "unknown"}）` : defaultMessage;
}

function request(url, method = "GET", data) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${apiBaseUrl}${url}`,
      method,
      data,
      header: {
        "X-Image-Source": imageSource,
      },
      timeout: 10000,
      success: (response) => {
        const result = response.data || {};
        const statusCode = response.statusCode || 0;
        const resultCode = Number(result.code);
        const isBusinessSuccess =
          Number.isFinite(resultCode) && resultCode >= 200 && resultCode < 300;

        if (statusCode >= 200 && statusCode < 300 && isBusinessSuccess) {
          resolve(result.data);
          return;
        }

        const message = buildHttpErrorMessage(statusCode, result.msg);
        const error = normalizeError(result, message);
        error.statusCode = statusCode;
        error.responseData = result;
        error.detail = result.error || null;
        reject(error);
      },
      fail: (error) => {
        const fallback =
          error && error.errMsg && error.errMsg.includes("timeout")
            ? "请求超时，请检查网络或后端服务状态"
            : "网络异常，请检查后端服务是否启动";
        reject(normalizeError(error, fallback));
      },
    });
  });
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}

export function setApiBaseUrl(url) {
  const normalized = normalizeBaseUrl(url);
  if (!normalized || !isHttpUrl(normalized)) {
    return false;
  }

  apiBaseUrl = normalized;

  try {
    if (typeof uni !== "undefined" && uni.setStorageSync) {
      uni.setStorageSync("API_BASE_URL", normalized);
    }
  } catch (error) {
    // ignore storage failures and keep in-memory override
  }

  return true;
}

export function clearApiBaseUrl() {
  apiBaseUrl = getEnvBaseUrl() || normalizeBaseUrl(DEFAULT_API_BASE_URL);

  try {
    if (typeof uni !== "undefined" && uni.removeStorageSync) {
      uni.removeStorageSync("API_BASE_URL");
    }
  } catch (error) {
    // ignore storage failures and keep in-memory fallback
  }

  return apiBaseUrl;
}

export function getImageSourceSetting() {
  return imageSource;
}

export function setImageSourceSetting(value) {
  imageSource = normalizeImageSource(value);
  try {
    if (typeof uni !== "undefined" && uni.setStorageSync) {
      uni.setStorageSync(IMAGE_SOURCE_STORAGE_KEY, imageSource);
    }
  } catch (error) {
    // ignore storage failures and keep in-memory override
  }
  return imageSource;
}

export async function healthCheck() {
  return request("/api/health", "GET");
}

export async function chat(question) {
  return request("/api/chat", "POST", { question });
}

export async function getBuildings(params = {}) {
  return request("/api/buildings", "GET", params);
}

export async function getBuildingById(id) {
  return request(`/api/buildings/${id}`, "GET");
}

export async function getBuildingModel3d(id) {
  return request(`/api/buildings/${id}/model3d`, "GET");
}

export async function getBuildingModel3dManifest(id) {
  return request(`/api/buildings/${id}/model3d/manifest`, "GET");
}

export async function refreshSignedAssetToken(token) {
  return request('/api/assets/refresh', 'GET', { token });
}

export async function getMaterialById(materialId) {
  return request("/api/material", "GET", { materialId });
}

export async function getVisualizationOverview() {
  return request('/api/visualization/overview', 'GET');
}

export async function getVisualizationMapPoints() {
  return request('/api/visualization/map-points', 'GET');
}

export async function getVisualizationTimeline(params = {}) {
  return request('/api/visualization/timeline', 'GET', params);
}

export async function getVisualizationStats(params = {}) {
  return request('/api/visualization/stats', 'GET', params);
}
