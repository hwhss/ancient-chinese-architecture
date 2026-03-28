/* eslint-disable no-console */

const path = require('path');
const { spawn } = require('child_process');

const backendDir = path.join(__dirname, '..');

const postgresPort = 9530;
const jsonPort = 9531;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startServer(dataSource, port) {
  const child = spawn('npm start', {
    cwd: backendDir,
    env: {
      ...process.env,
      DATA_SOURCE: dataSource,
      PORT: String(port)
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${dataSource}] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${dataSource}] ${chunk}`);
  });

  return child;
}

async function waitForHealth(baseUrl, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const resp = await fetch(`${baseUrl}/api/health`);
      if (resp.ok) {
        return;
      }
    } catch (error) {
      // keep polling
    }
    await sleep(500);
  }

  throw new Error(`Health check timeout: ${baseUrl}`);
}

async function getSummary(baseUrl) {
  const health = (await (await fetch(`${baseUrl}/api/health`)).json()).data;
  const buildings = (await (await fetch(`${baseUrl}/api/buildings`)).json()).data;
  const detail = (await (await fetch(`${baseUrl}/api/buildings/gugong_01`)).json()).data;
  const model = (await (await fetch(`${baseUrl}/api/buildings/gugong_01/model3d`)).json()).data;
  const manifest = (await (await fetch(`${baseUrl}/api/buildings/gugong_01/model3d/manifest`)).json()).data;
  const material = (await (await fetch(`${baseUrl}/api/material?materialId=gugong_01`)).json()).data;
  const knowledge = (await (await fetch(`${baseUrl}/api/knowledge`)).json()).data;

  return {
    health: {
      knowledge: health.datasets.knowledge,
      materials: health.datasets.materials,
      buildings: health.datasets.buildings
    },
    buildingsApiCount: buildings.length,
    modelVersionCount: Array.isArray(model.versions) ? model.versions.length : 0,
    manifestVersionCount: Array.isArray(manifest.versions) ? manifest.versions.length : 0,
    manifestLodCount: manifest.scene && Array.isArray(manifest.scene.lod) ? manifest.scene.lod.length : 0,
    manifestEntrySigned: /\/api\/assets\/signed\?token=/.test(String(manifest.scene && manifest.scene.entry ? manifest.scene.entry : '')),
    materialType: material.type,
    knowledgeApiCount: Array.isArray(knowledge) ? knowledge.length : 0,
    detail: {
      id: detail.id,
      name: detail.name,
      overviewSummary: detail.overview && detail.overview.summary ? detail.overview.summary : '',
      highlightsCount: Array.isArray(detail.architectureHighlights) ? detail.architectureHighlights.length : 0,
      modelStatus: detail.model3d ? detail.model3d.status : '',
      modelViewerType: detail.model3d ? detail.model3d.viewerType : ''
    }
  };
}

function compare(pg, json) {
  const checks = {
    healthKnowledgeEqual: pg.health.knowledge === json.health.knowledge,
    healthMaterialsEqual: pg.health.materials === json.health.materials,
    healthBuildingsEqual: pg.health.buildings === json.health.buildings,
    buildingsApiCountEqual: pg.buildingsApiCount === json.buildingsApiCount,
    modelVersionCountEqual: pg.modelVersionCount === json.modelVersionCount,
    manifestVersionCountEqual: pg.manifestVersionCount === json.manifestVersionCount,
    manifestLodCountEqual: pg.manifestLodCount === json.manifestLodCount,
    manifestSignedBoth: pg.manifestEntrySigned && json.manifestEntrySigned,
    materialTypeEqual: pg.materialType === json.materialType,
    knowledgeApiCountEqual: pg.knowledgeApiCount === json.knowledgeApiCount,
    detailIdEqual: pg.detail.id === json.detail.id,
    detailNameEqual: pg.detail.name === json.detail.name,
    detailOverviewEqual: pg.detail.overviewSummary === json.detail.overviewSummary,
    detailHighlightsCountEqual: pg.detail.highlightsCount === json.detail.highlightsCount,
    detailModelStatusEqual: pg.detail.modelStatus === json.detail.modelStatus,
    detailViewerTypeEqual: pg.detail.modelViewerType === json.detail.modelViewerType
  };

  const failed = Object.entries(checks).filter(([, ok]) => !ok);
  return { checks, failed };
}

function stopServer(child) {
  if (!child || child.killed) {
    return;
  }
  child.kill();
}

async function main() {
  const pgBase = `http://localhost:${postgresPort}`;
  const jsonBase = `http://localhost:${jsonPort}`;

  const pgServer = startServer('postgres', postgresPort);
  const jsonServer = startServer('json', jsonPort);

  try {
    await Promise.all([waitForHealth(pgBase), waitForHealth(jsonBase)]);

    const [pgSummary, jsonSummary] = await Promise.all([
      getSummary(pgBase),
      getSummary(jsonBase)
    ]);

    const result = compare(pgSummary, jsonSummary);

    console.log('\n=== PHASE3 SUMMARY (POSTGRES) ===');
    console.log(JSON.stringify(pgSummary, null, 2));
    console.log('\n=== PHASE3 SUMMARY (JSON) ===');
    console.log(JSON.stringify(jsonSummary, null, 2));
    console.log('\n=== PHASE3 CHECKS ===');
    console.log(JSON.stringify(result.checks, null, 2));

    if (result.failed.length) {
      console.error('\n[FAIL] Phase 3 compare failed:');
      result.failed.forEach(([name]) => console.error(`- ${name}`));
      process.exitCode = 1;
      return;
    }

    console.log('\n[SUCCESS] Phase 3 compare passed.');
  } finally {
    stopServer(pgServer);
    stopServer(jsonServer);
  }
}

main().catch((error) => {
  console.error('[ERROR] Phase 3 compare crashed:', error.message);
  process.exit(1);
});
