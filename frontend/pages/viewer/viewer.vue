<template>
  <view class="page">
    <view class="topbar">
      <view class="page-container">
        <view class="topbar-inner">
          <button class="back" @click="goBack">
            <text class="back-arrow">←</text>
            <view class="back-copy">
              <text class="back-label">返回</text>
              <text class="back-subtitle">建筑列表</text>
            </view>
          </button>
          <view class="title-block">
            <text class="title">3D 导览</text>
            <text class="subtitle">{{ buildingName }}</text>
          </view>
          <view class="topbar-badge">
            <text class="topbar-badge-label">{{ activeModeLabel }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="body">
      <view v-if="loading" class="state-card">
        <text class="state-text">正在加载 3D 场景...</text>
      </view>

      <view v-else-if="error" class="state-card error-card">
        <text class="state-text error-text">{{ error }}</text>
      </view>

      <view v-else class="viewer-shell">
        <view class="page-container viewer-container">
          <view class="viewer-stage">
            <image
              v-if="stageCover"
              class="stage-cover"
              :src="stageCover"
              mode="aspectFill"
              lazy-load="true"
            />
            <view class="stage-mask"></view>

            <view class="stage-chip-row">
              <text class="stage-chip">{{ activeModeLabel }}</text>
              <text class="stage-chip ghost">{{ manifest.activeVersion || "无可用版本" }}</text>
            </view>

            <view v-if="activeMode === 'model'" class="model-host-wrapper">
              <view id="three-host" class="three-host"></view>
              <view v-if="modelLoading" class="model-overlay">
                <text class="model-overlay-text">three.js 正在加载模型...</text>
              </view>
              <view v-if="modelError" class="model-overlay model-overlay-error">
                <text class="model-overlay-text">{{ modelError }}</text>
              </view>
              <view v-if="!isH5" class="model-overlay model-overlay-error">
                <text class="model-overlay-text">当前环境不支持 three.js 实时渲染，请切换到 H5 预览。</text>
              </view>
              <view v-if="selectedHotspotInfo" class="hotspot-popup">
                <view class="hotspot-popup-header">
                  <text class="hotspot-popup-title">{{ selectedHotspotInfo.title }}</text>
                  <button class="hotspot-popup-close" @click="closeHotspotPopup">×</button>
                </view>
                <text class="hotspot-popup-body">{{ selectedHotspotInfo.narration || "暂无讲解内容" }}</text>
              </view>
            </view>

            <view v-else class="panorama-wrapper">
              <image
                class="panorama-image"
                :src="panoramaUrl || stageCover"
                mode="aspectFill"
                lazy-load="true"
              />
              <view class="panorama-overlay">
                <text class="panorama-label">PANORAMA PREVIEW</text>
              </view>
            </view>
          </view>

          <view class="mode-switch" role="tablist">
            <button
              class="mode-btn"
              :class="{ active: activeMode === 'model' }"
              @click="switchMode('model')"
            >
              three.js 模型
            </button>
            <button
              class="mode-btn"
              :class="{ active: activeMode === 'panorama' }"
              :disabled="!hasPanorama"
              @click="switchMode('panorama')"
            >
              全景预览
            </button>
          </view>
  
          <view class="meta-card">
            <text class="meta-title">场景说明</text>
            <text class="meta-line">{{ manifest.preload.uiHint || "先加载占位资源，再切换高清资源" }}</text>
            <text v-if="hasLodAvailable" class="meta-line">已启用 LOD 分级加载：先显示轻量模型，再切换高清模型。</text>
            <text v-else class="meta-line">当前仅提供基础 3D 模型，LOD 分级加载与点击式热点讲解暂未开放。</text>
            <text v-if="isFallbackGuide" class="meta-line">已提供赵州桥文本讲解，可先用于演示和内容校对。</text>
            <text class="meta-line">资源格式：{{ manifest.scene.format || "glb" }}</text>
            <text class="meta-line">过期时间：{{ expireText }}</text>
            <text class="meta-line">加载状态：{{ lodPhaseText }}</text>
          </view>
  
          <view class="guide-card">
            <text class="guide-title">{{ guideTitle }}</text>
            <view v-if="!displayGuide.length" class="guide-empty">
              <text>当前建筑的热点讲解仍在开发中，赵州桥已支持文本讲解。</text>
            </view>
            <view v-else>
              <view
                v-for="item in displayGuide"
                :key="item.id"
                class="guide-item"
                :class="{ selected: selectedHotspotId === item.id }"
                @click="selectHotspot(item)"
              >
                <text class="guide-item-title">{{ item.title }}</text>
                <text class="guide-item-body">{{ item.narration || "暂无讲解内容" }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getBuildingModel3dManifest } from "../../services/api";

const THREE_LIBS = [
  "https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/DRACOLoader.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/Pass.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/OutlinePass.js",
];

let libsReadyPromise = null;

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("window is not available"));
      return;
    }

    const found = document.querySelector(`script[data-three-src="${src}"]`);
    if (found) {
      if (found.getAttribute("data-loaded") === "1") {
        resolve();
      } else {
        found.addEventListener("load", () => resolve(), { once: true });
        found.addEventListener("error", () => reject(new Error(`load failed: ${src}`)), {
          once: true,
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute("data-three-src", src);
    script.onload = () => {
      script.setAttribute("data-loaded", "1");
      resolve();
    };
    script.onerror = () => reject(new Error(`load failed: ${src}`));
    document.head.appendChild(script);
  });
}

function ensureThreeLibs() {
  if (libsReadyPromise) {
    return libsReadyPromise;
  }

  libsReadyPromise = THREE_LIBS.reduce((chain, src) => {
    return chain.then(() => loadScriptOnce(src));
  }, Promise.resolve());

  return libsReadyPromise;
}

function formatExpireText(expiresAt) {
  const text = String(expiresAt || "").trim();
  if (!text) {
    return "未知";
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    return "未知";
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

function parseCameraDistance(orbit) {
  const text = String(orbit || "");
  const match = text.match(/([\d.]+)m/);
  const dist = match ? Number(match[1]) : 3;
  return Number.isFinite(dist) && dist > 0 ? dist : 3;
}

function parseLodLevel(item) {
  const value = Number(item && item.level);
  return Number.isFinite(value) ? value : 999;
}

function pickLodUrl(item) {
  return item && (item.modelUrl || item.url) ? String(item.modelUrl || item.url).trim() : "";
}

const FALLBACK_TEXT_GUIDE = {
  zhaozhou_bridge: [
    {
      id: "zhaozhou-arch",
      title: "一、敞肩拱总体结构",
      narration:
        "赵州桥采用单孔敞肩石拱，主拱上方开设小拱，既减轻自重，也提升泄洪能力，是古代桥梁结构创新的关键。",
    },
    {
      id: "zhaozhou-force",
      title: "二、受力与稳定性",
      narration:
        "主拱将荷载沿拱线向两侧桥台传递，形成稳定受力路径。石拱桥在材料抗压特性下表现优异，这也是其历经千年仍保持良好状态的重要原因。",
    },
    {
      id: "zhaozhou-hydrology",
      title: "三、水文适应能力",
      narration:
        "敞肩设计让洪水期水流更容易通过，减小桥体阻水压力。桥面、拱圈与泄洪关系的综合处理体现了古代工程对自然条件的精准适配。",
    },
    {
      id: "zhaozhou-value",
      title: "四、工程与文化价值",
      narration:
        "赵州桥不仅是交通设施，更是中国古代工程智慧的代表。它将结构效率、施工工艺与长期耐久性统一，是桥梁史上的里程碑。",
    },
  ],
};

const FALLBACK_GUIDE_ALIAS_MAP = {
  zhaozhou_bridge: "zhaozhou_bridge",
  zhaozhoubridge: "zhaozhou_bridge",
  "赵州桥": "zhaozhou_bridge",
};

const TABBAR_PAGES = [
  "/pages/home/home",
  "/pages/map/map",
  "/pages/index/index",
  "/pages/favorites/favorites",
];

export default {
  data() {
    return {
      materialId: "",
      materialName: "",
      loading: false,
      error: "",
      activeMode: "model",
      selectedHotspotId: "",
      selectedHotspotInfo: null,
      manifest: {
        buildingId: "",
        buildingName: "",
        activeVersion: "",
        poster: "",
        preload: {
          placeholderType: "poster",
          panoramaUrl: "",
          posterBlur: "",
          uiHint: "",
        },
        camera: {
          orbit: "45deg 65deg 3m",
          target: "0m 0.6m 0m",
          fov: "45deg",
        },
        scene: {
          format: "glb",
          entry: "",
          expiresAt: "",
          lod: [],
        },
        hotspotGuide: [],
      },
      modelLoading: false,
      modelError: "",
      rendererStarted: false,
      isH5: false,
      lodPhase: "idle",
      lodActiveUrl: "",
      lodHdTimer: null,
      renderState: {
        THREE: null,
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        rootModel: null,
        frameHandle: 0,
        resizeHandler: null,
        composer: null,
        outlinePass: null,
        renderPass: null,
        raycaster: null,
        mouse: null,
        clickHandler: null,
        mouseMoveHandler: null,
        selectedObjects: [],
        hotspotMeshes: new Map(),
      },
    };
  },

  computed: {
    buildingName() {
      return this.manifest.buildingName || this.materialName || "古建筑";
    },

    hasPanorama() {
      return Boolean(this.panoramaUrl);
    },

    panoramaUrl() {
      return this.manifest.preload && this.manifest.preload.panoramaUrl
        ? this.manifest.preload.panoramaUrl
        : "";
    },

    stageCover() {
      const preload = this.manifest.preload || {};
      return preload.posterBlur || this.manifest.poster || "";
    },

    activeModeLabel() {
      return this.activeMode === "panorama" ? "全景预览" : "three.js模型";
    },

    hotspotGuide() {
      return Array.isArray(this.manifest.hotspotGuide)
        ? this.manifest.hotspotGuide
        : [];
    },

    hasLodAvailable() {
      const preloadLod0 = String((this.manifest.preload && this.manifest.preload.lod0ModelUrl) || "").trim();
      const lodList = Array.isArray(this.manifest.scene && this.manifest.scene.lod)
        ? this.manifest.scene.lod
        : [];
      return Boolean(preloadLod0) || lodList.length > 0;
    },

    displayGuide() {
      if (this.hotspotGuide.length) {
        return this.hotspotGuide;
      }

      const candidateKeys = [
        this.materialId,
        this.manifest.buildingId,
        this.manifest.buildingName,
        this.materialName,
      ]
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .map((item) => FALLBACK_GUIDE_ALIAS_MAP[item] || item);

      const matchedKey = candidateKeys.find((key) => Array.isArray(FALLBACK_TEXT_GUIDE[key]));
      const guideById = matchedKey ? FALLBACK_TEXT_GUIDE[matchedKey] : [];
      if (guideById.length) {
        return guideById;
      }

      return [];
    },

    isFallbackGuide() {
      return !this.hotspotGuide.length && this.displayGuide.length > 0;
    },

    guideTitle() {
      return this.isFallbackGuide ? "赵州桥讲解（文本版）" : "热点讲解";
    },

    expireText() {
      return formatExpireText(this.manifest.scene && this.manifest.scene.expiresAt);
    },

    lodPhaseText() {
      const map = {
        idle: "待加载",
        loading_lod0: "正在加载 LOD0 占位",
        lod0_ready: "LOD0 已就绪",
        loading_hd: "正在替换高清资源",
        hd_ready: "高清模型已就绪",
      };

      const phaseText = map[this.lodPhase] || "未知";
      if (!this.lodActiveUrl) {
        return phaseText;
      }

      return `${phaseText}（${this.lodActiveUrl}）`;
    },
  },

  onLoad(options) {
    this.materialId = String(options.materialId || "").trim();
    this.materialName = options.name ? decodeURIComponent(options.name) : "";
    this.isH5 = typeof window !== "undefined";

    if (!this.materialId) {
      this.error = "缺少建筑ID，无法加载3D导览";
      return;
    }

    this.loadManifest();
  },

  onUnload() {
    this.destroyThree();
  },

  methods: {
    async loadManifest() {
      this.loading = true;
      this.error = "";

      try {
        const data = await getBuildingModel3dManifest(this.materialId);
        this.manifest = {
          ...this.manifest,
          ...data,
          preload: {
            ...this.manifest.preload,
            ...(data.preload || {}),
          },
          camera: {
            ...this.manifest.camera,
            ...(data.camera || {}),
          },
          scene: {
            ...this.manifest.scene,
            ...(data.scene || {}),
          },
        };

        if (!this.manifest.canView || !this.manifest.scene.entry) {
          this.error = "当前建筑暂未开放可访问的3D资源";
          return;
        }

        if (!this.hasPanorama && this.activeMode === "panorama") {
          this.activeMode = "model";
        }

        if (this.displayGuide.length) {
          this.selectedHotspotId = this.displayGuide[0].id;
          this.selectedHotspotInfo = this.displayGuide[0];
        }

        if (this.activeMode === "model") {
          this.startModelRender();
        }
      } catch (error) {
        console.error("加载3D manifest失败:", error);
        this.error = error && error.message ? error.message : "3D场景加载失败";
      } finally {
        this.loading = false;
      }
    },

    async startModelRender() {
      if (!this.isH5 || this.rendererStarted) {
        return;
      }

      this.modelLoading = true;
      this.modelError = "";

      try {
        await ensureThreeLibs();
        this.initThree();
        await this.loadLodPipeline();
        this.rendererStarted = true;
      } catch (error) {
        console.error("three.js 初始化失败:", error);
        this.modelError = "three.js 渲染初始化失败，请稍后重试";
      } finally {
        this.modelLoading = false;
      }
    },

    initThree() {
      if (this.renderState.renderer) {
        return;
      }

      const THREE = window.THREE;
      const host = document.getElementById("three-host");
      if (!THREE || !host) {
        throw new Error("three host not ready");
      }

      const width = host.clientWidth || 320;
      const height = host.clientHeight || 420;

      const scene = new THREE.Scene();
      scene.background = null;

      const fov = Number(String(this.manifest.camera.fov || "45").replace("deg", "")) || 45;
      const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100);
      const dist = parseCameraDistance(this.manifest.camera.orbit);
      camera.position.set(dist * 0.65, dist * 0.5, dist);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      host.innerHTML = "";
      host.appendChild(renderer.domElement);

      const hemi = new THREE.HemisphereLight(0xffecd2, 0x3d2817, 0.6);
      scene.add(hemi);

      const ambient = new THREE.AmbientLight(0xffe4c4, 0.4);
      scene.add(ambient);

      const directional = new THREE.DirectionalLight(0xfff0d6, 1.2);
      directional.position.set(5, 8, 6);
      directional.castShadow = true;
      directional.shadow.mapSize.width = 2048;
      directional.shadow.mapSize.height = 2048;
      directional.shadow.camera.near = 0.5;
      directional.shadow.camera.far = 50;
      scene.add(directional);

      const warmFill = new THREE.DirectionalLight(0xffd4a3, 0.5);
      warmFill.position.set(-3, 2, -4);
      scene.add(warmFill);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.target.set(0, 0.6, 0);
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;

      const grid = new THREE.GridHelper(8, 16, 0xb08c64, 0x8e6e4b);
      grid.position.y = -0.01;
      scene.add(grid);

      const composer = new THREE.EffectComposer(renderer);
      const renderPass = new THREE.RenderPass(scene, camera);
      composer.addPass(renderPass);

      const outlinePass = new THREE.OutlinePass(
        new THREE.Vector2(width, height),
        scene,
        camera
      );
      outlinePass.edgeStrength = 3.0;
      outlinePass.edgeGlow = 0.5;
      outlinePass.edgeThickness = 2.0;
      outlinePass.visibleEdgeColor.set(0xc82506);
      outlinePass.hiddenEdgeColor.set(0x8b4513);
      outlinePass.pulsePeriod = 2;
      composer.addPass(outlinePass);

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onMouseClick = (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
          const hit = intersects[0];
          let targetObject = hit.object;

          while (targetObject.parent && targetObject.parent !== scene) {
            targetObject = targetObject.parent;
          }

          this.handleObjectClick(targetObject);
        } else {
          this.clearSelection();
        }
      };

      const onMouseMove = (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
          renderer.domElement.style.cursor = "pointer";
        } else {
          renderer.domElement.style.cursor = "default";
        }
      };

      renderer.domElement.addEventListener("click", onMouseClick);
      renderer.domElement.addEventListener("mousemove", onMouseMove);

      const animate = () => {
        controls.update();
        composer.render();
        this.renderState.frameHandle = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        const nextWidth = host.clientWidth || 320;
        const nextHeight = host.clientHeight || 420;
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(nextWidth, nextHeight);
        composer.setSize(nextWidth, nextHeight);
      };
      window.addEventListener("resize", onResize);

      this.renderState = {
        ...this.renderState,
        THREE,
        scene,
        camera,
        renderer,
        controls,
        composer,
        renderPass,
        outlinePass,
        raycaster,
        mouse,
        clickHandler: onMouseClick,
        mouseMoveHandler: onMouseMove,
        resizeHandler: onResize,
      };
    },

    handleObjectClick(object) {
      const { outlinePass, hotspotMeshes } = this.renderState;

      const hotspotId = hotspotMeshes.get(object.uuid);
      if (hotspotId) {
        const hotspot = this.displayGuide.find((h) => h.id === hotspotId);
        if (hotspot) {
          this.selectedHotspotId = hotspotId;
          this.selectedHotspotInfo = hotspot;
        }
      }

      if (outlinePass) {
        outlinePass.selectedObjects = [object];
        this.renderState.selectedObjects = [object];
      }
    },

    clearSelection() {
      const { outlinePass } = this.renderState;
      if (outlinePass) {
        outlinePass.selectedObjects = [];
        this.renderState.selectedObjects = [];
      }
      this.selectedHotspotInfo = null;
    },

    closeHotspotPopup() {
      this.selectedHotspotInfo = null;
      this.clearSelection();
    },

    resolveLodPlan() {
      const preload = this.manifest.preload || {};
      const scene = this.manifest.scene || {};
      const lodItems = Array.isArray(scene.lod) ? scene.lod : [];

      const sortedLod = [...lodItems]
        .map((item) => ({
          level: parseLodLevel(item),
          url: pickLodUrl(item),
        }))
        .filter((item) => item.url)
        .sort((a, b) => a.level - b.level);

      const lod0FromList = sortedLod.find((item) => item.level === 0);
      const lod0Url = String(preload.lod0ModelUrl || (lod0FromList ? lod0FromList.url : "") || "").trim();
      const hdUrl = String(scene.entry || "").trim();

      return {
        lod0Url,
        hdUrl,
      };
    },

    clearHdTimer() {
      if (this.lodHdTimer) {
        clearTimeout(this.lodHdTimer);
        this.lodHdTimer = null;
      }
    },

    async loadLodPipeline() {
      const { lod0Url, hdUrl } = this.resolveLodPlan();

      if (!hdUrl) {
        throw new Error("高清模型入口为空");
      }

      this.clearHdTimer();

      if (lod0Url && lod0Url !== hdUrl) {
        this.lodPhase = "loading_lod0";
        await this.loadMainModel(lod0Url, 0);
        this.lodPhase = "lod0_ready";

        this.lodHdTimer = setTimeout(async () => {
          try {
            this.lodPhase = "loading_hd";
            await this.loadMainModel(hdUrl, 1);
            this.lodPhase = "hd_ready";
          } catch (error) {
            console.warn("高清模型替换失败，保留LOD0", error);
            this.lodPhase = "lod0_ready";
          }
        }, 800);
        return;
      }

      this.lodPhase = "loading_hd";
      await this.loadMainModel(hdUrl, 1);
      this.lodPhase = "hd_ready";
    },

    disposeObject3D(root) {
      if (!root) {
        return;
      }

      root.traverse((node) => {
        if (node.geometry && typeof node.geometry.dispose === "function") {
          node.geometry.dispose();
        }

        const material = node.material;
        if (Array.isArray(material)) {
          material.forEach((item) => {
            if (item && typeof item.dispose === "function") {
              item.dispose();
            }
          });
        } else if (material && typeof material.dispose === "function") {
          material.dispose();
        }
      });
    },

    enhanceMaterials(model) {
      const { THREE } = this.renderState;

      model.traverse((node) => {
        if (node.isMesh && node.material) {
          const oldMat = node.material;

          if (oldMat.isMeshStandardMaterial || oldMat.isMeshPhysicalMaterial) {
            oldMat.roughness = Math.max(0.3, oldMat.roughness * 0.8);
            oldMat.metalness = Math.min(0.6, oldMat.metalness * 1.2);
            oldMat.envMapIntensity = 1.0;
          } else {
            const newMat = new THREE.MeshStandardMaterial({
              color: oldMat.color || 0xffffff,
              map: oldMat.map || null,
              roughness: 0.6,
              metalness: 0.2,
            });

            if (oldMat.map) {
              newMat.map = oldMat.map;
            }

            node.material = newMat;
          }

          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
    },

    async loadMainModel(url, lodLevel) {
      if (!url) {
        throw new Error("model url is empty");
      }

      const { THREE, scene } = this.renderState;
      if (!THREE || !scene || !THREE.GLTFLoader) {
        throw new Error("GLTFLoader not available");
      }

      const loader = new THREE.GLTFLoader();

      if (THREE.DRACOLoader) {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/");
        loader.setDRACOLoader(dracoLoader);
      }

      const model = await new Promise((resolve, reject) => {
        loader.load(
          url,
          (gltf) => resolve(gltf.scene || null),
          undefined,
          (error) => reject(error)
        );
      });

      if (!model) {
        throw new Error("gltf scene is empty");
      }

      if (this.renderState.rootModel) {
        scene.remove(this.renderState.rootModel);
        this.disposeObject3D(this.renderState.rootModel);
        this.renderState.rootModel = null;
      }

      this.enhanceMaterials(model);

      model.position.set(0, 0, 0);
      scene.add(model);
      this.renderState.rootModel = model;
      this.lodActiveUrl = `L${lodLevel}`;

      this.renderState.hotspotMeshes.clear();
      this.displayGuide.forEach((hotspot) => {
        if (hotspot.meshName || hotspot.targetName) {
          const targetName = hotspot.meshName || hotspot.targetName;
          model.traverse((node) => {
            if (node.isMesh && node.name === targetName) {
              this.renderState.hotspotMeshes.set(node.uuid, hotspot.id);
            }
          });
        }
      });
    },

    switchMode(mode) {
      if (mode === "panorama" && !this.hasPanorama) {
        return;
      }

      this.activeMode = mode;

      if (mode === "model") {
        this.startModelRender();
      }
    },

    selectHotspot(item) {
      this.selectedHotspotId = item.id;
      this.selectedHotspotInfo = item;

      const { rootModel, outlinePass } = this.renderState;
      if (rootModel && outlinePass) {
        const targetName = item.meshName || item.targetName;
        if (targetName) {
          rootModel.traverse((node) => {
            if (node.isMesh && node.name === targetName) {
              outlinePass.selectedObjects = [node];
              this.renderState.selectedObjects = [node];
            }
          });
        }
      }
    },

    destroyThree() {
      const state = this.renderState;
      this.clearHdTimer();

      if (state.frameHandle) {
        cancelAnimationFrame(state.frameHandle);
      }
      if (state.resizeHandler && this.isH5) {
        window.removeEventListener("resize", state.resizeHandler);
      }
      if (state.clickHandler && state.renderer) {
        state.renderer.domElement.removeEventListener("click", state.clickHandler);
      }
      if (state.mouseMoveHandler && state.renderer) {
        state.renderer.domElement.removeEventListener("mousemove", state.mouseMoveHandler);
      }
      if (state.controls) {
        state.controls.dispose();
      }
      if (state.composer) {
        state.composer.dispose();
      }
      if (state.renderer) {
        state.renderer.dispose();
      }
      if (state.rootModel && state.scene) {
        state.scene.remove(state.rootModel);
        this.disposeObject3D(state.rootModel);
      }

      this.renderState = {
        THREE: null,
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        rootModel: null,
        frameHandle: 0,
        resizeHandler: null,
        composer: null,
        outlinePass: null,
        renderPass: null,
        raycaster: null,
        mouse: null,
        clickHandler: null,
        mouseMoveHandler: null,
        selectedObjects: [],
        hotspotMeshes: new Map(),
      };
      this.lodPhase = "idle";
      this.lodActiveUrl = "";
      this.rendererStarted = false;
      this.selectedHotspotInfo = null;
    },

    goBackWithFallback() {
      const target = this.materialId
        ? `/pages/detail/detail?materialId=${encodeURIComponent(this.materialId)}`
        : "/pages/home/home";

      if (TABBAR_PAGES.includes(target)) {
        uni.switchTab({
          url: target,
          fail: () => {
            uni.switchTab({ url: "/pages/home/home" });
          },
        });
        return;
      }

      uni.redirectTo({
        url: target,
        fail: () => {
          uni.switchTab({ url: "/pages/home/home" });
        },
      });
    },

    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({
          fail: () => {
            this.goBackWithFallback();
          },
        });
        return;
      }

      this.goBackWithFallback();
    },
  },
};
</script>

<style>
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(255, 248, 233, 0.95) 0%, rgba(245, 238, 224, 0.82) 35%, rgba(234, 222, 199, 1) 100%);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 20rpx 0 18rpx;
  background: linear-gradient(180deg, rgba(110, 63, 34, 0.98) 0%, rgba(95, 53, 27, 0.94) 100%);
  box-shadow: 0 10rpx 28rpx rgba(71, 39, 18, 0.18);
}

