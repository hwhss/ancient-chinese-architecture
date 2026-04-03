<template>
  <view class="container">
    <view class="header-card">
      <text class="title">开发设置</text>
      <text class="subtitle">可在此修改后端接口地址</text>
    </view>

    <view class="form-card">
      <text class="label">当前 API 地址</text>
      <input
        v-model="apiBaseUrlInput"
        class="input"
        placeholder="例如：http://localhost:9527"
      />

      <view class="hint-list">
        <text class="hint-item">1. 环境变量可选，不是必填。</text>
        <text class="hint-item"
          >2. 此处保存后会写入本地缓存 API_BASE_URL。</text
        >
        <text class="hint-item"
          >3. 优先级：本地缓存 > 环境变量 > 默认地址。</text
        >
      </view>

      <button class="btn primary" :disabled="saving" @click="saveConfig">
        {{ saving ? "保存中..." : "保存地址" }}
      </button>
      <button class="btn" :disabled="testing" @click="testConnection">
        {{ testing ? "测试中..." : "测试连接" }}
      </button>
      <button class="btn warn" @click="resetDefault">恢复默认地址</button>
    </view>

    <view class="form-card">
      <text class="label">快速切换预设地址</text>
      <view class="preset-list">
        <view
          v-for="preset in presets"
          :key="preset.key"
          class="preset-item"
          :class="{
            active: currentApiBaseUrl === preset.url,
            disabled: !preset.url,
          }"
          @click="applyPreset(preset)"
        >
          <text class="preset-name">{{ preset.name }}</text>
          <text class="preset-url">{{ preset.url || "未配置" }}</text>
        </view>
      </view>

      <view class="preset-edit">
        <text class="label small">测试环境地址</text>
        <input
          v-model="presetTestUrl"
          class="input"
          placeholder="例如：https://test-api.example.com"
        />

        <text class="label small">生产环境地址</text>
        <input
          v-model="presetProdUrl"
          class="input"
          placeholder="例如：https://api.example.com"
        />

        <button class="btn" :disabled="savingPresets" @click="savePresets">
          {{ savingPresets ? "保存中..." : "保存预设地址" }}
        </button>
      </view>
    </view>

    <view class="status-card" v-if="message">
      <text class="status" :class="statusType">{{ message }}</text>
    </view>
  </view>
</template>

<script>
import {
  getApiBaseUrl,
  setApiBaseUrl,
  clearApiBaseUrl,
  healthCheck,
} from "../../services/api";

const DEFAULT_API_BASE_URL = "http://39.106.6.53";
const REMOTE_SERVER_URL = "http://39.106.6.53";
const PRESET_TEST_KEY = "API_PRESET_TEST";
const PRESET_PROD_KEY = "API_PRESET_PROD";

function normalizeBaseUrl(url) {
  const value = String(url || "").trim();
  return value.replace(/\/$/, "");
}

function getEnvPresetTest() {
  if (typeof process === "undefined" || !process.env) {
    return "";
  }
  return normalizeBaseUrl(
    process.env.UNI_APP_API_PRESET_TEST || process.env.VUE_APP_API_PRESET_TEST,
  );
}

function getEnvPresetProd() {
  if (typeof process === "undefined" || !process.env) {
    return "";
  }
  return normalizeBaseUrl(
    process.env.UNI_APP_API_PRESET_PROD || process.env.VUE_APP_API_PRESET_PROD,
  );
}

