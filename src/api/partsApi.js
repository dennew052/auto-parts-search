/**
 * API-клиент для работы с веб-сервисом Проценки (Фаворит Моторс / Favorit Parts).
 * Документация: https://lk.favorit-parts.ru/static/wsprice.pdf
 */

export const DEFAULT_API_KEY = '00000000-0000-0000-0000-000000000001';

const DIRECT_API_URL = 'http://api.favorit-parts.ru/hs/hsprice/';
const PROXY_API_URL = '/api/hsprice/';

/**
 * Выполнить GET-запрос к API с автоматическим резервным переключением (Vite Proxy <-> Direct API)
 */
async function fetchApi(params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  }

  const queryString = query.toString();
  
  // В режиме разработки с Vite используем прокси для избежания проблем с mixed-content/CORS,
  // при этом всегда имеем прямой fallback на http://api.favorit-parts.ru/hs/hsprice/
  const urls = [
    `${PROXY_API_URL}?${queryString}`,
    `${DIRECT_API_URL}?${queryString}`
  ];

  let lastError = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Проверка на ошибку от самого API (например: { error: "Empty key!" })
      if (data && data.error) {
        const errorMap = {
          'Empty key!': 'Не указан ключ покупателя (API key).',
          'Invalid key client!': 'Неверный ключ покупателя, клиент не найден в системе.',
          'Empty number goods!': 'Не указан артикул (номер) детали.',
          'Request quota exceeded!': 'Превышен лимит запросов по грузовому ассортименту.'
        };
        const message = errorMap[data.error] || `Ошибка API: ${data.error}`;
        throw new Error(message);
      }

      return data;
    } catch (err) {
      lastError = err;
      // Если это ошибка парсинга или бизнес-ошибка API (throw new Error выше), не нужно продолжать со вторым URL
      if (err.message && (err.message.startsWith('Ошибка API') || err.message.startsWith('Не указан') || err.message.startsWith('Неверный ключ'))) {
        throw err;
      }
      // Иначе (сетевой сбой прокси) пробуем следующий URL
    }
  }

  throw lastError || new Error('Не удалось связаться с сервером API');
}

/**
 * Проверка, является ли ответ API признаком "деталь не найдена".
 * Согласно документации:
 * "Если товар не найден в базе, то возвращается массив с одним элементом в виде пустой структуры ответа"
 * goods: [{ brand: "", goodsID: "00000000-0000-0000-0000-000000000000", ... }]
 */
export function isGoodsNotFound(goods) {
  if (!goods || !Array.isArray(goods) || goods.length === 0) {
    return true;
  }
  if (
    goods.length === 1 &&
    (!goods[0].brand || goods[0].brand.trim() === '') &&
    (!goods[0].number || goods[0].number.trim() === '') &&
    goods[0].goodsID === '00000000-0000-0000-0000-000000000000'
  ) {
    return true;
  }
  return false;
}

/**
 * Вычисляет минимальную актуальную цену позиции из массива складов.
 * По документации цена на складе приоритетнее общего поля price.
 */
export function calculateItemPrice(item) {
  if (item.warehouses && Array.isArray(item.warehouses) && item.warehouses.length > 0) {
    const prices = item.warehouses
      .map(w => Number(w.price))
      .filter(p => !isNaN(p) && p > 0);
    if (prices.length > 0) {
      return Math.min(...prices);
    }
  }
  return Number(item.price) || 0;
}

/**
 * Вычисляет суммарный остаток на складах
 */
export function calculateTotalStock(item) {
  if (item.warehouses && Array.isArray(item.warehouses) && item.warehouses.length > 0) {
    const totalFromWarehouses = item.warehouses.reduce((acc, w) => acc + (Number(w.stock) || 0), 0);
    if (totalFromWarehouses > 0) {
      return totalFromWarehouses;
    }
  }
  return Number(item.count) || 0;
}

/**
 * ЭТАП 1: Поиск производителей по артикулу (номеру) детали
 * @param {string} number - Артикул детали
 * @param {string} [key] - Ключ покупателя
 */