.topbar-inner {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.back {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx 16rpx 18rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 241, 220, 0.26);
  background: rgba(255, 247, 233, 0.12);
  color: #fff6e6;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.15), 0 10rpx 22rpx rgba(48, 24, 8, 0.14);
}

.back-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  border-radius: 999rpx;
  background: rgba(255, 245, 228, 0.16);
  font-size: 28rpx;
  line-height: 1;
}

.back-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}

.back-label {
  font-size: 26rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.back-subtitle {
  margin-top: 4rpx;
  font-size: 18rpx;
  color: rgba(255, 243, 224, 0.72);
}

.title-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  min-width: 0;
}

.title {
  text-align: center;
  color: #fff4de;
  font-size: 36rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
  line-height: 1.1;
}

.subtitle {
  text-align: center;
  color: rgba(255, 242, 220, 0.78);
  font-size: 20rpx;
  letter-spacing: 1rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140rpx;
  padding: 14rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 247, 233, 0.12);
  border: 1rpx solid rgba(255, 241, 220, 0.16);
}

.topbar-badge-label {
  color: #fff6e8;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.body {
  padding: 28rpx 24rpx 40rpx;
}

.state-card {
  padding: 110rpx 28rpx;
  border-radius: 28rpx;
  border: 1rpx solid #d9c3a5;
  background: #fff9f0;
  text-align: center;
  box-shadow: 0 18rpx 42rpx rgba(77, 54, 31, 0.08);
}