export default {
  data() {
    return {
      apiBaseUrlInput: "",
      currentApiBaseUrl: "",
      message: "",
      statusType: "info",
      saving: false,
      testing: false,
      savingPresets: false,
      presetTestUrl: "",
      presetProdUrl: "",
      presets: [],
    };
  },
  onLoad() {
    this.refreshCurrentApiBaseUrl();
    this.loadPresetValues();
  },
  methods: {
    showMessage(type, text) {
      this.statusType = type;
      this.message = text;
    },

    refreshCurrentApiBaseUrl() {
      const current = getApiBaseUrl();
      this.currentApiBaseUrl = current;
      this.apiBaseUrlInput = current;
    },

    loadPresetValues() {
      let savedTest = "";
      let savedProd = "";

      try {
        savedTest = normalizeBaseUrl(uni.getStorageSync(PRESET_TEST_KEY));
        savedProd = normalizeBaseUrl(uni.getStorageSync(PRESET_PROD_KEY));
      } catch (error) {
        savedTest = "";
        savedProd = "";
      }

      this.presetTestUrl = savedTest || getEnvPresetTest();
      this.presetProdUrl = savedProd || getEnvPresetProd();

      this.presets = [
        { key: "remote", name: "远程服务器", url: REMOTE_SERVER_URL },
        { key: "local", name: "本地开发", url: "http://localhost:9527" },
        { key: "test", name: "测试环境", url: this.presetTestUrl },
        { key: "prod", name: "生产环境", url: this.presetProdUrl },
      ];
    },

    async saveConfig() {
      this.saving = true;
      this.message = "";

      try {
        const ok = setApiBaseUrl(this.apiBaseUrlInput);
        if (!ok) {
          this.showMessage("error", "地址格式无效，请输入完整 http(s) 地址");
          return;
        }

        this.refreshCurrentApiBaseUrl();
        this.showMessage("success", `保存成功：${this.apiBaseUrlInput}`);
      } finally {
        this.saving = false;
      }
    },

    async savePresets() {
      this.savingPresets = true;
      this.message = "";

      try {
        this.presetTestUrl = normalizeBaseUrl(this.presetTestUrl);
        this.presetProdUrl = normalizeBaseUrl(this.presetProdUrl);

        if (this.presetTestUrl && !/^https?:\/\//i.test(this.presetTestUrl)) {
          this.showMessage(
            "error",
            "测试环境地址格式无效，请输入 http(s) 地址",
          );
          return;
        }

        if (this.presetProdUrl && !/^https?:\/\//i.test(this.presetProdUrl)) {
          this.showMessage(
            "error",
            "生产环境地址格式无效，请输入 http(s) 地址",
          );
          return;
        }

        uni.setStorageSync(PRESET_TEST_KEY, this.presetTestUrl);
        uni.setStorageSync(PRESET_PROD_KEY, this.presetProdUrl);

        this.loadPresetValues();
        this.showMessage("success", "预设地址已保存");
      } finally {
        this.savingPresets = false;
      }
    },

    applyPreset(preset) {
      if (!preset.url) {
        this.showMessage("error", `${preset.name}环境尚未配置地址`);
        return;
      }

      const ok = setApiBaseUrl(preset.url);
      if (!ok) {
        this.showMessage("error", `${preset.name}环境地址格式无效`);
        return;
      }

      this.refreshCurrentApiBaseUrl();
      this.showMessage("success", `已切换到${preset.name}环境：${preset.url}`);
    },

    async testConnection() {
      this.testing = true;
      this.message = "";

      try {
        const health = await healthCheck();
        const service = health && health.service ? health.service : "unknown";
        const status = health && health.status ? health.status : "unknown";
        this.showMessage("success", `连接成功：${service}（${status}）`);
      } catch (error) {
        this.showMessage("error", `连接失败：${error.message || "未知错误"}`);
      } finally {
        this.testing = false;
      }
    },

    resetDefault() {
      clearApiBaseUrl();
      this.refreshCurrentApiBaseUrl();
      this.showMessage("info", `已恢复默认地址：${this.apiBaseUrlInput}`);
    },
  },
};
</script>

<style>
.container {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 24rpx;
}

.header-card,
.form-card,
.status-card {
  background: #fff;
  border: 1rpx solid var(--bg-tertiary);
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.title {
  display: block;
  font-size: 36rpx;
  color: var(--text-primary);
  font-weight: bold;
}

.subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
}

.label {
  display: block;
  font-size: 28rpx;
  color: var(--text-primary);
  margin-bottom: 14rpx;
}

.input {
  height: 76rpx;
  border: 1rpx solid #d9c8b0;
  border-radius: 10rpx;
  padding: 0 18rpx;
  font-size: 28rpx;
  color: var(--text-primary);
  background: #fff;
}

.hint-list {
  margin: 18rpx 0;
}

.hint-item {
  display: block;
  font-size: 24rpx;
  color: #7a6753;
  line-height: 1.7;
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.preset-item {
  border: 1rpx solid #d9c8b0;
  border-radius: 10rpx;
  padding: 16rpx;
  background: #fff;
}

.preset-item.active {
  border-color: var(--secondary);
  background: #f9efe2;
}

.preset-item.disabled {
  opacity: 0.7;
}

.preset-name {
  display: block;
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: bold;
}

.preset-url {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preset-edit {
  margin-top: 20rpx;
}

.label.small {
  font-size: 24rpx;
  margin-top: 10rpx;
}

.btn {
  margin-top: 14rpx;
  height: 76rpx;
  line-height: 76rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  color: var(--secondary);
  border: 1rpx solid var(--secondary);
  background: #fff;
}

.btn.primary {
  background: var(--secondary);
  color: #fff;
}

.btn.warn {
  color: var(--error);
  border-color: var(--error);
}

.status {
  font-size: 26rpx;
  line-height: 1.7;
}

.status.info {
  color: var(--text-secondary);
}

.status.success {
  color: #2f7d32;
}

.status.error {
  color: var(--error);
}
</style>
