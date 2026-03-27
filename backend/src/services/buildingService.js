const {
  getBuildings,
  getBuildingById
} = require('../repositories/dataRepository');

function listBuildings(query = {}) {
  const allBuildings = getBuildings();
  const { category, q } = query;

  return allBuildings.filter((item) => {
    const categoryMatched = !category || category === 'all' || item.category === category;

    if (!categoryMatched) {
      return false;
    }

    if (!q) {
      return true;
    }

    const text = `${item.name} ${item.location} ${(item.tags || []).join(' ')} ${item.description}`.toLowerCase();
    return text.includes(String(q).toLowerCase());
  });
}

function getBuilding(id) {
  return getBuildingById(id);
}

module.exports = {
  listBuildings,
  getBuilding
};