.state-text {
  font-size: 28rpx;
  color: #6a4f3b;
}

.error-card {
  border-color: #d8a6a6;
}

.error-text {
  color: #a84b4b;
}

.viewer-shell {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.viewer-container {
  max-width: 900px;
}

.viewer-stage {
  position: relative;
  min-height: 700rpx;
  border-radius: 30rpx;
  overflow: hidden;
  background: linear-gradient(180deg, #241b14 0%, #17100c 100%);
  border: 1rpx solid rgba(207, 179, 143, 0.75);
  box-shadow: 0 28rpx 60rpx rgba(51, 31, 17, 0.18);
}

.stage-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.stage-mask {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 15%, rgba(255, 196, 120, 0.16) 0%, transparent 35%),
    linear-gradient(150deg, rgba(42, 26, 12, 0.78) 0%, rgba(18, 10, 4, 0.44) 100%);
}

.stage-chip-row {
  position: absolute;
  top: 22rpx;
  left: 22rpx;
  right: 22rpx;
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.stage-chip {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #fff7ea;
  background: rgba(131, 80, 41, 0.82);
}

.stage-chip.ghost {
  background: rgba(255, 255, 255, 0.18);
}

.model-placeholder {
  position: relative;
  z-index: 2;
  min-height: 700rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 42rpx 34rpx;
}

.placeholder-badge {
  padding: 8rpx 14rpx;
  margin-bottom: 16rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  color: #2d1709;
  background: #f4d9af;
  letter-spacing: 1rpx;
}

.placeholder-title {
  font-size: 50rpx;
  font-weight: 700;
  color: #fff5df;
  margin-bottom: 14rpx;
}

.placeholder-desc {
  width: 78%;
  font-size: 28rpx;
  line-height: 1.6;
  color: #f5debd;
}

.model-host-wrapper {
  position: relative;
  z-index: 2;
  min-height: 700rpx;
}

.three-host {
  width: 100%;
  height: 700rpx;
}

.model-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32rpx;
  background: rgba(33, 20, 10, 0.4);
}

.model-overlay-error {
  background: rgba(120, 45, 45, 0.5);
}

.model-overlay-text {
  font-size: 26rpx;
  color: #fff6e6;
  line-height: 1.5;
  text-align: center;
}

.hotspot-popup {
  position: absolute;
  right: 22rpx;
  top: 22rpx;
  width: min(340rpx, 42%);
  max-height: 54%;
  background: rgba(248, 244, 233, 0.95);
  border: 2rpx solid #c82506;
  border-radius: 18rpx;
  padding: 22rpx;
  z-index: 10;
  box-shadow: 0 16rpx 36rpx rgba(200, 37, 6, 0.18);
}

.hotspot-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #e3cfb2;
}