export async function getManufacturersByNumber(number, key = DEFAULT_API_KEY) {
  const cleanNumber = String(number).trim();
  if (!cleanNumber) {
    throw new Error('Введите артикул детали для поиска');
  }

  const data = await fetchApi({
    key: key || DEFAULT_API_KEY,
    number: cleanNumber
  });

  const goods = data.goods || [];

  if (isGoodsNotFound(goods)) {
    return [];
  }

  // Группируем полученные товары по производителю (бренду)
  const brandsMap = new Map();

  goods.forEach(item => {
    const brandName = item.brand ? item.brand.trim() : 'Без бренда';
    if (!brandName) return;

    const existing = brandsMap.get(brandName);
    const itemStock = calculateTotalStock(item);
    const itemPrice = calculateItemPrice(item);

    if (existing) {
      existing.totalCount += itemStock;
      existing.itemsCount += 1;
      if (itemPrice > 0 && (existing.minPrice === 0 || itemPrice < existing.minPrice)) {
        existing.minPrice = itemPrice;
      }
      if (!existing.sampleName && item.name) {
        existing.sampleName = item.name;
      }
    } else {
      brandsMap.set(brandName, {
        brand: brandName,
        number: item.number || cleanNumber,
        sampleName: item.name || 'Деталь ' + cleanNumber,
        totalCount: itemStock,
        itemsCount: 1,
        minPrice: itemPrice,
        goodsID: item.goodsID
      });
    }
  });

  return Array.from(brandsMap.values()).sort((a, b) => {
    // Сортировка: сначала бренды с товаром в наличии, затем по алфавиту
    if (a.totalCount > 0 && b.totalCount === 0) return -1;
    if (a.totalCount === 0 && b.totalCount > 0) return 1;
    return a.brand.localeCompare(b.brand);
  });
}

/**
 * ЭТАП 2: Получение предложений и аналогов по артикулу и выбранному производителю
 * @param {string} number - Артикул детали
 * @param {string} brand - Выбранный бренд
 * @param {string} [key] - Ключ покупателя
 */
export async function getOffersAndAnalogues(number, brand, key = DEFAULT_API_KEY) {
  const cleanNumber = String(number).trim();
  const cleanBrand = String(brand).trim();

  if (!cleanNumber) {
    throw new Error('Не указан артикул детали');
  }
  if (!cleanBrand) {
    throw new Error('Не выбран производитель детали');
  }

  const data = await fetchApi({
    key: key || DEFAULT_API_KEY,
    number: cleanNumber,
    brand: cleanBrand,
    analogues: 'on'
  });

  const rawGoods = data.goods || [];

  if (isGoodsNotFound(rawGoods)) {
    return [];
  }

  const offers = [];

  rawGoods.forEach((item, index) => {
    // Основная деталь (запрошенный бренд)
    const originalPrice = calculateItemPrice(item);
    const originalStock = calculateTotalStock(item);

    offers.push({
      id: item.goodsID || `requested-${index}`,
      goodsID: item.goodsID,
      brand: item.brand || cleanBrand,
      number: item.number || cleanNumber,
      name: item.name || 'Без названия',
      price: originalPrice,
      count: originalStock,
      warehouses: item.warehouses || [],
      rate: item.rate || 1,
      isAnalogue: false,
      isRequestedBrand: (item.brand || '').toUpperCase() === cleanBrand.toUpperCase(),
      notRefund: !!item.notRefund
    });

    // Аналоги детали
    if (item.analogues && Array.isArray(item.analogues)) {
      item.analogues.forEach((analogue, aIndex) => {
        const aPrice = calculateItemPrice(analogue);
        const aStock = calculateTotalStock(analogue);

        offers.push({
          id: analogue.goodsID || `analogue-${index}-${aIndex}`,
          goodsID: analogue.goodsID,
          brand: analogue.brand || 'Неизвестный бренд',
          number: analogue.number || '',
          name: analogue.name || 'Аналог детали',
          price: aPrice,
          count: aStock,
          warehouses: analogue.warehouses || [],
          rate: analogue.rate || 1,
          isAnalogue: true,
          isRequestedBrand: false,
          notRefund: !!analogue.notRefund
        });
      });
    }
  });

  return offers;
}
