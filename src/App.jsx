import { useEffect, useState } from 'react';
import AuthPanel from './components/AuthPanel';
import RecordModal from './components/RecordModal';
import UserManagement from './components/UserManagement';

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

const parseImportedNumber = (value) => {
  const parsed = Number(String(value ?? '').replace(/[$,\s]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapImportedRawMaterial = (row) => {
  const normalized = normalizeImportedRow(row);

  return {
    code: getRowValue(normalized, ['code', 'material_code']) || '',
    material_name: getRowValue(normalized, ['material', 'material_name', 'name']) || 'Imported Material',
    unit: getRowValue(normalized, ['unit']) || 'unit',
    unit_cost: parseImportedNumber(getRowValue(normalized, ['unit_cost', 'unit_cost_php', 'unit_cost_php_value', 'unit cost'])),
    beginning_stock: parseImportedNumber(getRowValue(normalized, ['beginning_stock', 'beginning_qty', 'beginning_quantity', 'beginning qty'])),
    received: parseImportedNumber(getRowValue(normalized, ['received_qty', 'received', 'received qty'])),
    usage_gross: parseImportedNumber(getRowValue(normalized, ['usage_gross', 'used_qty', 'used', 'used qty'])),
    ending_stock: parseImportedNumber(getRowValue(normalized, ['ending_stock', 'ending_qty', 'ending_quantity', 'ending qty'])),
    ending_value: parseImportedNumber(getRowValue(normalized, ['ending_value', 'inventory_value', 'inventory value'])),
    daily_usage: parseImportedNumber(getRowValue(normalized, ['daily_usage', 'average_daily_usage', 'avg_daily_usage', 'average daily usage'])),
    max_daily_usage: parseImportedNumber(getRowValue(normalized, ['max_daily_usage', 'max daily usage'])),
    lead_time_days: parseImportedNumber(getRowValue(normalized, ['lead_time_days', 'lead_time', 'lead time days'])),
    safety_stock: parseImportedNumber(getRowValue(normalized, ['safety_stock', 'safety stock'])),
    safety_stock_factor: parseImportedNumber(getRowValue(normalized, ['safety_stock_factor', 'safety stock factor'])),
    reorder_point: parseImportedNumber(getRowValue(normalized, ['reorder_point', 'reorder point'])),
    annual_demand: parseImportedNumber(getRowValue(normalized, ['annual_demand', 'annual_usage', 'annual usage'])),
    ordering_cost: parseImportedNumber(getRowValue(normalized, ['ordering_cost', 'order_cost', 'order cost'])),
    holding_cost: parseImportedNumber(getRowValue(normalized, ['holding_cost', 'holding_pct', 'holding_cost_pct', 'holding cost %', 'holding_cost_yr'])),
    eoq: parseImportedNumber(getRowValue(normalized, ['eoq'])),
    status: String(getRowValue(normalized, ['status']) || '').trim().toUpperCase(),
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
  id: row.id ?? null,
  sku: row.sku ?? row.product ?? 'NEW',
  product_name: row.product_name ?? row.style ?? row.product ?? 'Imported Product',
  direct_material_cost: Number(row.direct_material_cost ?? 0),
  direct_labor_cost: Number(row.direct_labor_cost ?? 0),
  overhead_cost: Number(row.overhead_cost ?? 0),
  total_unit_cost: Number(row.total_unit_cost ?? 0),
  selling_price: Number(row.selling_price ?? 0),
  gross_profit: Number(row.gross_profit ?? 0),
  gross_margin_pct: Number(row.gross_margin_pct ?? 0),
  selected_material_ids: Array.isArray(row.selected_material_ids) ? row.selected_material_ids.map(Number) : [],
  materials: Array.isArray(row.materials) ? row.materials.map((material) => ({
    ...material,
    raw_material_id: Number(material.raw_material_id ?? material.id ?? 0),
    unit_cost_snapshot: Number(material.unit_cost_snapshot ?? material.unit_cost ?? 0),
    quantity: Number(material.quantity ?? 1),
  })) : [],
});

const normalizeLiveWipRow = (row = {}) => ({
  ...row,
  stage: row.stage ?? row.batch_name ?? 'Imported Stage',
  sku: row.sku ?? '',
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
    unit_cost: parseImportedNumber(getRowValue(normalized, ['unit_cost', 'unit cost'])),
    beginning_pairs: parseImportedNumber(getRowValue(normalized, ['beginning_pairs', 'beginning pairs'])),
    produced: parseImportedNumber(getRowValue(normalized, ['produced'])),
    sold: parseImportedNumber(getRowValue(normalized, ['sold'])),
    ending_pairs: parseImportedNumber(getRowValue(normalized, ['ending_pairs', 'ending pairs'])),
    inventory_value: parseImportedNumber(getRowValue(normalized, ['inventory_value', 'inventory value'])),
    selling_price: parseImportedNumber(getRowValue(normalized, ['selling_price', 'selling price'])),
    avg_daily_sales: parseImportedNumber(getRowValue(normalized, ['average_daily_sales', 'avg_daily_sales', 'average daily sales'])),
    lead_time_days: parseImportedNumber(getRowValue(normalized, ['lead_time_days', 'lead time days'])),
    safety_stock_days: parseImportedNumber(getRowValue(normalized, ['safety_stock_days', 'safety stock days'])),
    reorder_point: parseImportedNumber(getRowValue(normalized, ['reorder_point', 'reorder point'])),
    days_of_stock: parseImportedNumber(getRowValue(normalized, ['days_of_stock', 'days of stock'])),
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
    stage: getRowValue(normalized, ['stage', 'batch_name']) || 'Imported Stage',
    beginning_pairs: Number(getRowValue(normalized, ['beginning_pairs', 'beginning pairs']) || 0),
    ending_pairs: Number(getRowValue(normalized, ['ending_pairs', 'ending pairs']) || 0),
    avg_cost_per_pair: Number(getRowValue(normalized, ['avg_cost_per_pair', 'avg cost per pair']) || 0),
    beginning_value: Number(getRowValue(normalized, ['beginning_value', 'beginning value']) || 0),
    ending_value: Number(getRowValue(normalized, ['ending_value', 'ending value']) || 0),
  };
};

const rawMaterialHeaders = [
  'Material', 'Unit', 'Unit Cost', 'Beginning Qty', 'Received Qty', 'Used Qty', 'Ending Qty', 'Inventory Value', 'Average Daily Usage', 'Max Daily Usage', 'Lead Time (Days)', 'Safety Stock', 'Safety Stock Factor', 'Reorder Point', 'Annual Usage', 'Order Cost', 'Holding Cost %', 'EOQ', 'Status',
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
        'Safety Stock Factor': row.safety_stock_factor ?? 0,
        'Reorder Point': row.reorder_point ?? 0,
        'Annual Usage': row.annual_usage ?? 0,
        'Order Cost': row.order_cost ?? 0,
        'Holding Cost %': row.holding_pct ?? 0,
        'EOQ': row.eoq ?? 0,
        'Status': row.status ?? '',
      }));
    case 'finished-goods':
      return sourceRows.map((row) => ({
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
        'SKU': row.sku ?? '',
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
let csrfToken = '';
async function apiRequest(endpoint, options = {}) {
  const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}), ...options.headers };
  const response = await fetch(API_BASE + endpoint, { credentials: 'same-origin', ...options, headers });
  const payload = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) { const firstError = payload.errors ? Object.values(payload.errors).flat()[0] : null; throw new Error(firstError || payload.message || ('Request failed: ' + response.status)); }
  return payload;
}
async function fetchJson(endpoint) { const payload = await apiRequest(endpoint); return payload.data ?? payload; }

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
    OPEN: 'bg-blue-100 text-blue-700 border border-blue-200',
    CLOSED: 'bg-slate-100 text-slate-600 border border-slate-200',
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

