# 中式交互动效使用指南

## 1. 墨水滴波纹效果

### 基础用法 - 给任意可点击元素添加波纹
```html
<!-- 简单波纹效果（居中扩散） -->
<button class="ink-ripple">点击我</button>

<!-- 按钮专用效果（更明显） -->
<button class="btn-ink">点击我</button>

<!-- 通用点击反馈（最轻量） -->
<view class="tap-feedback" @click="handleClick">点击区域</view>
```

### 效果说明
- `.ink-ripple`: 从中心扩散的墨水波纹，200%尺寸，0.5秒动画
- `.btn-ink`: 按钮专用，带背景色变化和缩放效果
- `.tap-feedback`: 轻量级，仅缩放+背景色变化

---

## 2. 毛笔书写动画

### 段落书写效果
```html
<!-- 在模板中 -->
<text class="brush-paragraph">这是一段会逐行滑入显示的文字</text>

<!-- 带延迟的多个段落 -->
<text class="brush-paragraph delay-1">第一段</text>
<text class="brush-paragraph delay-2">第二段</text>
<text class="brush-paragraph delay-3">第三段</text>
```

### 整行文字书写
```html
<view class="brush-write">
  <text class="brush-write-text">这行字会从左到右展开</text>
</view>
```

### 逐字显示
```html
<view class="brush-char-container">
  <text 
    v-for="(char, index) in chars" 
    :key="index"
    class="brush-char"
    :class="char.className"
    :style="{ animationDelay: char.delay + 's' }"
  >{{ char.char }}</text>
</view>
```

```javascript
import { splitTextForBrush } from '@/utils/animationHelper.js'

export default {
  data() {
    return {
      chars: []
    }
  },
  onReady() {
    // 将文字拆分为带延迟的字符数组
    this.chars = splitTextForBrush('毛笔书写效果', 0.2)
  }
}
```

---

## 3. 卡片墨水晕染

```html
<view class="card-ink" @click="handleClick">
  <image src="..." />
  <text>卡片内容</text>
</view>
```

效果：
- 悬停/点击时显示墨水晕染背景
- 点击时有轻微缩放反馈

---

## 4. 列表项滑入动画

### H5 端（自动触发）
```html
<view 
  v-for="(item, index) in list" 
  :key="item.id"
  class="list-item-ink"
  :class="'item-delay-' + (index + 1)"
>
  {{ item.name }}
</view>
```

### UniApp 全端兼容
```html
<view 
  v-for="(item, index) in animatedList" 
  :key="item.id"
  class="list-item-ink"
  :class="[item._animateClass, item._animateClassName]"
  :style="{ animationDelay: item._animateDelay + 'ms' }"
>
  {{ item.name }}
</view>
```

```javascript
import { withAnimationState, triggerItemAnimation } from '@/utils/animationHelper.js'

export default {
  data() {
    return {
      list: [],
      animatedList: []
    }
  },
  watch: {
    list: {
      handler(newVal) {
        this.animatedList = withAnimationState(newVal)
        // 依次触发动画
        this.animatedList.forEach((_, index) => {
          setTimeout(() => {
            triggerItemAnimation(this, 'animatedList', index)
          }, 100 + (index * 80))
        })
      },
      immediate: true
    }
  }
}
```

---

## 5. 延迟类参考

### 段落/列表延迟
```css
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }
.delay-5 { animation-delay: 0.5s; }
.delay-6 { animation-delay: 0.6s; }
```

### 列表项延迟
```css
.item-delay-1 { animation-delay: 0.05s; }
.item-delay-2 { animation-delay: 0.1s; }
.item-delay-3 { animation-delay: 0.15s; }
.item-delay-4 { animation-delay: 0.2s; }
.item-delay-5 { animation-delay: 0.25s; }
.item-delay-6 { animation-delay: 0.3s; }
```

### 字符延迟
```css
.char-delay-1 { animation-delay: 0.05s; }
.char-delay-2 { animation-delay: 0.1s; }
...
.char-delay-10 { animation-delay: 0.5s; }
```

---

## 6. 深色主题适配

所有效果都支持深色主题，会自动切换颜色：
- 浅色主题：棕褐色 (#8B4513)
- 深色主题：浅棕色 (#C4956A)

---

## 7. 性能优化

- 所有动画使用 `transform` 和 `opacity`（GPU 加速）
- 添加 `will-change` 提示浏览器优化
- 使用 `-webkit-transform` 兼容旧版浏览器
- 动画结束后自动清理

---

## 8. 快速测试

在任意页面添加以下代码测试效果：

```html
<template>
  <view class="test-container">
    <!-- 墨水滴波纹 -->
    <button class="ink-ripple" style="margin: 20rpx; padding: 30rpx;">
      点击看墨水滴效果
    </button>
    
    <!-- 毛笔书写 -->
    <text class="brush-paragraph" style="display: block; margin: 20rpx;">
      这段文字会滑入显示
    </text>
    
    <!-- 列表项 -->
    <view 
      v-for="i in 3" 
      :key="i"
      class="list-item-ink"
      :class="'item-delay-' + i"
      style="padding: 20rpx; margin: 10rpx; background: #f0e9d8;"
    >
      列表项 {{ i }}
    </view>
  </view>
</template>

<script>
export default {
  onReady() {
    // H5 端自动触发动画
    // #ifdef H5
    import('@/utils/animationHelper.js').then(({ initScrollAnimations }) => {
      initScrollAnimations()
    })
    // #endif
  }
}
</script>
```
