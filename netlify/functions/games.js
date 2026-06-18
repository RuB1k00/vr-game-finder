const { json, methodNotAllowed } = require('./_utils/http');
const { loadCatalog } = require('./_utils/store');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed(['GET']);
  try {
    const catalog = await loadCatalog();
    return json(200, catalog);
  } catch (error) {
    return json(500, { error: 'Не удалось загрузить каталог игр.', detail: error.message });
  }
};