function BomModal({ open, onClose, form, onChange, onSave, rawMaterials }) {
  if (!open) {
    return null;
  }

  const availableRawMaterials = rawMaterials.filter((material) => String(material.unit ?? '').trim().toLowerCase() !== 'unit');
  const materialCost = availableRawMaterials
    .filter((material) => form.selected_material_ids.includes(Number(material.id)))
    .reduce((sum, material) => sum + Number(material.unit_cost ?? 0) * Number(form.material_quantities?.[material.id] ?? 1), 0);

  const totalCost = materialCost + Number(form.direct_labor_cost ?? 0) + Number(form.overhead_cost ?? 0);
  const grossProfit = Number(form.selling_price ?? 0) - totalCost;
  const grossMargin = Number(form.selling_price ?? 0) > 0 ? (grossProfit / Number(form.selling_price ?? 0)) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">{form.id ? 'Edit BOM & Costing' : 'Add BOM & Costing'}</h3>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700">Close</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Product SKU
            <input type="text" required value={form.sku || ''} onChange={(event) => onChange('sku', event.target.value.toUpperCase())} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="e.g. BASIC-SLIP" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Product Name
            <input
              type="text"
              value={form.product_name}
              onChange={(event) => onChange('product_name', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-0 focus:border-slate-400"
              placeholder="e.g. Basic Slipper"
            />
          </label>

          <div className="md:col-span-2 rounded-xl border border-slate-200 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-700">Select raw materials</p>
            <div className="grid gap-2 md:grid-cols-2">
              {availableRawMaterials.map((material) => {
                const checked = form.selected_material_ids.includes(Number(material.id));
                return (
                  <label key={material.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onChange('selected_material_ids', checked ? form.selected_material_ids.filter((id) => id !== Number(material.id)) : [...form.selected_material_ids, Number(material.id)])}
                    />
                    <span className="min-w-0 flex-1">{material.material_name}<span className="ml-1 text-xs text-slate-400">({material.unit})</span></span>
                    {checked ? <input aria-label={material.material_name + ' quantity per unit'} type="number" min="0.001" step="0.001" value={form.material_quantities?.[material.id] ?? 1} onChange={(event) => onChange('material_quantities', { ...form.material_quantities, [material.id]: Number(event.target.value || 0) })} className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm" /> : null}
                  </label>
                );
              })}
            </div>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Material Cost
            <input
              type="number"
              value={materialCost}
              readOnly
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Labor Cost
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.direct_labor_cost}
              onChange={(event) => onChange('direct_labor_cost', Number(event.target.value || 0))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Overhead
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.overhead_cost}
              onChange={(event) => onChange('overhead_cost', Number(event.target.value || 0))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Total Cost
            <input
              type="number"
              value={totalCost}
              readOnly
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Selling Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.selling_price}
              onChange={(event) => onChange('selling_price', Number(event.target.value || 0))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Gross Profit
            <input
              type="number"
              value={grossProfit}
              readOnly
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Gross Margin
            <input
              type="number"
              value={grossMargin}
              readOnly
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Cancel</button>
          <button type="button" onClick={onSave} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">{form.id ? 'Save Changes' : 'Add BOM'}</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ open, onClose, onConfirm, title, itemName }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">Are you sure you want to delete <span className="font-semibold text-slate-800">{itemName}</span>? This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Cancel</button>
          <button type="button" onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [authError, setAuthError] = useState('');
  const [recordModal, setRecordModal] = useState(null);
  const [recordForm, setRecordForm] = useState(null);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [rawMaterials, setRawMaterials] = useState(rawMaterialRows);
  const [finishedGoods, setFinishedGoods] = useState(finishedGoodRows);
  const [productCatalog, setProductCatalog] = useState([]);
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
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [bomDeleteOpen, setBomDeleteOpen] = useState(false);
  const [finishedGoodDeleteRow, setFinishedGoodDeleteRow] = useState(null);
  const [bomEditingId, setBomEditingId] = useState(null);
  const [bomDeleteRow, setBomDeleteRow] = useState(null);
  const [bomForm, setBomForm] = useState({
    id: null,
    sku: '',
    product_name: '',
    selected_material_ids: [],
    material_quantities: {},
    direct_labor_cost: 0,
    overhead_cost: 0,
    selling_price: 0,
  });

  const getBomFormTotals = (formState = bomForm) => {
    const selectedMaterialCost = rawMaterials
      .filter((material) => formState.selected_material_ids.includes(Number(material.id)))
      .reduce((sum, material) => sum + Number(material.unit_cost ?? 0) * Number(formState.material_quantities?.[material.id] ?? 1), 0);

    const laborCost = Number(formState.direct_labor_cost ?? 0);
    const overheadCost = Number(formState.overhead_cost ?? 0);
    const sellingPrice = Number(formState.selling_price ?? 0);
    const totalCost = selectedMaterialCost + laborCost + overheadCost;
    const grossProfit = sellingPrice - totalCost;
    const grossMargin = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;

    return { selectedMaterialCost, totalCost, grossProfit, grossMargin };
  };

  const openBomAddModal = () => {
    setBomEditingId(null);
    setBomForm({
      id: null,
      sku: '',
      product_name: '',
      selected_material_ids: [],
      material_quantities: {},
      direct_labor_cost: 0,
      overhead_cost: 0,
      selling_price: 0,
    });
    setBomModalOpen(true);
  };

  const openBomEditModal = (row) => {
    const selectedMaterialIds = Array.isArray(row.selected_material_ids) && row.selected_material_ids.length > 0
      ? row.selected_material_ids.map(Number)
      : Array.isArray(row.materials)
        ? row.materials.map((material) => Number(material.raw_material_id ?? material.id ?? 0)).filter(Boolean)
        : [];

    setBomEditingId(Number(row.id ?? row.product_id ?? 0));
    setBomForm({
      id: Number(row.id ?? row.product_id ?? 0),
      sku: row.sku ?? '',
      product_name: row.product_name ?? '',
      selected_material_ids: selectedMaterialIds,
      material_quantities: Object.fromEntries((row.materials || []).map((material) => [Number(material.raw_material_id), Number(material.quantity ?? 1)])),
      direct_labor_cost: Number(row.direct_labor_cost ?? 0),
      overhead_cost: Number(row.overhead_cost ?? 0),
      selling_price: Number(row.selling_price ?? 0),
    });
    setBomModalOpen(true);
  };

  const saveBomForm = async () => {
    if (!bomForm.product_name.trim()) {
      setImportMessage('Please enter a product name before saving the BOM.');
      return;
    }

    if (!bomForm.selected_material_ids.length) {
      setImportMessage('Please select at least one raw material for the BOM.');
      return;
    }

    const materialPayload = bomForm.selected_material_ids.map((rawMaterialId) => {
      const material = rawMaterials.find((item) => Number(item.id) === Number(rawMaterialId));
      return {
        raw_material_id: Number(rawMaterialId),
        material_name: material?.material_name ?? '',
        quantity: Number(bomForm.material_quantities?.[rawMaterialId] ?? 1),
        unit_cost_snapshot: Number(material?.unit_cost ?? 0),
      };
    });

    const payload = {
      action: bomEditingId ? 'update' : 'create',
      id: bomEditingId || null,
      sku: bomForm.sku || bomForm.product_name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
      product_name: bomForm.product_name,
      direct_labor_cost: Number(bomForm.direct_labor_cost ?? 0),
      overhead_cost: Number(bomForm.overhead_cost ?? 0),
      selling_price: Number(bomForm.selling_price ?? 0),
      waste_percentage: 0,
      materials: materialPayload,
    };

    try {
      await apiRequest('/products' + (bomEditingId ? '/' + bomEditingId : ''), { method: bomEditingId ? 'PUT' : 'POST', body: JSON.stringify(payload) });

      await refreshDashboardData();
      setBomModalOpen(false);
      setBomEditingId(null);
      setBomForm({
        id: null,
        sku: '',
        product_name: '',
        selected_material_ids: [],
        material_quantities: {},
        direct_labor_cost: 0,
        overhead_cost: 0,
        selling_price: 0,
      });
      setImportMessage('BOM item saved successfully.');
    } catch (saveError) {
      setImportMessage(saveError.message || 'Unable to save BOM item.');
    }
  };

  const deleteBomItem = async (row) => {
    try {
      await apiRequest('/products/' + Number(row.id ?? row.product_id ?? 0), { method: 'DELETE' });

      await refreshDashboardData();
      setBomDeleteOpen(false);
      setBomDeleteRow(null);
      setImportMessage('BOM item deleted successfully.');
    } catch (deleteError) {
      setImportMessage(deleteError.message || 'Unable to delete BOM item.');
    }
  };

  const refreshDashboardData = async () => {

    try {
      const [rawData, finishedData, costingData, productData, wipData, financeData] = await Promise.all([fetchJson('/raw-materials'), fetchJson('/finished-goods'), fetchJson('/bom-costing'), fetchJson('/products'), fetchJson('/wip'), fetchJson('/financials/cogm-cogs')]);
      setRawMaterials((rawData || []).map(normalizeLiveRawMaterialRow));
      setFinishedGoods((finishedData || []).map(normalizeLiveFinishedGoodRow));
      setCostingRows((costingData || []).map(normalizeLiveCostingRow));
      setProductCatalog(productData || []);
      setWipRowsState((wipData || []).map(normalizeLiveWipRow));
      setDataSource('database'); setError('');

      if (financeData) setFinanceSummary(financeData);
      return { rawData, finishedData, costingData, productData, wipData, financeData };
    } catch (loadError) {
      if (loadError.message.includes('401')) { setUser(null); return null; }
      setDataSource('workbook'); setError(loadError.message || 'Live inventory data could not be loaded.');
      return null;
    }
  };

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        const response = await fetch(API_BASE + '/auth/csrf', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        const csrf = await response.json(); csrfToken = csrf.csrf_token || ''; setSetupRequired(Boolean(csrf.setup_required));
        try { const session = await fetchJson('/auth/me'); if (active) setUser(session.user); } catch {}
      } catch { if (active) setError('Unable to connect to the Laravel API. Start the backend and refresh this page.'); }
      if (active) setAuthReady(true);
    };
    initialize(); return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let active = true; refreshDashboardData().finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  const handleAuthSubmit = async (credentials) => {
    setAuthError('');
    try { const payload = await apiRequest('/auth/' + (setupRequired ? 'register' : 'login'), { method: 'POST', body: JSON.stringify(credentials) }); setUser(payload.user); setSetupRequired(false); }
    catch (error) { setAuthError(error.message); }
  };
  const handleLogout = async () => { try { await apiRequest('/auth/logout', { method: 'POST' }); } finally { setUser(null); try { const response = await fetch(API_BASE + '/auth/csrf', { credentials: 'same-origin' }); const payload = await response.json(); csrfToken = payload.csrf_token || ''; setSetupRequired(Boolean(payload.setup_required)); } catch {} } };
  const canWrite = user && ['admin', 'manager'].includes(user.role);
  const canDelete = user && ['admin', 'manager'].includes(user.role);
  const recordConfig = {
    'raw-materials': { title: 'raw material', endpoint: '/raw-materials', fields: [['material_name','Material name'],['category','Category'],['unit','Unit'],['unit_cost','Unit cost','number'],['beginning_stock','Beginning stock','number'],['received','Received','number'],['usage_gross','Used','number'],['daily_usage','Daily usage','number'],['annual_demand','Annual demand','number'],['lead_time_days','Lead time (days)','number'],['safety_stock_factor','Safety stock factor','number'],['holding_cost','Holding cost','number'],['ordering_cost','Ordering cost','number']] },
    'finished-goods': { title: 'finished good', endpoint: '/finished-goods', fields: [['sku','SKU'],['product_name','Product name'],['size','Size'],['unit_cost','Unit cost','number'],['beginning_stock','Beginning stock','number'],['production','Produced','number'],['sold','Sold','number'],['selling_price','Selling price','number'],['monthly_sales_rate','Monthly sales rate','number'],['lead_time','Lead time (days)','number'],['buffer','Buffer days','number'],['safety_stock','Safety stock','number']] },
    wip: { title: 'WIP stage', endpoint: '/wip', fields: [['batch_name','Stage'],['beginning_pairs','Beginning pairs','number'],['ending_pairs','Ending pairs','number'],['avg_cost_per_pair','Average cost per pair','number'],['status','Status','select']] },
  };
  const openRecordEditor = (tab, row = null) => {
    const config = recordConfig[tab]; const fields = config.fields.map(([name,label,type]) => ({name,label,type}));
    if (tab === 'wip') { fields[4].options = [{value:'OPEN',label:'Open'},{value:'CLOSED',label:'Closed'}]; }
    const values = row ? {...row} : Object.fromEntries(fields.map((f) => [f.name, f.name === 'status' ? 'OPEN' : f.type === 'number' ? 0 : '']));
    setRecordModal({config,fields}); setRecordForm(values);
  };
  const saveRecord = async (event) => {
    event.preventDefault(); const config = recordModal.config;
    try { await apiRequest(config.endpoint + (recordForm.id ? '/' + recordForm.id : ''), {method:recordForm.id?'PUT':'POST',body:JSON.stringify(recordForm)}); await refreshDashboardData(); setRecordModal(null); setRecordForm(null); setImportMessage(config.title + ' saved.'); }
    catch (error) { setImportMessage(error.message); }
  };
  const deleteRecord = async (tab,row,confirmed=false) => {
    const config=recordConfig[tab];
    if (tab === 'finished-goods' && !confirmed) { setFinishedGoodDeleteRow(row); return; }
    if (!confirmed && !window.confirm('Delete this ' + config.title + '? This cannot be undone.')) return;
    try {
      await apiRequest(config.endpoint + '/' + row.id,{method:'DELETE'});
      await refreshDashboardData();
      if (tab === 'finished-goods') { setFinishedGoodDeleteRow(null); }
    }
    catch(error) { setImportMessage(error.message); }
  };

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
        reorder_point: Number(row.reorder_point ?? 0),
        days_of_stock: Number(row.days_of_stock ?? 0),
        status: row.status || 'OK',
      }));
    }

    if (tab === 'bom-costing') {
      endpoint = '/products';
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
        batch_name: row.stage || 'Imported Stage',
        beginning_pairs: Number(row.beginning_pairs ?? 0),
        ending_pairs: Number(row.ending_pairs ?? 0),
        avg_cost_per_pair: Number(row.avg_cost_per_pair ?? 0),
        status: 'OPEN',
      }));
    }

    return apiRequest(endpoint, { method: 'POST', body: JSON.stringify({ rows: payload }) });
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
        <TableCard title="Raw Materials Inventory" subtitle="Inventory levels and replenishment calculations">
          <div className="mb-4 flex justify-end">{canWrite ? <button onClick={() => openRecordEditor('raw-materials')} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Add material</button> : null}</div>
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
                  {canWrite ? <th className="pb-3 font-medium">Actions</th> : null}
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
                    {canWrite ? <td className="py-3"><button onClick={() => openRecordEditor('raw-materials',row)} className="rounded border px-2 py-1 text-xs">Edit</button>{canDelete ? <button onClick={() => deleteRecord('raw-materials',row)} className="ml-2 rounded border border-red-200 px-2 py-1 text-xs text-red-700">Delete</button> : null}</td> : null}
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
        <TableCard title="Finished Goods" subtitle="Stock levels, value, and reorder planning">
          <div className="mb-4 flex justify-end">{canWrite ? <button onClick={() => openRecordEditor('finished-goods')} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Add finished good</button> : null}</div>
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
                  <th className="pb-3 pr-3 font-medium">Inventory Value</th>
                  <th className="pb-3 pr-3 font-medium">Unit Cost</th>
                  <th className="pb-3 pr-3 font-medium">Selling Price</th>
                  <th className="pb-3 pr-3 font-medium">Reorder Pt.</th>
                  <th className="pb-3 pr-3 font-medium">Days Stock</th>
                  <th className="pb-3 font-medium">Status</th>
                  {canWrite ? <th className="pb-3 font-medium">Actions</th> : null}
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
                    <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.inventory_value ?? row.ending_value ?? 0)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.unit_cost ?? 0)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.selling_price ?? 0)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.reorder_point ?? 0, 1)}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatNumber(row.days_of_stock ?? 0, 1)}</td>
                    <td className="py-3"><StatusBadge status={row.status} /></td>
                    {canWrite ? <td className="py-3"><button onClick={() => openRecordEditor('finished-goods',row)} className="rounded border px-2 py-1 text-xs">Edit</button>{canDelete ? <button onClick={() => deleteRecord('finished-goods',row)} className="ml-2 rounded border border-red-200 px-2 py-1 text-xs text-red-700">Delete</button> : null}</td> : null}
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
          <div className="mb-4 flex justify-end">
            {canWrite ? <button type="button" onClick={openBomAddModal} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Add BOM</button> : null}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="pb-3 pr-3 font-medium">Actions</th>
                  <th className="pb-3 pr-3 font-medium">SKU</th>
                  <th className="pb-3 pr-3 font-medium">Product</th>
                  <th className="pb-3 pr-3 font-medium">BOM Materials / Qty</th>
                  <th className="pb-3 pr-3 font-medium">Material Cost</th>
                  <th className="pb-3 pr-3 font-medium">Labor</th>
                  <th className="pb-3 pr-3 font-medium">Overhead</th>
                  <th className="pb-3 pr-3 font-medium">Total Cost</th>
                  <th className="pb-3 pr-3 font-medium">Selling Price</th>
                  <th className="pb-3 pr-3 font-medium">Gross Profit</th>
                  <th className="pb-3 font-medium">Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {costingRows.length === 0 ? <tr><td colSpan={11} className="py-12 text-center"><p className="font-medium text-slate-800">No BOM records yet</p><p className="mt-1 text-sm text-slate-500">Use Add BOM to create a product recipe and costing.</p></td></tr> : costingRows.map((row) => (
                  <tr key={String(row.id ?? row.sku ?? row.product_name ?? row.style ?? 'bom-item')} className="align-middle">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        {canWrite ? <button type="button" onClick={() => openBomEditModal(row)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">Edit</button> : null}
                        {canDelete ? <button type="button" onClick={() => { setBomDeleteRow(row); setBomDeleteOpen(true); }} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700">Delete</button> : null}
                      </div>
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs text-slate-600">{row.sku}</td>
                    <td className="py-3 pr-3 font-medium text-slate-800">{row.product_name || row.style}</td>
                    <td className="py-3 pr-3 text-slate-600"><div className="space-y-1">{(row.materials || []).map((material) => <div key={material.raw_material_id}>{material.material_name} × {formatNumber(material.quantity, 3)} {material.unit || ''}</div>)}</div></td>
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
      <TableCard title="Work-in-Process" subtitle="Plant-wide production stages; raw material usage remains managed through BOM & Costing">
        <div className="mb-4 flex justify-end">{canWrite ? <button onClick={() => openRecordEditor('wip')} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Add WIP stage</button> : null}</div>
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
                <th className="pb-3 pr-3 font-medium">Status</th>
                {canWrite ? <th className="pb-3 font-medium">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wipRowsState.map((row) => (
                <tr key={row.id ?? row.stage} className="align-middle">
                  <td className="py-3 pr-3 font-medium text-slate-800">{row.stage}</td>
                  <td className="py-3 pr-3 text-slate-600">{formatNumber(row.beginning_pairs ?? 0, 0)}</td>
                  <td className="py-3 pr-3 text-slate-600">{formatNumber(row.ending_pairs ?? 0, 0)}</td>
                  <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.avg_cost_per_pair ?? 0)}</td>
                  <td className="py-3 pr-3 text-slate-600">{formatCurrency(row.beginning_value ?? 0)}</td>
                  <td className="py-3 text-slate-600">{formatCurrency(row.ending_value ?? 0)}</td>
                  <td className="py-3 pr-3"><StatusBadge status={row.status ?? 'OPEN'} /></td>
                  {canWrite ? <td className="py-3"><button onClick={() => openRecordEditor('wip',row)} className="rounded border px-2 py-1 text-xs">Edit</button>{canDelete ? <button onClick={() => deleteRecord('wip',row)} className="ml-2 rounded border border-red-200 px-2 py-1 text-xs text-red-700">Delete</button> : null}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>
    );
  };

  if (!authReady) return <div className="flex min-h-screen items-center justify-center">Connecting to inventory…</div>;
  if (!user) return <AuthPanel setupRequired={setupRequired} error={authError || error} onSubmit={handleAuthSubmit} />;

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-800">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Slipper Manufacturing</p>
            <h1 className="text-3xl font-bold text-slate-900">Inventory & Manufacturing Control</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3"><span className="text-sm text-slate-600">{user.name} · {user.role}</span>{user.role === 'admin' ? <button onClick={() => setUserManagementOpen(true)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">Manage users</button> : null}<button onClick={handleLogout} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">Sign out</button>
            {canWrite && activeTab !== 'bom-costing' ? <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
            </label> : null}
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

        {userManagementOpen ? <UserManagement request={apiRequest} onClose={() => setUserManagementOpen(false)} /> : null}
        <RecordModal title={recordModal?.config.title} fields={recordModal?.fields || []} value={recordForm} onChange={(field,value)=>setRecordForm((current)=>({...current,[field]:value}))} onClose={()=>{setRecordModal(null);setRecordForm(null);}} onSave={saveRecord} />
        <BomModal
          open={bomModalOpen}
          onClose={() => setBomModalOpen(false)}
          form={bomForm}
          rawMaterials={rawMaterials}
          onChange={(field, value) => {
            if (field === 'selected_material_ids') {
              setBomForm((current) => ({ ...current, selected_material_ids: value, material_quantities: { ...current.material_quantities, ...Object.fromEntries(value.map((id) => [id, current.material_quantities?.[id] ?? 1])) } }));
              return;
            }

            if (field === 'material_quantities') {
              setBomForm((current) => ({ ...current, material_quantities: value }));
              return;
            }

            setBomForm((current) => ({ ...current, [field]: value }));
          }}
          onSave={saveBomForm}
        />

        <ConfirmDeleteModal
          open={bomDeleteOpen}
          onClose={() => { setBomDeleteOpen(false); setBomDeleteRow(null); }}
          title="Delete BOM item"
          itemName={bomDeleteRow?.product_name ?? 'this BOM item'}
          onConfirm={() => deleteBomItem(bomDeleteRow)}
        />

        <ConfirmDeleteModal
          open={Boolean(finishedGoodDeleteRow)}
          onClose={() => setFinishedGoodDeleteRow(null)}
          title="Delete finished good"
          itemName={finishedGoodDeleteRow ? `${finishedGoodDeleteRow.product_name || finishedGoodDeleteRow.style || 'this finished good'}${finishedGoodDeleteRow.sku ? ` (${finishedGoodDeleteRow.sku})` : ''}` : 'this finished good'}
          onConfirm={() => deleteRecord('finished-goods', finishedGoodDeleteRow, true)}
        />

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
