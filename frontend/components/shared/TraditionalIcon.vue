<template>
  <view class="traditional-icon" :style="{ width: size + 'rpx', height: size + 'rpx' }">
    <svg v-if="name === 'map'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M10,20 L40,10 L60,20 L90,10 L90,80 L60,90 L40,80 L10,90 Z" fill="none" stroke="currentColor" stroke-width="4" />
      <line x1="40" y1="10" x2="40" y2="80" stroke="currentColor" stroke-width="2" stroke-dasharray="4,4" />
      <line x1="60" y1="20" x2="60" y2="90" stroke="currentColor" stroke-width="2" stroke-dasharray="4,4" />
    </svg>
    
    <svg v-else-if="name === 'chat'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M10,50 Q10,20 50,20 Q90,20 90,50 Q90,80 50,80 Q40,80 30,90 L30,80 Q10,80 10,50 Z" fill="none" stroke="currentColor" stroke-width="4" />
      <circle cx="35" cy="50" r="4" fill="currentColor" />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
      <circle cx="65" cy="50" r="4" fill="currentColor" />
    </svg>

    <svg v-else-if="name === 'palace'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M10,80 L90,80 M20,80 L20,60 L80,60 L80,80 M30,60 L30,45 L70,45 L70,60 M15,45 Q50,20 85,45 Z" fill="none" stroke="currentColor" stroke-width="4" />
      <path d="M25,45 Q50,30 75,45 Z" fill="currentColor" opacity="0.3" />
    </svg>

    <svg v-else-if="name === 'garden'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M50,80 L50,60 M30,60 Q50,20 70,60 Q50,40 30,60 Z M20,80 Q50,70 80,80" fill="none" stroke="currentColor" stroke-width="4" />
      <circle cx="40" cy="40" r="15" fill="currentColor" opacity="0.2" />
    </svg>

    <svg v-else-if="name === 'bridge'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M10,80 Q50,20 90,80 M10,85 L90,85" fill="none" stroke="currentColor" stroke-width="4" />
      <path d="M30,80 L30,65 M50,80 L50,55 M70,80 L70,65" stroke="currentColor" stroke-width="2" />
    </svg>

    <svg v-else-if="name === 'defense'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M20,80 L20,40 L30,40 L30,30 L40,30 L40,40 L50,40 L50,30 L60,30 L60,40 L70,40 L70,30 L80,30 L80,80 Z" fill="none" stroke="currentColor" stroke-width="4" />
      <rect x="45" y="60" width="10" height="20" rx="5" stroke="currentColor" stroke-width="2" />
    </svg>

    <svg v-else-if="name === 'favorites'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M50,10 L61,38 L90,38 L67,56 L76,85 L50,67 L24,85 L33,56 L10,38 L39,38 Z" fill="none" stroke="currentColor" stroke-width="4" />
    </svg>

    <svg v-else-if="name === 'settings'" viewBox="0 0 100 100" class="svg-icon">
      <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" stroke-width="4" />
      <path d="M50,10 L50,25 M50,75 L50,90 M10,50 L25,50 M75,50 L90,50 M22,22 L33,33 M67,67 L78,78 M22,78 L33,67 M67,33 L78,22" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
    </svg>
    
    <svg v-else-if="name === 'arrow-right'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M30,20 L70,50 L30,80" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

    <svg v-else-if="name === 'location'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M50,10 Q20,10 20,45 Q20,80 50,90 Q80,80 80,45 Q80,10 50,10 Z" fill="none" stroke="currentColor" stroke-width="4" />
      <circle cx="50" cy="40" r="8" fill="currentColor" />
    </svg>

    <svg v-else-if="name === 'share'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M50,80 L50,20 M30,40 L50,20 L70,40 M20,60 L20,90 L80,90 L80,60" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    
    <svg v-else-if="name === 'view'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M10,50 Q50,10 90,50 Q50,90 10,50 Z" fill="none" stroke="currentColor" stroke-width="4" />
      <circle cx="50" cy="50" r="12" fill="currentColor" opacity="0.4" />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
    </svg>

    <svg v-else-if="name === 'tower'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M30,90 L70,90 M35,90 L35,70 L65,70 L65,90 M40,70 L40,55 L60,55 L60,70 M45,55 L45,45 L55,45 L55,55 M25,75 Q50,60 75,75 M30,55 Q50,40 70,55 M35,45 Q50,30 65,45" fill="none" stroke="currentColor" stroke-width="4" />
    </svg>

    <svg v-else-if="name === 'arrow-left'" viewBox="0 0 100 100" class="svg-icon" style="transform: rotate(180deg);">
      <path d="M30,20 L70,50 L30,80" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

    <svg v-else-if="name === 'close'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M25,25 L75,75 M75,25 L25,75" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
    </svg>

    <svg v-else-if="name === 'search'" viewBox="0 0 100 100" class="svg-icon">
      <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" stroke-width="5" />
      <path d="M62,62 L90,90" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
    </svg>

    <svg v-else-if="name === 'home'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M10,90 L10,50 L50,15 L90,50 L90,90 Z" fill="none" stroke="currentColor" stroke-width="4" />
      <path d="M40,90 L40,65 L60,65 L60,90" stroke="currentColor" stroke-width="4" />
    </svg>

    <svg v-else-if="name === 'trash'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M20,25 L80,25 M30,25 L35,85 L65,85 L70,25 M40,25 L40,15 L60,15 L60,25" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <line x1="42" y1="40" x2="45" y2="70" stroke="currentColor" stroke-width="2" />
      <line x1="58" y1="40" x2="55" y2="70" stroke="currentColor" stroke-width="2" />
    </svg>

    <svg v-else-if="name === 'notification'" viewBox="0 0 100 100" class="svg-icon">
      <path d="M50,15 Q30,15 30,50 L25,75 L75,75 L70,50 Q70,15 50,15 Z" fill="none" stroke="currentColor" stroke-width="4" />
      <path d="M42,75 Q50,85 58,75" fill="none" stroke="currentColor" stroke-width="4" />
      <circle cx="50" cy="12" r="3" fill="currentColor" />
    </svg>

    <svg v-else-if="name === 'privacy'" viewBox="0 0 100 100" class="svg-icon">
      <rect x="25" y="45" width="50" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="4" />
      <path d="M35,45 L35,30 Q35,15 50,15 Q65,15 65,30 L65,45" fill="none" stroke="currentColor" stroke-width="4" />
      <circle cx="50" cy="65" r="5" fill="currentColor" />
    </svg>

    <svg v-else-if="name === 'agreement'" viewBox="0 0 100 100" class="svg-icon">
      <rect x="25" y="15" width="50" height="70" rx="4" fill="none" stroke="currentColor" stroke-width="4" />
      <line x1="35" y1="35" x2="65" y2="35" stroke="currentColor" stroke-width="2" />
      <line x1="35" y1="50" x2="65" y2="50" stroke="currentColor" stroke-width="2" />
      <line x1="35" y1="65" x2="55" y2="65" stroke="currentColor" stroke-width="2" />
    </svg>
  </view>
</template>

<script>
export default {
  name: 'TraditionalIcon',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 48
    }
  }
}
</script>

<style scoped>
.traditional-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.svg-icon {
  width: 100%;
  height: 100%;
}
</style>
