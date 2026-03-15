import { Store, SKU, DashboardStats, Insight, CategoryBreakdown, TrendData, StoreSkuData } from '@/types/dashboard';

// 20 stores with realistic revenue distribution (Pareto-like)
const rawStores: Omit<Store, 'revenueShare' | 'cumulativeShare'>[] = [
  { id: 's1', name: '南京西路旗舰店', region: '华东', revenue: 285000, orders: 3200, avgOrderValue: 89, topSku: '招牌牛肉面' },
  { id: 's2', name: '陆家嘴店', region: '华东', revenue: 242000, orders: 2800, avgOrderValue: 86, topSku: '红烧排骨饭' },
  { id: 's3', name: '三里屯店', region: '华北', revenue: 218000, orders: 2600, avgOrderValue: 84, topSku: '麻辣香锅' },
  { id: 's4', name: '天河城店', region: '华南', revenue: 195000, orders: 2400, avgOrderValue: 81, topSku: '招牌牛肉面' },
  { id: 's5', name: '春熙路店', region: '西南', revenue: 168000, orders: 2100, avgOrderValue: 80, topSku: '水煮鱼' },
  { id: 's6', name: '西湖店', region: '华东', revenue: 145000, orders: 1900, avgOrderValue: 76, topSku: '东坡肉' },
  { id: 's7', name: '国贸店', region: '华北', revenue: 132000, orders: 1700, avgOrderValue: 78, topSku: '宫保鸡丁' },
  { id: 's8', name: '珠江新城店', region: '华南', revenue: 118000, orders: 1500, avgOrderValue: 79, topSku: '白切鸡' },
  { id: 's9', name: '新街口店', region: '华东', revenue: 105000, orders: 1350, avgOrderValue: 78, topSku: '鸭血粉丝汤' },
  { id: 's10', name: '解放碑店', region: '西南', revenue: 92000, orders: 1200, avgOrderValue: 77, topSku: '麻辣香锅' },
  { id: 's11', name: '中山路店', region: '华东', revenue: 78000, orders: 1050, avgOrderValue: 74, topSku: '招牌牛肉面' },
  { id: 's12', name: '万达店', region: '华北', revenue: 65000, orders: 900, avgOrderValue: 72, topSku: '红烧排骨饭' },
  { id: 's13', name: '太古里店', region: '西南', revenue: 55000, orders: 780, avgOrderValue: 71, topSku: '水煮鱼' },
  { id: 's14', name: '世纪大道店', region: '华东', revenue: 48000, orders: 680, avgOrderValue: 71, topSku: '招牌牛肉面' },
  { id: 's15', name: '北京路店', region: '华南', revenue: 42000, orders: 600, avgOrderValue: 70, topSku: '白切鸡' },
  { id: 's16', name: '鼓楼店', region: '华东', revenue: 35000, orders: 510, avgOrderValue: 69, topSku: '鸭血粉丝汤' },
  { id: 's17', name: '文三路店', region: '华东', revenue: 28000, orders: 420, avgOrderValue: 67, topSku: '东坡肉' },
  { id: 's18', name: '五道口店', region: '华北', revenue: 22000, orders: 340, avgOrderValue: 65, topSku: '宫保鸡丁' },
  { id: 's19', name: '大学城店', region: '华南', revenue: 18000, orders: 300, avgOrderValue: 60, topSku: '蛋炒饭' },
  { id: 's20', name: '高新区店', region: '西南', revenue: 15000, orders: 260, avgOrderValue: 58, topSku: '蛋炒饭' },
];

const totalStoreRevenue = rawStores.reduce((sum, s) => sum + s.revenue, 0);

export const mockStores: Store[] = (() => {
  let cumulative = 0;
  return rawStores
    .sort((a, b) => b.revenue - a.revenue)
    .map(s => {
      const share = (s.revenue / totalStoreRevenue) * 100;
      cumulative += share;
      return { ...s, revenueShare: Math.round(share * 10) / 10, cumulativeShare: Math.round(cumulative * 10) / 10 };
    });
})();

