<template>
  <view 
    class="building-card card-ink" 
    :class="{ 'visible': visible }"
    @click="handleClick"
  >
    <view class="card-image-wrapper">
      <view 
        class="card-image" 
        :style="{ backgroundImage: 'url(' + building.image + ')' }"
      ></view>
      <view class="card-image-overlay"></view>
    </view>
    <view class="card-content">
      <text class="card-name">{{ building.name }}</text>
      <text class="card-desc">{{ truncatedDesc }}</text>
      <view class="card-tags" v-if="building.tags && building.tags.length">
        <text 
          v-for="(tag, index) in displayTags" 
          :key="index" 
          class="card-tag"
        >{{ tag }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'BuildingCard',
  props: {
    building: {
      type: Object,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    maxDescLength: {
      type: Number,
      default: 40
    },
    maxTags: {
      type: Number,
      default: 2
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const truncatedDesc = computed(() => {
      const desc = props.building.description || ''
      if (desc.length <= props.maxDescLength) return desc
      return desc.substring(0, props.maxDescLength) + '...'
    })

    const displayTags = computed(() => {
      if (!props.building.tags) return []
      return props.building.tags.slice(0, props.maxTags)
    })

    const handleClick = () => {
      emit('click', props.building)
    }

    return {
      truncatedDesc,
      displayTags,
      handleClick
    }
  }
}
</script>

<style scoped>
.building-card {
  background: linear-gradient(135deg, #fff 0%, #faf6ed 100%);
  border-radius: 20rpx;
  overflow: hidden;
  border: 1rpx solid var(--bg-tertiary);
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(30rpx);
}

.building-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.building-card:active {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.15);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.building-card:hover .card-image {
  transform: scale(1.08);
}

.card-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
  pointer-events: none;
}

.card-content {
  padding: 24rpx;
}

.card-name {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12rpx;
  display: block;
}

.card-desc {
  font-size: 24rpx;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 16rpx;
  display: block;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.card-tag {
  font-size: 22rpx;
  color: var(--text-tertiary);
  background: rgba(232, 220, 200, 0.5);
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

/* 卡片水墨效果 */
.card-ink {
  position: relative;
}

.card-ink::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(200, 37, 6, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(139, 69, 19, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
}
</style>