.hotspot-popup-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--secondary);
  flex: 1;
}

.hotspot-popup-close {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--secondary);
  font-size: 36rpx;
  line-height: 1;
  padding: 0;
  margin-left: 10rpx;
}

.hotspot-popup-body {
  font-size: 25rpx;
  color: #5e4530;
  line-height: 1.6;
}

.panorama-wrapper {
  position: relative;
  z-index: 2;
  min-height: 700rpx;
}

.panorama-image {
  width: 100%;
  height: 700rpx;
}

.panorama-overlay {
  position: absolute;
  left: 22rpx;
  bottom: 22rpx;
}

.panorama-label {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  font-size: 18rpx;
  color: #f7ebd5;
  background: rgba(44, 24, 10, 0.7);
  letter-spacing: 2rpx;
}

.mode-switch {
  display: flex;
  gap: 14rpx;
}

.mode-btn {
  flex: 1;
  padding: 22rpx 14rpx;
  border-radius: 18rpx;
  border: 1rpx solid #d0b590;
  background: #f8efde;
  color: #69452b;
  font-size: 27rpx;
  box-shadow: 0 8rpx 20rpx rgba(92, 61, 32, 0.06);
}

.mode-btn.active {
  background: #7f4c2a;
  border-color: #7f4c2a;
  color: #fff7eb;
}

