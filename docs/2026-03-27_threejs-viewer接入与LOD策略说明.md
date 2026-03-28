# three.js Viewer 接入与 LOD 策略说明

## 1. 当前落地结果

本次已在前端页面完成 three.js 基础渲染和 LOD 占位替换主链路，核心文件：

- `frontend/pages/viewer/viewer.vue`
- `frontend/services/model3dTokenManager.js`

页面当前行为：

1. 先拉取 `/api/buildings/:id/model3d/manifest`
2. model 模式下初始化 three.js（H5）
3. 若存在 `lod0ModelUrl`，优先加载 LOD0 占位模型
4. 延迟加载 `scene.entry`（签名高清模型）并替换
5. 若高清替换失败，保留 LOD0，避免白屏

## 2. 你需要继续对接的点（按优先级）

## 2.1 自动续期接入

目标：模型播放过程中 token 临近过期时自动刷新，避免资源 401/403。

对接位置建议：`frontend/pages/viewer/viewer.vue`

步骤：

1. 在 manifest 拉取成功后，创建 refresher：

```js
import { createModel3dTokenRefresher } from "../../services/model3dTokenManager";

this.tokenRefresher = createModel3dTokenRefresher(this.manifest, (result) => {
  // result: { shouldRefresh, signedUrl, expiresAt }
  // 将 scene.entry 更新为 result.signedUrl
  // 再触发高清资源替换逻辑
});
this.tokenRefresher.start();
```

2. 在页面卸载 `onUnload` 时执行 `this.tokenRefresher.stop()`。

3. 刷新成功后，将 `manifest.scene.entry` 与 `manifest.scene.expiresAt` 更新为新值。

## 2.2 懒加载高清资源替换

当前已实现：LOD0 → 高清一次替换。

你可继续增强为多级 LOD：

1. 读取 `manifest.scene.lod[]` 按 `level` 排序。
2. 先加载 `level=0`（占位）。
3. 视网络和设备能力决定是否继续加载 `level=1/2...`。
4. 每次替换都保留“旧模型兜底”直到新模型加载成功再切换。

建议策略：

- Wi-Fi / 4G：继续上探更高清 LOD
- 2G / 弱网：停留在 LOD0 或仅升级一次

## 2.3 弱网与过期降级

建议你补充三类降级：

1. 高清加载失败：保持 LOD0 + toast 提示
2. token 刷新失败：提示并进入 panorama 模式
3. repeated 失败：停止重试，防止无穷轮询

## 3. 关键代码作用说明

以下函数都在 `frontend/pages/viewer/viewer.vue`：

1. `resolveLodPlan()`

- 作用：从 `preload.lod0ModelUrl` 与 `scene.lod` 中计算 LOD0 和高清入口 URL。
- 价值：把“数据结构兼容”统一收敛在一处，避免加载流程到处写 if。

2. `loadLodPipeline()`

- 作用：执行 LOD0 先行、高清延迟替换的主状态机。
- 价值：首帧更快可见，高清资源在后台到达后无缝升级。

3. `loadMainModel(url, lodLevel)`

- 作用：加载 glTF，并在成功后替换当前场景模型。
- 价值：先加载成功再替换，避免替换失败造成黑屏。

4. `disposeObject3D(root)`

- 作用：释放旧模型 geometry/material，避免显存持续增长。
- 价值：长时间导览场景下保持内存稳定。

5. `clearHdTimer()` + `destroyThree()`

- 作用：清理延迟任务、动画帧、事件监听和渲染器。
- 价值：防止页面来回切换后出现重复渲染和资源泄漏。

## 4. 运行时状态含义

页面中的 `lodPhase`：

- `idle`：尚未开始
- `loading_lod0`：加载占位模型
- `lod0_ready`：占位可见
- `loading_hd`：加载高清模型中
- `hd_ready`：高清替换完成

价值：

1. 可直观判断用户当前体验阶段
2. 便于埋点统计（首帧时长、高清替换成功率）
3. 方便弱网策略分支判断

## 5. 推荐埋点指标（可选）

- `viewer_lod0_ready_ms`
- `viewer_hd_ready_ms`
- `viewer_hd_replace_fail_count`
- `viewer_token_refresh_fail_count`
- `viewer_fallback_to_panorama_count`

## 6. 一句话总结

当前 Viewer 已具备“快开（LOD0）+ 提质（高清替换）+ 不白屏（失败保底）”的核心能力；你后续接入自动续期与弱网降级后，就能形成完整的生产级 3D 播放链路。

## 7. 2026-03-28 后端修补结果与前端待对接

已完成后端修补：

1. `manifest.versions[]` 已改为最小暴露字段（不再返回裸 `modelUrl`），避免真实资源地址外泄。
2. Manifest 签名 URL 改为优先使用请求域名生成（`requestBaseUrl`），降低真机/代理环境下 `localhost` 不可达问题。
3. `scene.lod[]` 签名兼容 `modelUrl` 与 `url` 两种历史字段，输出统一为签名后的地址。

前端待对接项（本次不改代码）：

1. 在 `viewer.vue` 接入 `createModel3dTokenRefresher()`。
2. `onUnload` 时执行 `tokenRefresher.stop()`。
3. 续期成功后更新 `manifest.scene.entry` 和 `manifest.scene.expiresAt`，并复用现有高清替换逻辑。

相关规范：

- `docs/2026-03-28_3D资源签名链路强制规范.md`
