import re
import sys

def main():
    file_path = r"d:\GitWarehouse\web\ancient-chinese-architecture\frontend\pages\home\home.vue"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Template replacement
    template_pattern = r"(<!-- 顶部 Hero 区 - 简化版 -->).*?(?=<!-- 底部 Footer -->)"
    template_replacement = """<!-- 顶部 Hero 区 - 简化版 -->
      <HeroSection 
        :animation-state="sections.hero" 
        :favorite-count="favoriteCount"
        @go-to-map="goToMap"
        @go-to-chat="goToChat"
        @go-to-category="goToCategory"
        @go-to-favorites="goToFavorites"
        @go-to-settings="goToSettings"
      />
      
      <!-- 每日推荐区 -->
      <DailyBuilding 
        :visible="sections.daily"
        :building="dailyBuilding"
        :today-date="todayDate"
        :is-favorite="dailyBuilding ? isFavorite(dailyBuilding.id) : false"
        @click="goToDetail"
        @toggle-favorite="toggleFavorite"
        @share="shareDailyBuilding"
      />
      
      <!-- 精选古建预览区 -->
      <PreviewSection 
        :visible="sections.preview"
        :visible-cards="sections.previewCards"
        :buildings="previewBuildings"
        @go-to-detail="goToDetail"
      />

      <!-- 项目亮点区 -->
      <FeaturesSection 
        :visible="sections.features"
      />
      
      <!-- 古建小知识区 -->
      <KnowledgeSection 
        :visible="sections.knowledge"
        :items="knowledgeItems"
      />
      
      """
    content = re.sub(template_pattern, template_replacement, content, flags=re.DOTALL)

    # 2. Imports replacement
    import_pattern = r"import SkeletonScreen from .*?from \"../../utils/navigation\.js\";"
    import_replacement = """import SkeletonScreen from "../../components/SkeletonScreen.vue";
import HeroSection from "../../components/home/HeroSection.vue";
import DailyBuilding from "../../components/home/DailyBuilding.vue";
import PreviewSection from "../../components/home/PreviewSection.vue";
import FeaturesSection from "../../components/home/FeaturesSection.vue";
import KnowledgeSection from "../../components/home/KnowledgeSection.vue";
import { throttle } from "../../utils/lazyLoad.js";
import { recordPageLoad } from "../../utils/performance.js";
import { goToMap, goToChat, goToFavorites, goToSettings, goToDetail } from "../../utils/navigation.js";"""
    content = re.sub(import_pattern, import_replacement, content, flags=re.DOTALL)

    # 3. Components registration replacement
    components_pattern = r"components: \{[\s\S]*?\},"
    components_replacement = """components: {
    SkeletonScreen,
    HeroSection,
    DailyBuilding,
    PreviewSection,
    FeaturesSection,
    KnowledgeSection
  },"""
    content = re.sub(components_pattern, components_replacement, content)

    # 4. Remove onKnowledgeScroll method
    method_pattern = r"onKnowledgeScroll\(e\) \{[\s\S]*?\},"
    content = re.sub(method_pattern, "", content)

    # 5. CSS removal
    # Find start: /* Hero 区 */
    # Find end: /* Footer */
    css_pattern = r"/\* Hero 区 \*/[\s\S]*?(?=/\* Footer \*/)"
    content = re.sub(css_pattern, "", content)
    
    # Also remove common section styles section since they are moved to local scoped CSS
    common_css_pattern = r"/\* 通用区块样式 \*/[\s\S]*?(?=/\* ========== 每日推荐区 ========== \*/)"
    content = re.sub(common_css_pattern, "", content)

    # Note: Because the initial CSS cleanup might have matched too broadly or we have leftovers like "/* 响应式适配 */", 
    # letting it clear up from "/* Hero 区 */" to "/* Footer */" is actually perfect because they are continuous!
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Refactoring complete.")

if __name__ == "__main__":
    main()
