import { useEffect, useState } from 'react';

const workingDaysInPeriod = 26;
const workingDaysPerYear = 300;
const wasteAllowance = 0.05;

const materialCatalog = [
  { code: 'RM-01', name: 'Rubber/EVA outsole sheet', unit: 'sq.m', unitCost: 14, beginningQty: 293.3, received: 460.8, maxDailyUsage: 21.8, leadTimeDays: 14, orderCost: 60, holdingPct: 0.2 },
  { code: 'RM-02', name: 'Memory foam insole', unit: 'sq.m', unitCost: 11, beginningQty: 176.4, received: 226.8, maxDailyUsage: 13.1, leadTimeDays: 10, orderCost: 50, holdingPct: 0.2 },
  { code: 'RM-03', name: 'Fleece fabric', unit: 'm', unitCost: 4.5, beginningQty: 514.5, received: 771.8, maxDailyUsage: 38.2, leadTimeDays: 12, orderCost: 45, holdingPct: 0.2 },
  { code: 'RM-04', name: 'Terry cloth fabric', unit: 'm', unitCost: 3.8, beginningQty: 385.9, received: 551.2, maxDailyUsage: 28.6, leadTimeDays: 12, orderCost: 45, holdingPct: 0.2 },
  { code: 'RM-05', name: 'Knit sock fabric', unit: 'm', unitCost: 5.2, beginningQty: 220.5, received: 299.2, maxDailyUsage: 16.4, leadTimeDays: 14, orderCost: 45, holdingPct: 0.2 },
  { code: 'RM-06', name: 'PU / faux-leather strap', unit: 'm', unitCost: 3, beginningQty: 132.3, received: 207.9, maxDailyUsage: 9.8, leadTimeDays: 10, orderCost: 40, holdingPct: 0.2 },
  { code: 'RM-07', name: 'Non-woven lining', unit: 'm', unitCost: 1.8, beginningQty: 793.8, received: 1134, maxDailyUsage: 58.9, leadTimeDays: 7, orderCost: 35, holdingPct: 0.2 },
  { code: 'RM-08', name: 'Thread', unit: 'spool', unitCost: 1.2, beginningQty: 83.8, received: 119.7, maxDailyUsage: 6.2, leadTimeDays: 5, orderCost: 25, holdingPct: 0.2 },
  { code: 'RM-09', name: 'Adhesive / glue', unit: 'liter', unitCost: 7.5, beginningQty: 125.7, received: 107.7, maxDailyUsage: 9.3, leadTimeDays: 7, orderCost: 40, holdingPct: 0.2 },
  { code: 'RM-10', name: 'Box, polybag & hangtag set', unit: 'set', unitCost: 0.55, beginningQty: 4189.5, received: 6583.5, maxDailyUsage: 310.8, leadTimeDays: 10, orderCost: 50, holdingPct: 0.2 },
];

const styleDefinitions = [
  {
    style: 'Plush Fleece Bedroom',
    materials: {
      'Rubber/EVA outsole sheet': 0.07,
      'Memory foam insole': 0.04,
      'Fleece fabric': 0.35,
      'Non-woven lining': 0.2,
      Thread: 0.02,
      'Adhesive / glue': 0.03,
      'Box, polybag & hangtag set': 1,
    },
    laborPerPair: 1.2,
    overheadPerPair: 0.8,
    sellingPrice: 12,
  },
  {
    style: 'Terry Cloth Spa',
    materials: {
      'Rubber/EVA outsole sheet': 0.07,
      'Memory foam insole': 0.04,
      'Terry cloth fabric': 0.35,
      'Non-woven lining': 0.2,
      Thread: 0.02,
      'Adhesive / glue': 0.03,
      'Box, polybag & hangtag set': 1,
    },
    laborPerPair: 1.1,
    overheadPerPair: 0.75,
    sellingPrice: 10.5,
  },
  {
    style: 'Memory Foam Slide',
    materials: {
      'Rubber/EVA outsole sheet': 0.07,
      'Memory foam insole': 0.05,
      'PU / faux-leather strap': 0.15,
      'Non-woven lining': 0.15,
      Thread: 0.02,
      'Adhesive / glue': 0.03,
      'Box, polybag & hangtag set': 1,
    },
    laborPerPair: 1,
    overheadPerPair: 0.7,
    sellingPrice: 11,
  },
  {
    style: 'Knit Sock Slipper',
    materials: {
      'Rubber/EVA outsole sheet': 0.07,
      'Memory foam insole': 0.04,
      'Knit sock fabric': 0.3,
      'Non-woven lining': 0.2,
      Thread: 0.02,
      'Adhesive / glue': 0.03,
      'Box, polybag & hangtag set': 1,
    },
    laborPerPair: 1.15,
    overheadPerPair: 0.8,
    sellingPrice: 9.5,
  },
];

const finishedGoodsData = [
  { sku: 'PF-S', style: 'Plush Fleece Bedroom', size: 'S (36-37)', beginningPairs: 135, produced: 300, sold: 309, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 12 },
  { sku: 'PF-M', style: 'Plush Fleece Bedroom', size: 'M (38-39)', beginningPairs: 315, produced: 700, sold: 700, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 12 },
  { sku: 'PF-L', style: 'Plush Fleece Bedroom', size: 'L (40-41)', beginningPairs: 315, produced: 700, sold: 756, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 12 },
  { sku: 'PF-XL', style: 'Plush Fleece Bedroom', size: 'XL (42-43)', beginningPairs: 135, produced: 300, sold: 285, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 12 },
  { sku: 'TC-S', style: 'Terry Cloth Spa', size: 'S (36-37)', beginningPairs: 101, produced: 225, sold: 214, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 10.5 },
  { sku: 'TC-M', style: 'Terry Cloth Spa', size: 'M (38-39)', beginningPairs: 236, produced: 525, sold: 499, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 10.5 },
  { sku: 'TC-L', style: 'Terry Cloth Spa', size: 'L (40-41)', beginningPairs: 236, produced: 525, sold: 541, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 10.5 },
  { sku: 'TC-XL', style: 'Terry Cloth Spa', size: 'XL (42-43)', beginningPairs: 101, produced: 225, sold: 214, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 10.5 },
  { sku: 'MF-S', style: 'Memory Foam Slide', size: 'S (36-37)', beginningPairs: 81, produced: 180, sold: 180, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 11 },
  { sku: 'MF-M', style: 'Memory Foam Slide', size: 'M (38-39)', beginningPairs: 189, produced: 420, sold: 399, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 11 },
  { sku: 'MF-L', style: 'Memory Foam Slide', size: 'L (40-41)', beginningPairs: 189, produced: 420, sold: 399, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 11 },
  { sku: 'MF-XL', style: 'Memory Foam Slide', size: 'XL (42-43)', beginningPairs: 81, produced: 180, sold: 194, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 11 },
  { sku: 'KS-S', style: 'Knit Sock Slipper', size: 'S (36-37)', beginningPairs: 68, produced: 150, sold: 162, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 9.5 },
  { sku: 'KS-M', style: 'Knit Sock Slipper', size: 'M (38-39)', beginningPairs: 158, produced: 350, sold: 332, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 9.5 },
  { sku: 'KS-L', style: 'Knit Sock Slipper', size: 'L (40-41)', beginningPairs: 158, produced: 350, sold: 350, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 9.5 },
  { sku: 'KS-XL', style: 'Knit Sock Slipper', size: 'XL (42-43)', beginningPairs: 68, produced: 150, sold: 142, leadTimeDays: 5, safetyStockDays: 3, sellingPrice: 9.5 },
];

