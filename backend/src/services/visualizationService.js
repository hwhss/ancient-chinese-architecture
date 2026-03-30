const {
  getBuildings,
  getBuildingProfiles
} = require('../repositories/dataRepository');

function toNumberOrNull(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toSafeText(value, fallback = 'unknown') {
  const text = String(value || '').trim();
  return text || fallback;
}

function hasViewableModel(profile) {
  const model3d = profile && profile.model3d ? profile.model3d : null;
  if (!model3d) {
    return false;
  }

  const status = String(model3d.status || '').toLowerCase();
  if (status !== 'ready' && status !== 'demo') {
    return false;
  }

  if (model3d.modelUrl) {
    return true;
  }

  if (!Array.isArray(model3d.versions)) {
    return false;
  }

  return model3d.versions.some((item) => item && item.modelUrl);
}

function getPrimaryModelMeta(profile) {
  const model3d = profile && profile.model3d ? profile.model3d : null;
  if (!model3d) {
    return {
      status: 'none',
      viewerType: 'model-viewer',
      modelUrl: '',
      poster: ''
    };
  }

  const versions = Array.isArray(model3d.versions) ? model3d.versions : [];
  const firstWithUrl = versions.find((item) => item && item.modelUrl);

  return {
    status: String(model3d.status || 'none'),
    viewerType: String(model3d.viewerType || 'model-viewer'),
    modelUrl: String((model3d.modelUrl || (firstWithUrl && firstWithUrl.modelUrl) || '')).trim(),
    poster: String(model3d.poster || '').trim()
  };
}

function getEraBucket(mainEraStart) {
  const year = toNumberOrNull(mainEraStart);
  if (year === null) {
    return 'unknown';
  }

  if (year < 220) {
    return '秦汉以前';
  }
  if (year < 589) {
    return '魏晋南北朝';
  }
  if (year < 907) {
    return '隋唐';
  }
  if (year < 1271) {
    return '宋辽金夏';
  }
  if (year < 1368) {
    return '元';
  }
  if (year < 1644) {
    return '明';
  }
  if (year < 1912) {
    return '清';
  }
  return '近现代';
}

function tallyBy(items, resolver) {
  const map = new Map();

  items.forEach((item) => {
    const key = resolver(item);
    map.set(key, (map.get(key) || 0) + 1);
  });

  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key)));
}

function toRatioItems(items, total) {
  const base = Number(total) || 0;
  return items.map((item) => ({
    ...item,
    ratio: base > 0 ? Number((item.count / base).toFixed(4)) : 0
  }));
}

function buildChartPayload(title, items, unit = '座') {
  return {
    title,
    unit,
    xAxis: items.map((item) => item.key),
    series: [
      {
        name: title,
        type: 'bar',
        data: items.map((item) => item.count)
      }
    ],
    legend: [title],
    tooltip: true
  };
}

function buildInfographicPayload(events) {
  const nodes = events.map((event) => ({
    id: event.id,
    name: event.buildingName,
    desc: event.yearLabel,
    meta: {
      category: event.category,
      eraBucket: event.eraBucket,
      region: event.region
    }
  }));

  const edges = [];
  for (let i = 1; i < events.length; i += 1) {
    edges.push({
      source: events[i - 1].id,
      target: events[i].id,
      relation: 'time-next'
    });
  }

  return {
    type: 'infographic',
    title: '古建筑时间信息图',
    layout: 'vertical',
    nodes,
    edges,
    labels: ['年代', '建筑', '区域'],
    links: events.map((event) => ({
      nodeId: event.id,
      url: `/pages/detail/detail?id=${event.buildingId}`
    }))
  };
}

function normalizeFilters(query = {}) {
  const category = String(query.category || 'all').trim().toLowerCase();
  const region = String(query.region || query.province || '').trim();
  const city = String(query.city || '').trim();
  const eraStart = toNumberOrNull(query.eraStart);
  const eraEnd = toNumberOrNull(query.eraEnd);

  return {
    category,
    region,
    city,
    eraStart,
    eraEnd
  };
}

function matchFilters(item, filters) {
  if (filters.category && filters.category !== 'all' && String(item.category || '').toLowerCase() !== filters.category) {
    return false;
  }

  if (filters.region) {
    const province = String(item.province || '').trim();
    const location = String(item.location || '').trim();
    if (province !== filters.region && !location.includes(filters.region)) {
      return false;
    }
  }

  if (filters.city && String(item.city || '').trim() !== filters.city) {
    return false;
  }

  const year = toNumberOrNull(item.mainEraStart);
  if (filters.eraStart !== null && (year === null || year < filters.eraStart)) {
    return false;
  }
  if (filters.eraEnd !== null && (year === null || year > filters.eraEnd)) {
    return false;
  }

  return true;
}

async function getVisualizationTimeline(query = {}) {
  const buildings = await getBuildings();
  const filters = normalizeFilters(query);
  const source = Array.isArray(buildings) ? buildings : [];
  const list = source.filter((item) => matchFilters(item, filters));

  const events = list
    .map((item) => {
      const year = toNumberOrNull(item.mainEraStart);
      return {
        id: `${item.id}:${year !== null ? year : 'unknown'}`,
        buildingId: item.id,
        buildingName: item.name,
        year,
        yearLabel: year === null ? '未知年代' : `${year}`,
        category: toSafeText(item.category),
        eraBucket: getEraBucket(item.mainEraStart),
        region: toSafeText(item.province),
        title: `${item.name} 建造时期`,
        description: item.description || ''
      };
    })
    .sort((a, b) => {
      if (a.year === null && b.year === null) {
        return 0;
      }
      if (a.year === null) {
        return 1;
      }
      if (b.year === null) {
        return -1;
      }
      return a.year - b.year;
    });

  return {
    type: 'timeline',
    filters,
    timeline: events,
    infographic: buildInfographicPayload(events),
    distributions: {
      byEraBucket: tallyBy(list, (item) => getEraBucket(item.mainEraStart)),
      byCategory: tallyBy(list, (item) => toSafeText(item.category))
    },
    meta: {
      totalBuildings: source.length,
      matchedBuildings: list.length,
      totalEvents: events.length
    },
    updatedAt: new Date().toISOString()
  };
}