// SKU data with Pareto distribution
const rawSkus: Omit<SKU, 'revenueShare' | 'cumulativeShare'>[] = [
  { id: 'sku1', name: '招牌牛肉面', category: '主食', price: 32, totalSales: 8500, totalRevenue: 272000, storeCount: 20 },
  { id: 'sku2', name: '麻辣香锅', category: '热菜', price: 52, totalSales: 4200, totalRevenue: 218400, storeCount: 18 },
  { id: 'sku3', name: '红烧排骨饭', category: '主食', price: 38, totalSales: 5100, totalRevenue: 193800, storeCount: 20 },
  { id: 'sku4', name: '水煮鱼', category: '热菜', price: 58, totalSales: 2800, totalRevenue: 162400, storeCount: 15 },
  { id: 'sku5', name: '宫保鸡丁', category: '热菜', price: 36, totalSales: 3900, totalRevenue: 140400, storeCount: 19 },
  { id: 'sku6', name: '东坡肉', category: '热菜', price: 48, totalSales: 2500, totalRevenue: 120000, storeCount: 12 },
  { id: 'sku7', name: '白切鸡', category: '凉菜', price: 42, totalSales: 2600, totalRevenue: 109200, storeCount: 14 },
  { id: 'sku8', name: '鸭血粉丝汤', category: '汤品', price: 26, totalSales: 3200, totalRevenue: 83200, storeCount: 16 },
  { id: 'sku9', name: '珍珠奶茶', category: '饮品', price: 16, totalSales: 4800, totalRevenue: 76800, storeCount: 20 },
  { id: 'sku10', name: '蛋炒饭', category: '主食', price: 18, totalSales: 3600, totalRevenue: 64800, storeCount: 20 },
  { id: 'sku11', name: '酸辣汤', category: '汤品', price: 22, totalSales: 2100, totalRevenue: 46200, storeCount: 18 },
  { id: 'sku12', name: '凉拌黄瓜', category: '凉菜', price: 14, totalSales: 2800, totalRevenue: 39200, storeCount: 20 },
  { id: 'sku13', name: '担担面', category: '主食', price: 24, totalSales: 1500, totalRevenue: 36000, storeCount: 15 },
  { id: 'sku14', name: '口水鸡', category: '凉菜', price: 30, totalSales: 1100, totalRevenue: 33000, storeCount: 12 },
  { id: 'sku15', name: '芒果布丁', category: '甜品', price: 18, totalSales: 1600, totalRevenue: 28800, storeCount: 16 },
  { id: 'sku16', name: '柠檬茶', category: '饮品', price: 14, totalSales: 1800, totalRevenue: 25200, storeCount: 18 },
  { id: 'sku17', name: '回锅肉', category: '热菜', price: 40, totalSales: 580, totalRevenue: 23200, storeCount: 10 },
  { id: 'sku18', name: '冰淇淋华夫饼', category: '甜品', price: 28, totalSales: 720, totalRevenue: 20160, storeCount: 8 },
  { id: 'sku19', name: '番茄蛋汤', category: '汤品', price: 16, totalSales: 1100, totalRevenue: 17600, storeCount: 17 },
  { id: 'sku20', name: '红豆沙', category: '甜品', price: 12, totalSales: 900, totalRevenue: 10800, storeCount: 14 },
];

const totalSkuRevenue = rawSkus.reduce((sum, s) => sum + s.totalRevenue, 0);

export const mockSkus: SKU[] = (() => {
  let cumulative = 0;
  return rawSkus
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .map(s => {
      const share = (s.totalRevenue / totalSkuRevenue) * 100;
      cumulative += share;
      return { ...s, revenueShare: Math.round(share * 10) / 10, cumulativeShare: Math.round(cumulative * 10) / 10 };
    });
})();

export const mockStats: DashboardStats = {
  totalStores: 20,
  totalSkus: 20,
  totalRevenue: totalStoreRevenue,
  totalOrders: rawStores.reduce((sum, s) => sum + s.orders, 0),
  avgOrderValue: Math.round(totalStoreRevenue / rawStores.reduce((sum, s) => sum + s.orders, 0)),
  top20StoresRevenueShare: (() => {
    const top4 = rawStores.sort((a, b) => b.revenue - a.revenue).slice(0, 4);
    return Math.round((top4.reduce((sum, s) => sum + s.revenue, 0) / totalStoreRevenue) * 1000) / 10;
  })(),
  top20SkusRevenueShare: (() => {
    const top4 = rawSkus.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 4);
    return Math.round((top4.reduce((sum, s) => sum + s.totalRevenue, 0) / totalSkuRevenue) * 1000) / 10;
  })(),
};