.mode-btn[disabled] {
  opacity: 0.55;
}

.meta-card,
.guide-card {
  background: #fff9ef;
  border: 1rpx solid #dfc9aa;
  border-radius: 22rpx;
  padding: 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(85, 58, 31, 0.05);
}

.meta-title,
.guide-title {
  display: block;
  margin-bottom: 12rpx;
  font-size: 32rpx;
  color: #3f2818;
  font-weight: 700;
}

.meta-line {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #5e4530;
  line-height: 1.6;
}

.guide-empty {
  font-size: 26rpx;
  color: #866a52;
}

.guide-item {
  margin-top: 12rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e3cfb2;
  background: #fdf5e8;
}

.guide-item.selected {
  border-color: #c82506;
  background: #f5e3ca;
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.15);
}

.guide-item-title {
  display: block;
  margin-bottom: 8rpx;
  font-size: 28rpx;
  color: #3f2a1a;
  font-weight: 600;
}

.guide-item-body {
  display: block;
  font-size: 25rpx;
  color: #6a4e3a;
  line-height: 1.55;
}

.back::after,
.mode-btn::after,
.hotspot-popup-close::after {
  border: none;
}

@media screen and (min-width: 768px) {
  .body {
    padding: 36rpx 32rpx 52rpx;
  }

  .viewer-stage {
    min-height: 820rpx;
  }

  .model-placeholder,
  .model-host-wrapper,
  .three-host,
  .panorama-wrapper,
  .panorama-image {
    min-height: 820rpx;
    height: 820rpx;
  }

  .placeholder-desc {
    width: 64%;
  }

  .hotspot-popup {
    width: 360rpx;
  }
}
</style>