async function getVisualizationStats(query = {}) {
  const buildings = await getBuildings();
  const filters = normalizeFilters(query);
  const source = Array.isArray(buildings) ? buildings : [];
  const list = source.filter((item) => matchFilters(item, filters));
  const dimension = String(query.dimension || 'category').trim();

  let rawItems;
  if (dimension === 'era') {
    rawItems = tallyBy(list, (item) => getEraBucket(item.mainEraStart));
  } else if (dimension === 'region') {
    rawItems = tallyBy(list, (item) => toSafeText(item.province));
  } else if (dimension === 'heritageLevel') {
    rawItems = tallyBy(list, (item) => toSafeText(item.heritageLevel));
  } else if (dimension === 'openStatus') {
    rawItems = tallyBy(list, (item) => toSafeText(item.openStatus));
  } else {
    rawItems = tallyBy(list, (item) => toSafeText(item.category));
  }

  return {
    type: 'chart',
    filters,
    dimension,
    items: toRatioItems(rawItems, list.length),
    chart: buildChartPayload(`古建筑统计-${dimension}`, rawItems),
    meta: {
      totalBuildings: source.length,
      matchedBuildings: list.length
    },
    updatedAt: new Date().toISOString()
  };
}

async function getVisualizationOverview() {
  const [buildings, profiles] = await Promise.all([
    getBuildings(),
    getBuildingProfiles()
  ]);

  const profileMap = new Map((profiles || []).map((item) => [item.id, item]));
  const list = Array.isArray(buildings) ? buildings : [];

  const withCoordinates = list.filter((item) => {
    const lat = toNumberOrNull(item.lat);
    const lng = toNumberOrNull(item.lng);
    return lat !== null && lng !== null;
  });

  const with3d = list.filter((item) => hasViewableModel(profileMap.get(item.id)));

  return {
    type: 'overview',
    summary: {
      totalBuildings: list.length,
      withCoordinates: withCoordinates.length,
      with3d: with3d.length,
      coverageRatio: list.length ? Number((withCoordinates.length / list.length).toFixed(4)) : 0
    },
    distributions: {
      byCategory: tallyBy(list, (item) => toSafeText(item.category)),
      byRegion: tallyBy(list, (item) => toSafeText(item.province)),
      byHeritageLevel: tallyBy(list, (item) => toSafeText(item.heritageLevel)),
      byEraBucket: tallyBy(list, (item) => getEraBucket(item.mainEraStart))
    },
    kpis: [
      { key: 'totalBuildings', label: '建筑总数', value: list.length, unit: '座' },
      { key: 'withCoordinates', label: '可定位建筑', value: withCoordinates.length, unit: '座' },
      { key: 'with3d', label: '可3D浏览', value: with3d.length, unit: '座' },
      { key: 'coverageRatio', label: '定位覆盖率', value: list.length ? Number((withCoordinates.length / list.length).toFixed(4)) : 0, unit: 'ratio' }
    ],
    updatedAt: new Date().toISOString()
  };
}

async function getVisualizationMapPoints() {
  const [buildings, profiles] = await Promise.all([
    getBuildings(),
    getBuildingProfiles()
  ]);

  const profileMap = new Map((profiles || []).map((item) => [item.id, item]));
  const source = Array.isArray(buildings) ? buildings : [];

  const points = source
    .map((item) => {
      const lat = toNumberOrNull(item.lat);
      const lng = toNumberOrNull(item.lng);

      if (lat === null || lng === null) {
        return null;
      }

      const profile = profileMap.get(item.id) || {};
      const model3d = profile.model3d || {};
      const primaryModel = getPrimaryModelMeta(profile);

      return {
        id: item.id,
        name: item.name,
        category: toSafeText(item.category),
        location: item.location || '',
        province: toSafeText(item.province),
        city: toSafeText(item.city),
        coordinates: { lat, lng },
        heritageLevel: toSafeText(item.heritageLevel),
        openStatus: toSafeText(item.openStatus),
        mainEra: {
          start: toNumberOrNull(item.mainEraStart),
          end: toNumberOrNull(item.mainEraEnd)
        },
        model3dStatus: toSafeText(model3d.status, 'none'),
        has3d: hasViewableModel(profile),
        model3d: primaryModel
      };
    })
    .filter(Boolean);

  return {
    type: 'map-points',
    points,
    markers: points,
    geoJson: {
      type: 'FeatureCollection',
      features: points.map((item) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [item.coordinates.lng, item.coordinates.lat]
        },
        properties: {
          id: item.id,
          name: item.name,
          category: item.category,
          location: item.location,
          province: item.province,
          city: item.city,
          heritageLevel: item.heritageLevel,
          openStatus: item.openStatus,
          model3dStatus: item.model3dStatus,
          has3d: item.has3d
        }
      }))
    },
    meta: {
      totalBuildings: source.length,
      returnedPoints: points.length,
      missingCoordinates: source.length - points.length
    },
    updatedAt: new Date().toISOString()
  };
}

module.exports = {
  getVisualizationOverview,
  getVisualizationMapPoints,
  getVisualizationTimeline,
  getVisualizationStats
};