const wipStages = [
  { stage: 'Cutting (upper, lining, sole)', beginningPairs: 300, endingPairs: 340, avgCostPerPair: 2 },
  { stage: 'Sewing / upper assembly', beginningPairs: 260, endingPairs: 280, avgCostPerPair: 3.2 },
  { stage: 'Sole attaching / molding', beginningPairs: 180, endingPairs: 150, avgCostPerPair: 4.5 },
  { stage: 'Finishing, QC & packing', beginningPairs: 120, endingPairs: 140, avgCostPerPair: 5.6 },
];

const formatCurrency = (value) => `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatNumber = (value, digits = 2) => Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const inventoryTabs = [
  { id: 'raw-materials', label: 'Raw Materials' },
  { id: 'finished-goods', label: 'Finished Goods' },
  { id: 'bom-costing', label: 'BOM & Costing' },
  { id: 'wip', label: 'WIP' },
];

const parseCsvLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

const parseCsvText = (text) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((row, key, index) => {
      row[key] = values[index] ?? '';
      return row;
    }, {});
  });
};

const objectToCsv = (rows, headers) => {
  const escapeValue = (value) => {
    const text = String(value ?? '').replace(/"/g, '""');
    return `"${text}"`;
  };

  const csvRows = [headers.map(escapeValue).join(',')];

  rows.forEach((row) => {
    const values = headers.map((header) => escapeValue(row[header] ?? ''));
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
};

const downloadCsv = (filename, rows, headers) => {
  const csvContent = objectToCsv(rows, headers);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const normalizeCsvKey = (key = '') => String(key).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const normalizeImportedRow = (row) => {
  const normalized = {};

  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = normalizeCsvKey(key);
    normalized[normalizedKey] = String(value ?? '').trim();
  });

  return normalized;
};

const getRowValue = (row, keys) => {
  for (const key of keys) {
    const value = row[normalizeCsvKey(key)];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return '';
};

const mapImportedRawMaterial = (row) => {
  const normalized = normalizeImportedRow(row);

  return {
    code: getRowValue(normalized, ['code', 'material_code']) || '',
    material_name: getRowValue(normalized, ['material', 'material_name', 'name']) || 'Imported Material',
    unit: getRowValue(normalized, ['unit']) || 'unit',
    unit_cost: Number(getRowValue(normalized, ['unit_cost', 'unit_cost_php', 'unit_cost_php_value', 'unit cost']) || 0),
    beginning_qty: Number(getRowValue(normalized, ['beginning_qty', 'beginning_quantity', 'beginning qty']) || 0),
    received: Number(getRowValue(normalized, ['received_qty', 'received', 'received qty']) || 0),
    used: Number(getRowValue(normalized, ['used_qty', 'used', 'used qty']) || 0),
    ending_qty: Number(getRowValue(normalized, ['ending_qty', 'ending_quantity', 'ending qty']) || 0),
    inventory_value: Number(getRowValue(normalized, ['inventory_value', 'inventory value']) || 0),
    avg_daily_usage: Number(getRowValue(normalized, ['average_daily_usage', 'avg_daily_usage', 'average daily usage']) || 0),
    max_daily_usage: Number(getRowValue(normalized, ['max_daily_usage', 'max daily usage']) || 0),
    lead_time_days: Number(getRowValue(normalized, ['lead_time_days', 'lead_time', 'lead time days']) || 0),
    safety_stock: Number(getRowValue(normalized, ['safety_stock', 'safety stock']) || 0),
    reorder_point: Number(getRowValue(normalized, ['reorder_point', 'reorder point']) || 0),
    annual_usage: Number(getRowValue(normalized, ['annual_usage', 'annual usage']) || 0),
    order_cost: Number(getRowValue(normalized, ['order_cost', 'order cost']) || 0),
    holding_pct: Number(getRowValue(normalized, ['holding_cost_pct', 'holding_pct', 'holding cost %']) || 0),
    eoq: Number(getRowValue(normalized, ['eoq']) || 0),
    status: getRowValue(normalized, ['status']) || 'OK',
  };
};

const normalizeLiveRawMaterialRow = (row = {}) => ({
  ...row,
  material_name: row.material_name ?? row.name ?? 'Unnamed Material',
  unit: row.unit ?? 'unit',
  unit_cost: Number(row.unit_cost ?? 0),
  beginning_qty: Number(row.beginning_qty ?? row.beginning_stock ?? 0),
  received: Number(row.received ?? 0),
  used: Number(row.used ?? row.usage_gross ?? 0),
  ending_qty: Number(row.ending_qty ?? row.ending_stock ?? 0),
  inventory_value: Number(row.inventory_value ?? row.ending_value ?? 0),
  avg_daily_usage: Number(row.avg_daily_usage ?? row.daily_usage ?? 0),
  max_daily_usage: Number(row.max_daily_usage ?? 0),
  lead_time_days: Number(row.lead_time_days ?? row.lead_time ?? 0),
  safety_stock: Number(row.safety_stock ?? 0),
  reorder_point: Number(row.reorder_point ?? 0),
  annual_usage: Number(row.annual_usage ?? row.annual_demand ?? 0),
  order_cost: Number(row.order_cost ?? row.ordering_cost ?? 0),
  holding_pct: Number(row.holding_pct ?? row.holding_cost ?? 0),
  eoq: Number(row.eoq ?? 0),
  status: row.status ?? 'OK',
});

const normalizeLiveFinishedGoodRow = (row = {}) => ({
  ...row,
  sku: row.sku ?? 'NEW-SKU',
  style: row.style ?? row.product_name ?? row.sku ?? 'Imported Style',
  size: row.size ?? 'N/A',
  unit_cost: Number(row.unit_cost ?? 0),
  beginning_pairs: Number(row.beginning_pairs ?? row.beginning_stock ?? 0),
  produced: Number(row.produced ?? row.production ?? 0),
  sold: Number(row.sold ?? 0),
  ending_pairs: Number(row.ending_pairs ?? row.ending_stock ?? 0),
  inventory_value: Number(row.inventory_value ?? row.ending_value ?? 0),
  selling_price: Number(row.selling_price ?? 0),
  avg_daily_sales: Number(row.avg_daily_sales ?? row.monthly_sales_rate ?? 0),
  lead_time_days: Number(row.lead_time_days ?? row.lead_time ?? 0),
  safety_stock_days: Number(row.safety_stock_days ?? row.buffer ?? 0),
  reorder_point: Number(row.reorder_point ?? 0),
  days_of_stock: Number(row.days_of_stock ?? 0),
  status: row.status ?? 'OK',
});

const normalizeLiveCostingRow = (row = {}) => ({
  ...row,
  sku: row.sku ?? row.product ?? 'NEW',
  product_name: row.product_name ?? row.style ?? row.product ?? 'Imported Product',
  direct_material_cost: Number(row.direct_material_cost ?? 0),
  direct_labor_cost: Number(row.direct_labor_cost ?? 0),
  overhead_cost: Number(row.overhead_cost ?? 0),
  total_unit_cost: Number(row.total_unit_cost ?? 0),
  selling_price: Number(row.selling_price ?? 0),
  gross_profit: Number(row.gross_profit ?? 0),
  gross_margin_pct: Number(row.gross_margin_pct ?? 0),
});

const normalizeLiveWipRow = (row = {}) => ({
  ...row,
  stage: row.stage ?? 'Imported Stage',
  beginning_pairs: Number(row.beginning_pairs ?? 0),
  ending_pairs: Number(row.ending_pairs ?? 0),
  avg_cost_per_pair: Number(row.avg_cost_per_pair ?? 0),
  beginning_value: Number(row.beginning_value ?? 0),
  ending_value: Number(row.ending_value ?? 0),
});

const mapImportedFinishedGood = (row) => {
  const normalized = normalizeImportedRow(row);

  return {
    sku: getRowValue(normalized, ['sku']) || 'NEW-SKU',
    style: getRowValue(normalized, ['style', 'product_name']) || 'Imported Style',
    size: getRowValue(normalized, ['size']) || 'N/A',
    unit_cost: Number(getRowValue(normalized, ['unit_cost', 'unit cost']) || 0),
    beginning_pairs: Number(getRowValue(normalized, ['beginning_pairs', 'beginning pairs']) || 0),
    produced: Number(getRowValue(normalized, ['produced']) || 0),
    sold: Number(getRowValue(normalized, ['sold']) || 0),
    ending_pairs: Number(getRowValue(normalized, ['ending_pairs', 'ending pairs']) || 0),
    inventory_value: Number(getRowValue(normalized, ['inventory_value', 'inventory value']) || 0),
    selling_price: Number(getRowValue(normalized, ['selling_price', 'selling price']) || 0),
    avg_daily_sales: Number(getRowValue(normalized, ['average_daily_sales', 'avg_daily_sales', 'average daily sales']) || 0),
    lead_time_days: Number(getRowValue(normalized, ['lead_time_days', 'lead time days']) || 0),
    safety_stock_days: Number(getRowValue(normalized, ['safety_stock_days', 'safety stock days']) || 0),
    reorder_point: Number(getRowValue(normalized, ['reorder_point', 'reorder point']) || 0),
    days_of_stock: Number(getRowValue(normalized, ['days_of_stock', 'days of stock']) || 0),
    status: getRowValue(normalized, ['status']) || 'OK',
  };
};

const mapImportedCosting = (row) => {
  const normalized = normalizeImportedRow(row);

  return {
    sku: getRowValue(normalized, ['sku', 'product']) || 'NEW',
    product_name: getRowValue(normalized, ['product', 'product_name', 'style']) || 'Imported Product',
    direct_material_cost: Number(getRowValue(normalized, ['direct_material_cost', 'direct material cost']) || 0),
    direct_labor_cost: Number(getRowValue(normalized, ['direct_labor_cost', 'direct labor cost']) || 0),
    overhead_cost: Number(getRowValue(normalized, ['overhead_cost', 'overhead cost']) || 0),
    total_unit_cost: Number(getRowValue(normalized, ['total_unit_cost', 'total unit cost']) || 0),
    selling_price: Number(getRowValue(normalized, ['selling_price', 'selling price']) || 0),
    gross_profit: Number(getRowValue(normalized, ['gross_profit', 'gross profit']) || 0),
    gross_margin_pct: Number(getRowValue(normalized, ['gross_margin_pct', 'gross margin %']) || 0),
  };
};

const mapImportedWip = (row) => {
  const normalized = normalizeImportedRow(row);

  return {
    stage: getRowValue(normalized, ['stage']) || 'Imported Stage',
    beginning_pairs: Number(getRowValue(normalized, ['beginning_pairs', 'beginning pairs']) || 0),
    ending_pairs: Number(getRowValue(normalized, ['ending_pairs', 'ending pairs']) || 0),
    avg_cost_per_pair: Number(getRowValue(normalized, ['avg_cost_per_pair', 'avg cost per pair']) || 0),
    beginning_value: Number(getRowValue(normalized, ['beginning_value', 'beginning value']) || 0),
    ending_value: Number(getRowValue(normalized, ['ending_value', 'ending value']) || 0),
  };
};

const rawMaterialHeaders = [
  'Material', 'Unit', 'Unit Cost', 'Beginning Qty', 'Received Qty', 'Used Qty', 'Ending Qty', 'Inventory Value', 'Average Daily Usage', 'Max Daily Usage', 'Lead Time (Days)', 'Safety Stock', 'Reorder Point', 'Annual Usage', 'Order Cost', 'Holding Cost %', 'EOQ', 'Status',
];

const finishedGoodHeaders = [
  'SKU', 'Style', 'Size', 'Unit Cost', 'Beginning Pairs', 'Produced', 'Sold', 'Ending Pairs', 'Inventory Value', 'Selling Price', 'Average Daily Sales', 'Lead Time (Days)', 'Safety Stock Days', 'Reorder Point', 'Days of Stock', 'Status',
];

const costingHeaders = [
  'Product', 'Direct Material Cost', 'Direct Labor Cost', 'Overhead Cost', 'Total Unit Cost', 'Selling Price', 'Gross Profit', 'Gross Margin %',
];

const wipHeaders = [
  'Stage', 'Beginning Pairs', 'Ending Pairs', 'Avg Cost Per Pair', 'Beginning Value', 'Ending Value',
];

const getTabRows = (tab, rows) => {
  switch (tab) {
    case 'raw-materials':
      return rows.rawMaterials;
    case 'finished-goods':
      return rows.finishedGoods;
    case 'bom-costing':
      return rows.costingRows;
    case 'wip':
      return rows.wipRows;
    default:
      return rows.rawMaterials;
  }
};

const getExportRows = (tab, rows) => {
  const sourceRows = getTabRows(tab, rows);

  switch (tab) {
    case 'raw-materials':
      return sourceRows.map((row) => ({
        'Material': row.material_name ?? '',
        'Unit': row.unit ?? '',
        'Unit Cost': row.unit_cost ?? 0,
        'Beginning Qty': row.beginning_qty ?? 0,
        'Received Qty': row.received ?? 0,
        'Used Qty': row.used ?? 0,
        'Ending Qty': row.ending_qty ?? 0,
        'Inventory Value': row.inventory_value ?? 0,
        'Average Daily Usage': row.avg_daily_usage ?? 0,
        'Max Daily Usage': row.max_daily_usage ?? 0,
        'Lead Time (Days)': row.lead_time_days ?? 0,
        'Safety Stock': row.safety_stock ?? 0,
        'Reorder Point': row.reorder_point ?? 0,
        'Annual Usage': row.annual_usage ?? 0,
        'Order Cost': row.order_cost ?? 0,
        'Holding Cost %': row.holding_pct ?? 0,
        'EOQ': row.eoq ?? 0,
        'Status': row.status ?? '',
      }));
    case 'finished-goods':
      return sourceRows.map((row) => ({
        'SKU': row.sku ?? '',
        'Style': row.style ?? '',
        'Size': row.size ?? '',
        'Unit Cost': row.unit_cost ?? 0,
        'Beginning Pairs': row.beginning_pairs ?? 0,
        'Produced': row.produced ?? 0,
        'Sold': row.sold ?? 0,
        'Ending Pairs': row.ending_pairs ?? 0,
        'Inventory Value': row.inventory_value ?? 0,
        'Selling Price': row.selling_price ?? 0,
        'Average Daily Sales': row.avg_daily_sales ?? 0,
        'Lead Time (Days)': row.lead_time_days ?? 0,
        'Safety Stock Days': row.safety_stock_days ?? 0,
        'Reorder Point': row.reorder_point ?? 0,
        'Days of Stock': row.days_of_stock ?? 0,
        'Status': row.status ?? '',
      }));
    case 'bom-costing':
      return sourceRows.map((row) => ({
        'Product': row.product_name ?? row.style ?? '',
        'Direct Material Cost': row.direct_material_cost ?? 0,
        'Direct Labor Cost': row.direct_labor_cost ?? 0,
        'Overhead Cost': row.overhead_cost ?? 0,
        'Total Unit Cost': row.total_unit_cost ?? 0,
        'Selling Price': row.selling_price ?? 0,
        'Gross Profit': row.gross_profit ?? 0,
        'Gross Margin %': row.gross_margin_pct ?? 0,
      }));
    case 'wip':
      return sourceRows.map((row) => ({
        'Stage': row.stage ?? '',
        'Beginning Pairs': row.beginning_pairs ?? 0,
        'Ending Pairs': row.ending_pairs ?? 0,
        'Avg Cost Per Pair': row.avg_cost_per_pair ?? 0,
        'Beginning Value': row.beginning_value ?? 0,
        'Ending Value': row.ending_value ?? 0,
      }));
    default:
      return sourceRows;
  }
};

const getTabHeaders = (tab) => {
  switch (tab) {
    case 'raw-materials':
      return rawMaterialHeaders;
    case 'finished-goods':
      return finishedGoodHeaders;
    case 'bom-costing':
      return costingHeaders;
    case 'wip':
      return wipHeaders;
    default:
      return rawMaterialHeaders;
  }
};

const getTabTitle = (tab) => {
  switch (tab) {
    case 'raw-materials':
      return 'Raw Materials Inventory';
    case 'finished-goods':
      return 'Finished Goods';
    case 'bom-costing':
      return 'BOM & Costing';
    case 'wip':
      return 'Work-in-Process';
    default:
      return 'Inventory';
  }
};

const styleProducedTotals = styleDefinitions.map((style) => ({
  style: style.style,
  producedPairs: finishedGoodsData.filter((row) => row.style === style.style).reduce((sum, row) => sum + row.produced, 0),
}));

const styleCosting = styleDefinitions.map((style) => {
  const materialCost = materialCatalog.reduce((sum, item) => {
    const quantity = style.materials[item.name] || 0;
    return sum + (item.unitCost * quantity);
  }, 0) * (1 + wasteAllowance);
  const totalCost = materialCost + style.laborPerPair + style.overheadPerPair;
  const grossProfit = style.sellingPrice - totalCost;
  const grossMarginPct = (style.sellingPrice > 0 ? (grossProfit / style.sellingPrice) * 100 : 0);

  return {
    style: style.style,
    materialCost,
    laborPerPair: style.laborPerPair,
    overheadPerPair: style.overheadPerPair,
    totalCost,
    sellingPrice: style.sellingPrice,
    grossProfit,
    grossMarginPct,
  };
});

const rawMaterialRows = materialCatalog.map((material) => {
  const usedQuantity = styleProducedTotals.reduce((sum, style) => {
    const styleSpec = styleDefinitions.find((entry) => entry.style === style.style);
    const qtyPerPair = styleSpec?.materials?.[material.name] || 0;
    return sum + (qtyPerPair * style.producedPairs);
  }, 0) * (1 + wasteAllowance);

  const endingQty = material.beginningQty + material.received - usedQuantity;
  const inventoryValue = endingQty * material.unitCost;
  const avgDailyUsage = usedQuantity / workingDaysInPeriod;
  const safetyStock = Math.max(0, (material.maxDailyUsage - avgDailyUsage) * material.leadTimeDays);
  const reorderPoint = avgDailyUsage * material.leadTimeDays + safetyStock;
  const annualUsage = avgDailyUsage * workingDaysPerYear;
  const eoq = material.unitCost > 0 && material.orderCost > 0 && material.holdingPct > 0
    ? Math.sqrt((2 * annualUsage * material.orderCost) / (material.holdingPct * material.unitCost))
    : 0;
  const status = endingQty <= reorderPoint ? 'REORDER' : 'OK';

  return {
    code: material.code,
    material_name: material.name,
    unit: material.unit,
    unit_cost: material.unitCost,
    beginning_qty: material.beginningQty,
    received: material.received,
    used: usedQuantity,
    ending_qty: endingQty,
    inventory_value: inventoryValue,
    avg_daily_usage: avgDailyUsage,
    max_daily_usage: material.maxDailyUsage,
    lead_time_days: material.leadTimeDays,
    safety_stock: safetyStock,
    reorder_point: reorderPoint,
    annual_usage: annualUsage,
    order_cost: material.orderCost,
    holding_pct: material.holdingPct,
    eoq,
    status,
  };
});

const finishedGoodRows = finishedGoodsData.map((item) => {
  const styleCost = styleCosting.find((entry) => entry.style === item.style);
  const unitCost = styleCost?.totalCost ?? 0;
  const endingPairs = item.beginningPairs + item.produced - item.sold;
  const inventoryValue = endingPairs * unitCost;
  const avgDailySales = item.sold / workingDaysInPeriod;
  const reorderPoint = avgDailySales * (item.leadTimeDays + item.safetyStockDays);
  const daysOfStock = avgDailySales > 0 ? endingPairs / avgDailySales : 0;
  const status = endingPairs <= reorderPoint ? 'PRODUCE' : 'OK';

  return {
    sku: item.sku,
    style: item.style,
    size: item.size,
    unit_cost: unitCost,
    beginning_pairs: item.beginningPairs,
    produced: item.produced,
    sold: item.sold,
    ending_pairs: endingPairs,
    inventory_value: inventoryValue,
    selling_price: item.sellingPrice,
    avg_daily_sales: avgDailySales,
    lead_time_days: item.leadTimeDays,
    safety_stock_days: item.safetyStockDays,
    reorder_point: reorderPoint,
    days_of_stock: daysOfStock,
    status,
  };
});

const wipRows = wipStages.map((stage) => ({
  stage: stage.stage,
  beginning_pairs: stage.beginningPairs,
  ending_pairs: stage.endingPairs,
  avg_cost_per_pair: stage.avgCostPerPair,
  beginning_value: stage.beginningPairs * stage.avgCostPerPair,
  ending_value: stage.endingPairs * stage.avgCostPerPair,
}));

const wipTotals = wipRows.reduce((totals, row) => {
  totals.beginning += row.beginning_pairs;
  totals.ending += row.ending_pairs;
  totals.beginningValue += row.beginning_value;
  totals.endingValue += row.ending_value;
  return totals;
}, { beginning: 0, ending: 0, beginningValue: 0, endingValue: 0 });

const rawMaterialsTotalValue = rawMaterialRows.reduce((sum, row) => sum + row.inventory_value, 0);
const finishedGoodsTotalValue = finishedGoodRows.reduce((sum, row) => sum + row.inventory_value, 0);
const totalInventoryValue = rawMaterialsTotalValue + finishedGoodsTotalValue;
const reorderAlerts = rawMaterialRows.filter((row) => row.status === 'REORDER').length;
const productionTriggers = finishedGoodRows.filter((row) => row.status === 'PRODUCE').length;

const totalMaterialPurchase = rawMaterialRows.reduce((sum, row) => sum + row.received * row.unit_cost, 0);
const totalRawMaterialsUsed = rawMaterialRows.reduce((sum, row) => sum + row.used * row.unit_cost, 0);
const directLabor = styleDefinitions.reduce((sum, style) => {
  const producedPairs = finishedGoodsData.filter((item) => item.style === style.style).reduce((total, item) => total + item.produced, 0);
  return sum + (producedPairs * style.laborPerPair);
}, 0);
const manufacturingOverhead = styleDefinitions.reduce((sum, style) => {
  const producedPairs = finishedGoodsData.filter((item) => item.style === style.style).reduce((total, item) => total + item.produced, 0);
  return sum + (producedPairs * style.overheadPerPair);
}, 0);
const totalManufacturingCost = rawMaterialRows.reduce((sum, row) => sum + row.used * row.unit_cost, 0) + directLabor + manufacturingOverhead;
const beginningFinishedGoodsInventoryValue = finishedGoodRows.reduce((sum, row) => sum + (row.beginning_pairs * row.unit_cost), 0);
const endingFinishedGoodsInventoryValue = finishedGoodRows.reduce((sum, row) => sum + (row.ending_pairs * row.unit_cost), 0);
const cogm = totalManufacturingCost + wipTotals.beginningValue - wipTotals.endingValue;
const cogs = cogm + beginningFinishedGoodsInventoryValue - endingFinishedGoodsInventoryValue;
const salesRevenue = finishedGoodRows.reduce((sum, row) => sum + (row.sold * row.selling_price), 0);
const grossProfit = salesRevenue - cogs;
const grossMarginPct = salesRevenue > 0 ? (grossProfit / salesRevenue) * 100 : 0;
const manufacturingCostPerPair = styleDefinitions.reduce((sum, style) => sum + (style.laborPerPair + style.overheadPerPair), 0) / styleDefinitions.length;

const summaryStats = {
  beginningFinishedGoods: beginningFinishedGoodsInventoryValue,
  totalManufacturingCost: totalManufacturingCost,
  cogm,
  cogs,
  endingFinishedGoods: endingFinishedGoodsInventoryValue,
  rawMaterialBeginning: rawMaterialRows.reduce((sum, row) => sum + (row.beginning_qty * row.unit_cost), 0),
  rawMaterialPurchases: totalMaterialPurchase,
  rawMaterialEnding: rawMaterialRows.reduce((sum, row) => sum + (row.ending_qty * row.unit_cost), 0),
  rawMaterialsUsed: rawMaterialRows.reduce((sum, row) => sum + (row.used * row.unit_cost), 0),
  wipBeginning: wipTotals.beginningValue,
  wipEnding: wipTotals.endingValue,
  totalInventoryBeginning: rawMaterialRows.reduce((sum, row) => sum + (row.beginning_qty * row.unit_cost), 0) + wipTotals.beginningValue + beginningFinishedGoodsInventoryValue,
  totalInventoryEnding: rawMaterialRows.reduce((sum, row) => sum + (row.ending_qty * row.unit_cost), 0) + wipTotals.endingValue + endingFinishedGoodsInventoryValue,
  averageInventory: 0,
  turnover: 0,
  dio: 0,
  calendarDays: 30,
};

summaryStats.averageInventory = (summaryStats.totalInventoryBeginning + summaryStats.totalInventoryEnding) / 2;
summaryStats.turnover = summaryStats.averageInventory > 0 ? cogs / summaryStats.averageInventory : 0;
summaryStats.dio = summaryStats.turnover > 0 ? 30 / summaryStats.turnover : 0;

const inventoryDollarTotal = rawMaterialRows.reduce((sum, row) => sum + row.inventory_value, 0);

const formulaGuide = [
  { label: 'Raw material used', formula: 'SUMPRODUCT(BOM qty x produced pairs) x (1 + waste %)' },
  { label: 'Raw material ending qty', formula: 'Beginning + Received - Used' },
  { label: 'Avg daily usage', formula: 'Used in period / Working days' },
  { label: 'Safety stock', formula: 'MAX(0, (Max daily usage - Avg daily usage) x Lead time)' },
  { label: 'Reorder point', formula: '(Avg daily usage x Lead time) + Safety stock' },
  { label: 'EOQ', formula: 'SQRT(2 x Annual usage x Order cost / (Holding % x Unit cost))' },
  { label: 'FG ending pairs', formula: 'Beginning + Produced - Sold' },
  { label: 'FG reorder point', formula: 'Avg daily sales x (Lead time + Safety days)' },
  { label: 'Days of stock', formula: 'Ending pairs / Avg daily sales' },
  { label: 'COGM', formula: 'Raw materials used + DL + OH + Beginning WIP - Ending WIP' },
  { label: 'COGS', formula: 'COGM + Beginning FG - Ending FG' },
];

const stepByStep = [
  'Set period assumptions on the BOM tab: working days in period, work days per year, and waste allowance.',
  'Enter each raw material’s beginning qty, received qty, max daily usage, lead time, order cost, and holding cost percentage.',
  'Fill the BOM with each material quantity needed per pair for each style and enter labor, overhead, and selling price.',
  'Enter finished goods by size, then review safety stock, reorder triggers, and days-of-stock calculations.',
  'Record WIP at each stage to complete the COGM calculation and review COGS and KPI summaries.',
  'Close the period by carrying ending values into the next beginning values for the next cycle.',
];

const API_BASE = '/api';

async function fetchJson(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const payload = await response.json();
  return payload.data ?? payload;
}

const initialFinanceSummary = {
  beginning_finished_goods: summaryStats.beginningFinishedGoods,
  total_manufacturing_cost: summaryStats.totalManufacturingCost,
  cogm: summaryStats.cogm,
  cogs: summaryStats.cogs,
  ending_finished_goods: summaryStats.endingFinishedGoods,
};

function StatusBadge({ status }) {
  const palette = {
    OK: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    REORDER: 'bg-red-100 text-red-700 border border-red-200',
    PRODUCE: 'bg-amber-100 text-amber-700 border border-amber-200',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${palette[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, hint, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-3 text-3xl font-bold ${accent}`}>{value}</div>
      <div className="mt-2 text-xs text-slate-400">{hint}</div>
    </div>
  );
}

function TableCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function App() {
  const [rawMaterials, setRawMaterials] = useState(rawMaterialRows);
  const [finishedGoods, setFinishedGoods] = useState(finishedGoodRows);
  const [costingRows, setCostingRows] = useState(styleCosting.map((row) => ({
    sku: row.style,
    product_name: row.style,
    direct_material_cost: row.materialCost,
    direct_labor_cost: row.laborPerPair,
    overhead_cost: row.overheadPerPair,
    total_unit_cost: row.totalCost,
    selling_price: row.sellingPrice,
    gross_profit: row.grossProfit,
    gross_margin_pct: row.grossMarginPct,
  })));
  const [wipRowsState, setWipRowsState] = useState(wipRows);
  const [financeSummary, setFinanceSummary] = useState(initialFinanceSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dataSource, setDataSource] = useState('workbook');
  const [activeTab, setActiveTab] = useState('raw-materials');
  const [importMessage, setImportMessage] = useState('');

  const refreshDashboardData = async () => {
    try {
      const [rawData, finishedData, costingData, financeData] = await Promise.all([
        fetchJson('/raw-materials'),
        fetchJson('/finished-goods'),
        fetchJson('/bom-costing'),
        fetchJson('/financials/cogm-cogs'),
      ]);

      const hasLiveData = Array.isArray(rawData) && rawData.length > 0 && Array.isArray(finishedData) && finishedData.length > 0;

      if (hasLiveData) {
        setRawMaterials(rawData.map(normalizeLiveRawMaterialRow));
        setFinishedGoods(finishedData.map(normalizeLiveFinishedGoodRow));
        setDataSource('database');
        setError('');
      } else {
        setDataSource('workbook');
      }

      if (Array.isArray(costingData) && costingData.length > 0) {
        setCostingRows(costingData.map(normalizeLiveCostingRow));
      }

      if (financeData) {
        setFinanceSummary(financeData);
      }

      return { rawData, finishedData, costingData, financeData };
    } catch (loadError) {
      setDataSource('workbook');
      setError('Live MySQL data is not available yet, so the workbook-backed figures are being shown instead.');
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadLiveData = async () => {
      const result = await refreshDashboardData();
      if (!mounted) {
        return;
      }

      if (result) {
        setLoading(false);
      }
    };

    loadLiveData();

    return () => {
      mounted = false;
    };
  }, []);

  const deduplicateImportRows = (rows, keyNames) => {
    const seen = new Set();
    const deduped = [];

    rows.forEach((row) => {
      const keys = keyNames
        .map((key) => String(row?.[key] ?? row?.[key.toLowerCase()] ?? '').trim())
        .filter(Boolean);

      const lookupKey = keys.join('|').toLowerCase();

      if (!lookupKey || seen.has(lookupKey)) {
        return;
      }

      seen.add(lookupKey);
      deduped.push(row);
    });

    return deduped;
  };

  const persistImportedRows = async (tab, rows) => {
    if (!rows.length) {
      return;
    }

    const uniqueRows = tab === 'raw-materials'
      ? deduplicateImportRows(rows, ['material_name', 'name'])
      : tab === 'finished-goods'
        ? deduplicateImportRows(rows, ['sku'])
        : tab === 'bom-costing'
          ? deduplicateImportRows(rows, ['sku', 'product_name', 'style'])
          : deduplicateImportRows(rows, ['batch_name', 'stage']);

    let endpoint = '/raw-materials';
    let payload = uniqueRows;

    if (tab === 'finished-goods') {
      endpoint = '/finished-goods';
      payload = uniqueRows.map((row) => ({
        sku: row.sku || 'NEW-SKU',
        product_name: row.style || row.product_name || row.sku || 'Imported Style',
        size: row.size || 'N/A',
        unit_cost: Number(row.unit_cost ?? 0),
        beginning_stock: Number(row.beginning_pairs ?? 0),
        production: Number(row.produced ?? 0),
        sold: Number(row.sold ?? 0),
        ending_stock: Number(row.ending_pairs ?? 0),
        ending_value: Number(row.inventory_value ?? 0),
        selling_price: Number(row.selling_price ?? 0),
        monthly_sales_rate: Number(row.avg_daily_sales ?? 0),
        lead_time: Number(row.lead_time_days ?? 0),
        buffer: Number(row.safety_stock_days ?? 0),
        safety_stock: Number(row.reorder_point ?? 0),
        reorder_point: Number(row.reorder_point ?? 0),
        days_of_stock: Number(row.days_of_stock ?? 0),
        status: row.status || 'OK',
      }));
    }

    if (tab === 'bom-costing') {
      endpoint = '/bom-costing';
      payload = uniqueRows.map((row) => ({
        sku: row.sku || row.product_name || 'NEW',
        product_name: row.product_name || row.style || 'Imported Product',
        selling_price: Number(row.selling_price ?? 0),
        direct_labor_cost: Number(row.direct_labor_cost ?? 0),
        overhead_cost: Number(row.overhead_cost ?? 0),
        waste_percentage: Number(row.gross_margin_pct ?? 0),
      }));
    }

    if (tab === 'wip') {
      endpoint = '/wip';
      payload = uniqueRows.map((row) => ({
        stage: row.stage || 'Imported Stage',
        batch_name: row.stage || 'Imported Stage',
        quantity_in_process: Number(row.beginning_pairs ?? 0),
        direct_material_cost: Number(row.beginning_value ?? 0),
        direct_labor_cost: Number(row.avg_cost_per_pair ?? 0),
        overhead_cost: Number(row.ending_value ?? 0),
        status: 'OPEN',
      }));
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: payload }),
    });

    const result = await response.json();

    if (!response.ok || result?.success === false) {
      throw new Error(result?.message || 'Database import failed.');
    }

    return result;
  };

  const handleImportCsv = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const rows = parseCsvText(text);

      if (!rows.length) {
        setImportMessage('No CSV rows were found in the selected file.');
        event.target.value = '';
        return;
      }

      const normalizedRows = rows.map((row) => {
        const cleanRow = {};
        Object.entries(row).forEach(([key, value]) => {
          cleanRow[key.trim()] = String(value ?? '').trim();
        });
        return cleanRow;
      });

      let importedDatabaseRows = normalizedRows;

      if (activeTab === 'raw-materials') {
        importedDatabaseRows = normalizedRows.map(mapImportedRawMaterial);
        setRawMaterials(importedDatabaseRows);
      }

      if (activeTab === 'finished-goods') {
        importedDatabaseRows = normalizedRows.map(mapImportedFinishedGood);
        setFinishedGoods(importedDatabaseRows);
      }

      if (activeTab === 'bom-costing') {
        importedDatabaseRows = normalizedRows.map(mapImportedCosting);
        setCostingRows(importedDatabaseRows);
      }

      if (activeTab === 'wip') {
        importedDatabaseRows = normalizedRows.map(mapImportedWip);
        setWipRowsState(importedDatabaseRows);
      }

      const result = await persistImportedRows(activeTab, importedDatabaseRows);

      if (result?.bom_costing) {
        setCostingRows(result.bom_costing.map(normalizeLiveCostingRow));
      } else {
        await refreshDashboardData();
      }

      setImportMessage(`Imported ${normalizedRows.length} rows into ${getTabTitle(activeTab)} and saved them to the database.`);
    } catch (importError) {
      setImportMessage(importError.message || 'The selected CSV could not be imported. Please check the file format.');
    } finally {
      event.target.value = '';
    }
  };

  const exportCurrentTab = () => {
    const rows = getExportRows(activeTab, { rawMaterials, finishedGoods, costingRows, wipRows: wipRowsState });
    const headers = getTabHeaders(activeTab);
    downloadCsv(`${activeTab}.csv`, rows, headers);
  };

  const downloadTemplateForCurrentTab = () => {
    const headers = getTabHeaders(activeTab);
    const blankRow = Object.fromEntries(headers.map((header) => [header, '']));
    const templateRows = [blankRow];
    downloadCsv(`${activeTab}-template.csv`, templateRows, headers);
  };

  const activeFinanceSummary = financeSummary ?? initialFinanceSummary;

  const renderActiveTable = () => {
    if (activeTab === 'raw-materials') {
      return (
        <TableCard title="Raw Materials Inventory" subtitle="Workbook raw-material logic with CSV import/export support">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="pb-3 pr-3 font-medium">Material</th>
                  <th className="pb-3 pr-3 font-medium">Unit</th>
                  <th className="pb-3 pr-3 font-medium">Unit Cost</th>
                  <th className="pb-3 pr-3 font-medium">Beginning</th>
                  <th className="pb-3 pr-3 font-medium">Received</th>
                  <th className="pb-3 pr-3 font-medium">Used</th>
                  <th className="pb-3 pr-3 font-medium">Ending Qty</th>
                  <th className="pb-3 pr-3 font-medium">EOQ</th>
                  <th className="pb-3 pr-3 font-medium">Reorder pt.</th>
                  <th className="pb-3 pr-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rawMaterials.map((row) => (
                  <tr key={row.code || row.material_name} className="align-middle">
                    <td className="py-3 pr-3 font-medium text-slate-800">{row.material_name}</td>
                    <td className="py-3 pr-3 text-slate-600">{row.unit || 'unit'}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.unit_cost ?? 0)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.beginning_qty ?? 0, 1)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.received ?? 0, 1)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.used ?? 0, 1)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.ending_qty ?? row.ending_stock ?? 0, 1)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.eoq ?? 0, 1)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.reorder_point ?? 0, 1)}</td>
                    <td className="py-3"><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableCard>
      );
    }

    if (activeTab === 'finished-goods') {
      return (
        <TableCard title="Finished Goods" subtitle="Workbook finished-goods cycle and safety stock view">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="pb-3 pr-3 font-medium">SKU</th>
                  <th className="pb-3 pr-3 font-medium">Style</th>
                  <th className="pb-3 pr-3 font-medium">Size</th>
                  <th className="pb-3 pr-3 font-medium">Beginning</th>
                  <th className="pb-3 pr-3 font-medium">Produced</th>
                  <th className="pb-3 pr-3 font-medium">Sold</th>
                  <th className="pb-3 pr-3 font-medium">Ending</th>
                  <th className="pb-3 pr-3 font-medium">Unit Cost</th>
                  <th className="pb-3 pr-3 font-medium">Selling Price</th>
                  <th className="pb-3 pr-3 font-medium">Reorder Pt.</th>
                  <th className="pb-3 pr-3 font-medium">Days Stock</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finishedGoods.map((row) => (
                  <tr key={row.sku || row.style} className="align-middle">
                    <td className="py-3 pr-3 font-medium text-slate-800">{row.sku}</td>
                    <td className="py-3 pr-3 text-slate-600">{row.style || row.product_name}</td>
                    <td className="py-3 pr-3 text-slate-600">{row.size || 'N/A'}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.beginning_pairs ?? 0, 1)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.produced ?? 0, 1)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.sold ?? 0, 1)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.ending_pairs ?? row.ending_stock ?? 0, 1)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.unit_cost ?? 0)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.selling_price ?? 0)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.reorder_point ?? 0, 1)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.days_of_stock ?? 0, 1)}</td>
                    <td className="py-3"><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableCard>
      );
    }

    if (activeTab === 'bom-costing') {
      return (
        <TableCard title="BOM & Costing" subtitle="Material cost, labor, overhead, gross profit, and gross margin">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="pb-3 pr-3 font-medium">Product</th>
                  <th className="pb-3 pr-3 font-medium">Materials</th>
                  <th className="pb-3 pr-3 font-medium">Labor</th>
                  <th className="pb-3 pr-3 font-medium">Overhead</th>
                  <th className="pb-3 pr-3 font-medium">Total Cost</th>
                  <th className="pb-3 pr-3 font-medium">Selling Price</th>
                  <th className="pb-3 pr-3 font-medium">Gross Profit</th>
                  <th className="pb-3 font-medium">Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {costingRows.map((row) => (
                  <tr key={row.sku || row.product_name || row.style} className="align-middle">
                    <td className="py-3 pr-3 font-medium text-slate-800">{row.product_name || row.style}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.direct_material_cost ?? row.materialCost ?? 0)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.direct_labor_cost ?? row.laborPerPair ?? 0)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.overhead_cost ?? row.overheadPerPair ?? 0)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.total_unit_cost ?? row.totalCost ?? 0)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.selling_price ?? 0)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.gross_profit ?? 0)}</td>
                    <td className="py-3 font-semibold text-emerald-600">{formatNumber(row.gross_margin_pct ?? row.grossMarginPct ?? 0, 1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableCard>
      );
    }

    return (
      <TableCard title="Work-in-Process" subtitle="Workbook WIP stages and values">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="pb-3 pr-3 font-medium">Stage</th>
                <th className="pb-3 pr-3 font-medium">Beginning</th>
                <th className="pb-3 pr-3 font-medium">Ending</th>
                <th className="pb-3 pr-3 font-medium">Avg Cost</th>
                <th className="pb-3 pr-3 font-medium">Beg Value</th>
                <th className="pb-3 font-medium">End Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wipRowsState.map((row) => (
                <tr key={row.stage} className="align-middle">
                  <td className="py-3 pr-3 font-medium text-slate-800">{row.stage}</td>
                  <td className="py-3 pr-3 text-slate-600">{formatNumber(row.beginning_pairs ?? 0, 0)}</td>
                  <td className="py-3 pr-3 text-slate-600">{formatNumber(row.ending_pairs ?? 0, 0)}</td>
                  <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.avg_cost_per_pair ?? 0)}</td>
                  <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.beginning_value ?? 0)}</td>
                  <td className="py-3 text-slate-600">{formatCurrency(row.ending_value ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-800">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Slipper Manufacturing</p>
            <h1 className="text-3xl font-bold text-slate-900">Inventory & Manufacturing Control</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
            </label>
            <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700" onClick={downloadTemplateForCurrentTab}>Download CSV Template</button>
            <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700" onClick={exportCurrentTab}>Export CSV</button>
          </div>
        </header>

        {importMessage ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {importMessage}
          </div>
        ) : null}

        <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-soft">
          <span className="font-medium text-slate-700">Data source:</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${dataSource === 'database' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {dataSource === 'database' ? 'Live MySQL database' : 'Workbook fallback'}
          </span>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-soft">
            Loading live inventory data from the MySQL API…
          </div>
        ) : null}

        <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft">
          {inventoryTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Inventory Value" value={formatCurrency(totalInventoryValue)} hint="Raw materials + finished goods" accent="text-slate-900" />
          <StatCard label="Low Stock / Reorder Alerts" value={String(reorderAlerts)} hint="Materials needing purchase" accent="text-red-600" />
          <StatCard label="Production Trigger" value={String(productionTriggers)} hint="Finished goods below target" accent="text-amber-600" />
          <StatCard label="COGM / COGS" value={`${formatCurrency(activeFinanceSummary.cogm)} / ${formatCurrency(activeFinanceSummary.cogs)}`} hint="Manufacturing cost and sold cost" accent="text-emerald-600" />
        </section>

        <section className="mb-6">{renderActiveTable()}</section>

        <section className="mb-6 grid gap-6 xl:grid-cols-2">
          <TableCard title="Cost of Goods Manufactured & Sold" subtitle="Workbook finance summary driven by raw materials, WIP, and finished goods">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Beginning raw materials inventory</span><span className="font-semibold">{formatCurrency(summaryStats.rawMaterialBeginning)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>+ Raw material purchases</span><span className="font-semibold">{formatCurrency(summaryStats.rawMaterialPurchases)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>- Ending raw materials inventory</span><span className="font-semibold">{formatCurrency(summaryStats.rawMaterialEnding)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Raw materials used</span><span className="font-semibold text-slate-800">{formatCurrency(summaryStats.rawMaterialsUsed)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Direct labor</span><span className="font-semibold">{formatCurrency(directLabor)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Manufacturing overhead</span><span className="font-semibold">{formatCurrency(manufacturingOverhead)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>COGM</span><span className="font-semibold text-emerald-600">{formatCurrency(activeFinanceSummary.cogm)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>COGS</span><span className="font-semibold text-blue-600">{formatCurrency(activeFinanceSummary.cogs)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Sales revenue</span><span className="font-semibold">{formatCurrency(salesRevenue)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Gross profit</span><span className="font-semibold text-emerald-600">{formatCurrency(grossProfit)}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Gross margin</span><span className="font-semibold text-emerald-600">{formatNumber(grossMarginPct, 1)}%</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Inventory turnover</span><span className="font-semibold">{formatNumber(summaryStats.turnover, 2)}x</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>DIO</span><span className="font-semibold">{formatNumber(summaryStats.dio, 1)} days</span></div>
            </div>
          </TableCard>

          <TableCard title="Formula Guide" subtitle="The Excel workbook logic now reproduced in the app">
            <div className="space-y-3">
              {formulaGuide.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</div>
                  <div className="mt-1 font-medium text-slate-800">{item.formula}</div>
                </div>
              ))}
            </div>
          </TableCard>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Step-by-step workbook process</h3>
          <ol className="space-y-3 text-sm text-slate-700">
            {stepByStep.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

export default App;