export const mockTrends: TrendData[] = [
  { date: '03/01', revenue: 62000, orders: 780 },
  { date: '03/02', revenue: 58000, orders: 720 },
  { date: '03/03', revenue: 71000, orders: 850 },
  { date: '03/04', revenue: 65000, orders: 790 },
  { date: '03/05', revenue: 74000, orders: 890 },
  { date: '03/06', revenue: 82000, orders: 960 },
  { date: '03/07', revenue: 89000, orders: 1020 },
  { date: '03/08', revenue: 68000, orders: 810 },
  { date: '03/09', revenue: 73000, orders: 870 },
  { date: '03/10', revenue: 79000, orders: 920 },
  { date: '03/11', revenue: 64000, orders: 770 },
  { date: '03/12', revenue: 85000, orders: 980 },
  { date: '03/13', revenue: 91000, orders: 1050 },
  { date: '03/14', revenue: 77000, orders: 900 },
  { date: '03/15', revenue: 83000, orders: 950 },
];

export const mockCategoryBreakdown: CategoryBreakdown[] = [
  { category: '热菜', revenue: 664400, percentage: 38.2, skuCount: 5 },
  { category: '主食', revenue: 566600, percentage: 32.6, skuCount: 4 },
  { category: '凉菜', revenue: 181400, percentage: 10.4, skuCount: 3 },
  { category: '汤品', revenue: 147000, percentage: 8.5, skuCount: 3 },
  { category: '饮品', revenue: 102000, percentage: 5.9, skuCount: 2 },
  { category: '甜品', revenue: 59760, percentage: 4.4, skuCount: 3 },
];

export const mockInsights: Insight[] = [
  {
    id: 'i1',
    type: 'warning',
    title: '门店收入集中度高',
    description: `前 20% 的门店（4家）贡献了 ${mockStats.top20StoresRevenueShare}% 的总收入，符合帕累托法则。建议关注尾部门店的经营状况。`,
    metric: `${mockStats.top20StoresRevenueShare}%`,
  },
  {
    id: 'i2',
    type: 'opportunity',
    title: 'SKU 优化空间',
    description: `前 20% 的 SKU（4个）贡献了 ${mockStats.top20SkusRevenueShare}% 的收入。可以考虑精简低效 SKU，集中资源推广高收入产品。`,
    metric: `${mockStats.top20SkusRevenueShare}%`,
  },
  {
    id: 'i3',
    type: 'opportunity',
    title: '招牌牛肉面是明星产品',
    description: '招牌牛肉面在所有 20 家门店均有销售，销量和收入均排名第一。建议加大推广力度，考虑推出衍生产品。',
    metric: '¥272,000',
  },
  {
    id: 'i4',
    type: 'info',
    title: '华东区域表现最佳',
    description: '华东区域 7 家门店贡献了最多收入，平均门店收入高于其他区域。可以将华东门店的运营经验推广到其他区域。',
  },
  {
    id: 'i5',
    type: 'warning',
    title: '甜品品类贡献偏低',
    description: '甜品品类仅占总收入的 4.4%，但有 3 个 SKU。建议评估是否需要优化甜品菜单或加强甜品营销。',
    metric: '4.4%',
  },
];

// Store-SKU cross data for detailed analysis
export const mockStoreSkuData: StoreSkuData[] = [
  { storeId: 's1', storeName: '南京西路旗舰店', skuId: 'sku1', skuName: '招牌牛肉面', quantity: 680, revenue: 21760 },
  { storeId: 's1', storeName: '南京西路旗舰店', skuId: 'sku2', skuName: '麻辣香锅', quantity: 420, revenue: 21840 },
  { storeId: 's1', storeName: '南京西路旗舰店', skuId: 'sku3', skuName: '红烧排骨饭', quantity: 510, revenue: 19380 },
  { storeId: 's2', storeName: '陆家嘴店', skuId: 'sku1', skuName: '招牌牛肉面', quantity: 580, revenue: 18560 },
  { storeId: 's2', storeName: '陆家嘴店', skuId: 'sku3', skuName: '红烧排骨饭', quantity: 480, revenue: 18240 },
  { storeId: 's3', storeName: '三里屯店', skuId: 'sku2', skuName: '麻辣香锅', quantity: 390, revenue: 20280 },
  { storeId: 's3', storeName: '三里屯店', skuId: 'sku4', skuName: '水煮鱼', quantity: 280, revenue: 16240 },
];
