<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/db.php';

function jsonResponse($payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

function parseJsonBody(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function computeRawMaterialMetrics(array $item): array
{
    $unitCost = (float) ($item['unit_cost'] ?? 0);
    $beginningStock = (float) ($item['beginning_stock'] ?? 0);
    $received = (float) ($item['received'] ?? 0);
    $usageGross = (float) ($item['usage_gross'] ?? 0);
    $dailyUsage = (float) ($item['daily_usage'] ?? 0);
    $leadTime = (float) ($item['lead_time_days'] ?? 0);
    $safetyStockFactor = (float) ($item['safety_stock_factor'] ?? 0);
    $annualDemand = (float) ($item['annual_demand'] ?? 0);
    $orderingCost = (float) ($item['ordering_cost'] ?? 0);
    $holdingCost = (float) ($item['holding_cost'] ?? 0);

    $endingStock = $beginningStock + $received - $usageGross;
    $safetyStock = $dailyUsage * $safetyStockFactor;
    $reorderPoint = ($dailyUsage * $leadTime) + $safetyStock;
    $endingValue = $endingStock * $unitCost;
    $eoq = $annualDemand > 0 && $orderingCost > 0 && $holdingCost > 0
        ? sqrt((2 * $annualDemand * $orderingCost) / ($holdingCost * $unitCost))
        : 0;
    $status = $endingStock <= $reorderPoint ? 'REORDER' : 'OK';

    return [
        'ending_stock' => round($endingStock, 2),
        'ending_value' => round($endingValue, 2),
        'reorder_point' => round($reorderPoint, 2),
        'eoq' => round($eoq, 2),
        'status' => $status,
    ];
}

function computeFinishedGoodsMetrics(array $item): array
{
    $beginningStock = (float) ($item['beginning_stock'] ?? 0);
    $production = (float) ($item['production'] ?? 0);
    $sold = (float) ($item['sold'] ?? 0);
    $safetyStock = (float) ($item['safety_stock'] ?? 0);

    $endingStock = $beginningStock + $production - $sold;
    $status = $endingStock <= $safetyStock ? 'PRODUCE' : 'OK';

    return [
        'ending_stock' => round($endingStock, 2),
        'status' => $status,
    ];
}

function normalizeImportRows(array $payload): array
{
    if (array_key_exists('rows', $payload) && is_array($payload['rows'])) {
        return $payload['rows'];
    }

    if (array_is_list($payload)) {
        return $payload;
    }

    return [$payload];
}

function deduplicateRowsByKey(array $rows, string $primaryKey, string $secondaryKey = ''): array
{
    $seen = [];
    $result = [];

    foreach ($rows as $row) {
        if (!is_array($row)) {
            continue;
        }

        $candidate = trim((string) ($row[$primaryKey] ?? $row[$secondaryKey] ?? ''));

        if ($candidate === '') {
            continue;
        }

        $normalized = strtolower($candidate);

        if (isset($seen[$normalized])) {
            continue;
        }

        $seen[$normalized] = true;
        $result[] = $row;
    }

    return $result;
}

function upsertRawMaterial(PDO $pdo, array $row): void
{
    $materialName = (string) ($row['material_name'] ?? $row['name'] ?? '');

    if ($materialName === '') {
        return;
    }

    $unitCost = (float) ($row['unit_cost'] ?? 0);
    $beginningStock = (float) ($row['beginning_stock'] ?? $row['beginning_qty'] ?? 0);
    $received = (float) ($row['received'] ?? 0);
    $usageGross = (float) ($row['usage_gross'] ?? $row['used'] ?? 0);
    $dailyUsage = (float) ($row['daily_usage'] ?? $row['avg_daily_usage'] ?? 0);
    $leadTimeDays = (float) ($row['lead_time_days'] ?? $row['lead_time'] ?? 0);
    $safetyStockFactor = (float) ($row['safety_stock_factor'] ?? $row['holding_pct'] ?? 0);
    $annualDemand = (float) ($row['annual_demand'] ?? $row['annual_usage'] ?? 0);
    $orderingCost = (float) ($row['ordering_cost'] ?? $row['order_cost'] ?? 0);
    $holdingCost = (float) ($row['holding_cost'] ?? $row['holding_pct'] ?? 0);

    $calculated = computeRawMaterialMetrics([
        'unit_cost' => $unitCost,
        'beginning_stock' => $beginningStock,
        'received' => $received,
        'usage_gross' => $usageGross,
        'daily_usage' => $dailyUsage,
        'lead_time_days' => $leadTimeDays,
        'safety_stock_factor' => $safetyStockFactor,
        'annual_demand' => $annualDemand,
        'ordering_cost' => $orderingCost,
        'holding_cost' => $holdingCost,
    ]);

    $status = (string) ($row['status'] ?? $calculated['status']);
    $endingStock = (float) ($row['ending_stock'] ?? $calculated['ending_stock']);
    $endingValue = (float) ($row['ending_value'] ?? $calculated['ending_value']);
    $reorderPoint = (float) ($row['reorder_point'] ?? $calculated['reorder_point']);
    $eoq = (float) ($row['eoq'] ?? $calculated['eoq']);

    $stmt = $pdo->prepare(
        'INSERT INTO raw_materials (material_name, category, unit, unit_cost, beginning_stock, received, usage_gross, ending_stock, ending_value, daily_usage, annual_demand, lead_time_days, safety_stock_factor, reorder_point, holding_cost, ordering_cost, eoq, status)
         VALUES (:material_name, :category, :unit, :unit_cost, :beginning_stock, :received, :usage_gross, :ending_stock, :ending_value, :daily_usage, :annual_demand, :lead_time_days, :safety_stock_factor, :reorder_point, :holding_cost, :ordering_cost, :eoq, :status)
         ON DUPLICATE KEY UPDATE
            category = VALUES(category),
            unit = VALUES(unit),
            unit_cost = VALUES(unit_cost),
            beginning_stock = VALUES(beginning_stock),
            received = VALUES(received),
            usage_gross = VALUES(usage_gross),
            ending_stock = VALUES(ending_stock),
            ending_value = VALUES(ending_value),
            daily_usage = VALUES(daily_usage),
            annual_demand = VALUES(annual_demand),
            lead_time_days = VALUES(lead_time_days),
            safety_stock_factor = VALUES(safety_stock_factor),
            reorder_point = VALUES(reorder_point),
            holding_cost = VALUES(holding_cost),
            ordering_cost = VALUES(ordering_cost),
            eoq = VALUES(eoq),
            status = VALUES(status),
            updated_at = CURRENT_TIMESTAMP'
    );

    $stmt->execute([
        ':material_name' => $materialName,
        ':category' => (string) ($row['category'] ?? 'General'),
        ':unit' => (string) ($row['unit'] ?? 'unit'),
        ':unit_cost' => $unitCost,
        ':beginning_stock' => $beginningStock,
        ':received' => $received,
        ':usage_gross' => $usageGross,
        ':ending_stock' => $endingStock,
        ':ending_value' => $endingValue,
        ':daily_usage' => $dailyUsage,
        ':annual_demand' => $annualDemand,
        ':lead_time_days' => $leadTimeDays,
        ':safety_stock_factor' => $safetyStockFactor,
        ':reorder_point' => $reorderPoint,
        ':holding_cost' => $holdingCost,
        ':ordering_cost' => $orderingCost,
        ':eoq' => $eoq,
        ':status' => $status,
    ]);
}

function upsertFinishedGood(PDO $pdo, array $row): void
{
    $sku = (string) ($row['sku'] ?? '');

    if ($sku === '') {
        return;
    }

    $productName = (string) ($row['product_name'] ?? $row['style'] ?? $row['sku']);
    $size = (string) ($row['size'] ?? 'N/A');
    $unitCost = (float) ($row['unit_cost'] ?? 0);
    $beginningStock = (float) ($row['beginning_stock'] ?? $row['beginning_pairs'] ?? 0);
    $production = (float) ($row['production'] ?? $row['produced'] ?? 0);
    $sold = (float) ($row['sold'] ?? 0);
    $sellingPrice = (float) ($row['selling_price'] ?? 0);
    $monthlySalesRate = (float) ($row['monthly_sales_rate'] ?? $row['avg_daily_sales'] ?? 0);
    $leadTime = (float) ($row['lead_time'] ?? $row['lead_time_days'] ?? 0);
    $buffer = (float) ($row['buffer'] ?? $row['safety_stock_days'] ?? 0);
    $safetyStock = (float) ($row['safety_stock'] ?? $row['reorder_point'] ?? 0);

    $calculated = computeFinishedGoodsMetrics([
        'beginning_stock' => $beginningStock,
        'production' => $production,
        'sold' => $sold,
        'safety_stock' => $safetyStock,
    ]);

    $endingStock = (float) ($row['ending_stock'] ?? $calculated['ending_stock']);
    $endingValue = (float) ($row['ending_value'] ?? ($endingStock * $unitCost));
    $reorderPoint = (float) ($row['reorder_point'] ?? (($monthlySalesRate > 0 ? $monthlySalesRate * ($leadTime + $buffer) : $safetyStock)));
    $daysOfStock = $monthlySalesRate > 0 ? ($endingStock / $monthlySalesRate) : 0;
    $status = (string) ($row['status'] ?? $calculated['status']);

    $stmt = $pdo->prepare(
        'INSERT INTO finished_goods (sku, product_name, size, unit_cost, beginning_stock, production, sold, ending_stock, ending_value, selling_price, monthly_sales_rate, lead_time, buffer, safety_stock, reorder_point, days_of_stock, status)
         VALUES (:sku, :product_name, :size, :unit_cost, :beginning_stock, :production, :sold, :ending_stock, :ending_value, :selling_price, :monthly_sales_rate, :lead_time, :buffer, :safety_stock, :reorder_point, :days_of_stock, :status)
         ON DUPLICATE KEY UPDATE
            product_name = VALUES(product_name),
            size = VALUES(size),
            unit_cost = VALUES(unit_cost),
            beginning_stock = VALUES(beginning_stock),
            production = VALUES(production),
            sold = VALUES(sold),
            ending_stock = VALUES(ending_stock),
            ending_value = VALUES(ending_value),
            selling_price = VALUES(selling_price),
            monthly_sales_rate = VALUES(monthly_sales_rate),
            lead_time = VALUES(lead_time),
            buffer = VALUES(buffer),
            safety_stock = VALUES(safety_stock),
            reorder_point = VALUES(reorder_point),
            days_of_stock = VALUES(days_of_stock),
            status = VALUES(status),
            updated_at = CURRENT_TIMESTAMP'
    );

    $stmt->execute([
        ':sku' => $sku,
        ':product_name' => $productName,
        ':size' => $size,
        ':unit_cost' => $unitCost,
        ':beginning_stock' => $beginningStock,
        ':production' => $production,
        ':sold' => $sold,
        ':ending_stock' => $endingStock,
        ':ending_value' => $endingValue,
        ':selling_price' => $sellingPrice,
        ':monthly_sales_rate' => $monthlySalesRate,
        ':lead_time' => $leadTime,
        ':buffer' => $buffer,
        ':safety_stock' => $safetyStock,
        ':reorder_point' => $reorderPoint,
        ':days_of_stock' => $daysOfStock,
        ':status' => $status,
    ]);
}

function upsertProduct(PDO $pdo, array $row): void
{
    $sku = (string) ($row['sku'] ?? $row['product_name'] ?? '');

    if ($sku === '') {
        return;
    }

    $name = (string) ($row['product_name'] ?? $row['style'] ?? $sku);
    $stmt = $pdo->prepare(
        'INSERT INTO products (sku, product_name, selling_price, direct_labor_cost, overhead_cost, waste_percentage, description)
         VALUES (:sku, :product_name, :selling_price, :direct_labor_cost, :overhead_cost, :waste_percentage, :description)
         ON DUPLICATE KEY UPDATE
            product_name = VALUES(product_name),
            selling_price = VALUES(selling_price),
            direct_labor_cost = VALUES(direct_labor_cost),
            overhead_cost = VALUES(overhead_cost),
            waste_percentage = VALUES(waste_percentage),
            updated_at = CURRENT_TIMESTAMP'
    );

    $stmt->execute([
        ':sku' => $sku,
        ':product_name' => $name,
        ':selling_price' => (float) ($row['selling_price'] ?? 0),
        ':direct_labor_cost' => (float) ($row['direct_labor_cost'] ?? 0),
        ':overhead_cost' => (float) ($row['overhead_cost'] ?? 0),
        ':waste_percentage' => (float) ($row['waste_percentage'] ?? $row['gross_margin_pct'] ?? 0),
        ':description' => (string) ($row['description'] ?? ''),
    ]);
}

function upsertWip(PDO $pdo, array $row): void
{
    $productName = (string) ($row['product_name'] ?? $row['style'] ?? $row['stage'] ?? '');
    $productId = null;

    if ($productName !== '') {
        $productStmt = $pdo->prepare('SELECT id FROM products WHERE sku = :sku OR product_name = :product_name LIMIT 1');
        $productStmt->execute([
            ':sku' => $productName,
            ':product_name' => $productName,
        ]);
        $productId = $productStmt->fetchColumn();
    }

    if ($productId === false || $productId === null) {
        $productId = $pdo->query('SELECT id FROM products ORDER BY id LIMIT 1')->fetchColumn();
    }

    $batchName = (string) ($row['batch_name'] ?? $row['stage'] ?? 'Batch');
    $stmt = $pdo->prepare(
        'INSERT INTO work_in_progress (product_id, batch_name, quantity_in_process, direct_material_cost, direct_labor_cost, overhead_cost, status)
         VALUES (:product_id, :batch_name, :quantity_in_process, :direct_material_cost, :direct_labor_cost, :overhead_cost, :status)
         ON DUPLICATE KEY UPDATE
            quantity_in_process = VALUES(quantity_in_process),
            direct_material_cost = VALUES(direct_material_cost),
            direct_labor_cost = VALUES(direct_labor_cost),
            overhead_cost = VALUES(overhead_cost),
            status = VALUES(status),
            updated_at = CURRENT_TIMESTAMP'
    );

    $stmt->execute([
        ':product_id' => (int) $productId,
        ':batch_name' => $batchName,
        ':quantity_in_process' => (float) ($row['quantity_in_process'] ?? $row['beginning_pairs'] ?? 0),
        ':direct_material_cost' => (float) ($row['direct_material_cost'] ?? $row['beginning_value'] ?? 0),
        ':direct_labor_cost' => (float) ($row['direct_labor_cost'] ?? $row['avg_cost_per_pair'] ?? 0),
        ':overhead_cost' => (float) ($row['overhead_cost'] ?? $row['ending_value'] ?? 0),
        ':status' => (string) ($row['status'] ?? 'OPEN'),
    ]);
}

function calculateBomCostingSnapshot(PDO $pdo): array
{
    $productSql = "
        SELECT
            p.id,
            p.sku,
            p.product_name,
            p.selling_price,
            p.direct_labor_cost,
            p.overhead_cost,
            p.waste_percentage
        FROM products p
        ORDER BY p.product_name ASC
    ";

    $productRows = $pdo->query($productSql)->fetchAll();
    $result = [];

    foreach ($productRows as $productRow) {
        $materialSql = "
            SELECT
                bi.id,
                bi.product_id,
                bi.raw_material_id,
                rm.material_name,
                bi.quantity,
                bi.unit_cost_snapshot,
                ROUND(bi.quantity * bi.unit_cost_snapshot, 2) AS material_total
            FROM bom_items bi
            INNER JOIN raw_materials rm ON rm.id = bi.raw_material_id
            WHERE bi.product_id = :product_id
            ORDER BY rm.material_name ASC
        ";

        $materialStmt = $pdo->prepare($materialSql);
        $materialStmt->execute([':product_id' => (int) $productRow['id']]);
        $materialRows = $materialStmt->fetchAll();

        $directMaterialCost = 0.0;
        $materialDetails = [];

        foreach ($materialRows as $materialRow) {
            $materialValue = (float) ($materialRow['material_total'] ?? 0);
            $directMaterialCost += $materialValue;
            $materialDetails[] = [
                'id' => (int) $materialRow['id'],
                'raw_material_id' => (int) $materialRow['raw_material_id'],
                'material_name' => $materialRow['material_name'],
                'quantity' => (float) ($materialRow['quantity'] ?? 0),
                'unit_cost_snapshot' => (float) ($materialRow['unit_cost_snapshot'] ?? 0),
                'material_total' => round($materialValue, 2),
            ];
        }

        $adjustedMaterialCost = $directMaterialCost * (1 + ((float) ($productRow['waste_percentage'] ?? 0) / 100));
        $directLaborCost = (float) ($productRow['direct_labor_cost'] ?? 0);
        $overheadCost = (float) ($productRow['overhead_cost'] ?? 0);
        $sellingPrice = (float) ($productRow['selling_price'] ?? 0);
        $totalUnitCost = $adjustedMaterialCost + $directLaborCost + $overheadCost;
        $grossProfit = $sellingPrice - $totalUnitCost;
        $grossMargin = $sellingPrice > 0 ? ($grossProfit / $sellingPrice) * 100 : 0;

        $result[] = [
            'id' => (int) $productRow['id'],
            'sku' => $productRow['sku'],
            'product_name' => $productRow['product_name'],
            'direct_material_cost' => round($adjustedMaterialCost, 2),
            'direct_labor_cost' => round($directLaborCost, 2),
            'overhead_cost' => round($overheadCost, 2),
            'total_unit_cost' => round($totalUnitCost, 2),
            'selling_price' => round($sellingPrice, 2),
            'gross_profit' => round($grossProfit, 2),
            'gross_margin_pct' => round($grossMargin, 2),
            'materials' => $materialDetails,
            'selected_material_ids' => array_map(fn ($item) => (int) $item['raw_material_id'], $materialDetails),
        ];
    }

    return $result;
}

function resolveBomProductSku(PDO $pdo, string $productName): string
{
    $sku = preg_replace('/[^A-Za-z0-9]+/', '-', strtolower(trim($productName)));
    $sku = trim($sku, '-');

    if ($sku === '') {
        $sku = 'BOM-' . (string) time();
    }

    $candidate = $sku;
    $suffix = 1;

    while (true) {
        $stmt = $pdo->prepare('SELECT id FROM products WHERE sku = :sku LIMIT 1');
        $stmt->execute([':sku' => $candidate]);

        if ($stmt->fetchColumn() === false) {
            return $candidate;
        }

        $candidate = $sku . '-' . $suffix;
        $suffix++;
    }
}

function upsertBomItemsForProduct(PDO $pdo, int $productId, array $selectedMaterials): void
{
    $deleteStmt = $pdo->prepare('DELETE FROM bom_items WHERE product_id = :product_id');
    $deleteStmt->execute([':product_id' => $productId]);

    foreach ($selectedMaterials as $material) {
        $rawMaterialId = (int) ($material['raw_material_id'] ?? 0);
        $quantity = (float) ($material['quantity'] ?? 1);
        $unitCostSnapshot = (float) ($material['unit_cost_snapshot'] ?? 0);

        if ($rawMaterialId <= 0) {
            continue;
        }

        $insertStmt = $pdo->prepare(
            'INSERT INTO bom_items (product_id, raw_material_id, quantity, unit_cost_snapshot)
             VALUES (:product_id, :raw_material_id, :quantity, :unit_cost_snapshot)'
        );

        $insertStmt->execute([
            ':product_id' => $productId,
            ':raw_material_id' => $rawMaterialId,
            ':quantity' => $quantity,
            ':unit_cost_snapshot' => $unitCostSnapshot,
        ]);
    }
}

function handleRawMaterials(): void
{
    $pdo = getDatabaseConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM raw_materials ORDER BY material_name ASC');
        jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST') {
        $payload = parseJsonBody();
        $rows = deduplicateRowsByKey(normalizeImportRows($payload), 'material_name', 'name');

        if (empty($rows)) {
            jsonResponse(['success' => false, 'message' => 'No payload provided.'], 400);
        }

        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }
            upsertRawMaterial($pdo, $row);
        }

        $bomCosting = calculateBomCostingSnapshot($pdo);

        jsonResponse([
            'success' => true,
            'message' => 'Raw material inventory updated.',
            'count' => count($rows),
            'bom_costing' => $bomCosting,
        ]);
    }
}

function handleFinishedGoods(): void
{
    $pdo = getDatabaseConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM finished_goods ORDER BY product_name ASC');
        jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST') {
        $payload = parseJsonBody();
        $rows = deduplicateRowsByKey(normalizeImportRows($payload), 'sku');

        if (empty($rows)) {
            jsonResponse(['success' => false, 'message' => 'No payload provided.'], 400);
        }

        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }
            upsertFinishedGood($pdo, $row);
        }

        jsonResponse(['success' => true, 'message' => 'Finished good inventory updated.', 'count' => count($rows)]);
    }
}

function handleBomCosting(): void
{
    $pdo = getDatabaseConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        $payload = parseJsonBody();

        if (isset($payload['action'])) {
            $action = strtolower((string) $payload['action']);

            if ($action === 'create' || $action === 'update') {
                $productName = trim((string) ($payload['product_name'] ?? $payload['name'] ?? ''));
                $productId = isset($payload['id']) ? (int) $payload['id'] : null;

                if ($productName === '') {
                    jsonResponse(['success' => false, 'message' => 'Product name is required.'], 400);
                }

                if ($productId !== null && $productId > 0) {
                    $existing = $pdo->prepare('SELECT id, sku FROM products WHERE id = :id LIMIT 1');
                    $existing->execute([':id' => $productId]);
                    $existingRow = $existing->fetch();

                    if ($existingRow === false) {
                        jsonResponse(['success' => false, 'message' => 'Selected BOM item was not found.'], 404);
                    }

                    $productId = (int) $existingRow['id'];
                    $sku = (string) $existingRow['sku'];
                } else {
                    $sku = resolveBomProductSku($pdo, $productName);
                    $productId = null;
                }

                if ($productId === null) {
                    $insertStmt = $pdo->prepare(
                        'INSERT INTO products (sku, product_name, selling_price, direct_labor_cost, overhead_cost, waste_percentage, description)
                         VALUES (:sku, :product_name, :selling_price, :direct_labor_cost, :overhead_cost, :waste_percentage, :description)'
                    );
                    $insertStmt->execute([
                        ':sku' => $sku,
                        ':product_name' => $productName,
                        ':selling_price' => (float) ($payload['selling_price'] ?? 0),
                        ':direct_labor_cost' => (float) ($payload['direct_labor_cost'] ?? 0),
                        ':overhead_cost' => (float) ($payload['overhead_cost'] ?? 0),
                        ':waste_percentage' => (float) ($payload['waste_percentage'] ?? 0),
                        ':description' => 'Manual BOM entry',
                    ]);
                    $productId = (int) $pdo->lastInsertId();
                } else {
                    $updateStmt = $pdo->prepare(
                        'UPDATE products
                         SET product_name = :product_name,
                             selling_price = :selling_price,
                             direct_labor_cost = :direct_labor_cost,
                             overhead_cost = :overhead_cost,
                             waste_percentage = :waste_percentage,
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = :id'
                    );
                    $updateStmt->execute([
                        ':product_name' => $productName,
                        ':selling_price' => (float) ($payload['selling_price'] ?? 0),
                        ':direct_labor_cost' => (float) ($payload['direct_labor_cost'] ?? 0),
                        ':overhead_cost' => (float) ($payload['overhead_cost'] ?? 0),
                        ':waste_percentage' => (float) ($payload['waste_percentage'] ?? 0),
                        ':id' => $productId,
                    ]);
                }

                $materials = is_array($payload['materials'] ?? null) ? $payload['materials'] : [];
                $selectedMaterials = [];

                foreach ($materials as $material) {
                    $rawMaterialId = (int) ($material['raw_material_id'] ?? 0);
                    $materialName = trim((string) ($material['material_name'] ?? ''));

                    if ($rawMaterialId <= 0 && $materialName !== '') {
                        $materialLookup = $pdo->prepare('SELECT id, unit_cost FROM raw_materials WHERE material_name = :material_name LIMIT 1');
                        $materialLookup->execute([':material_name' => $materialName]);
                        $materialRow = $materialLookup->fetch();

                        if ($materialRow !== false) {
                            $rawMaterialId = (int) $materialRow['id'];
                        }
                    }

                    if ($rawMaterialId <= 0) {
                        continue;
                    }

                    $selectedMaterials[] = [
                        'raw_material_id' => $rawMaterialId,
                        'quantity' => (float) ($material['quantity'] ?? 1),
                        'unit_cost_snapshot' => (float) ($material['unit_cost_snapshot'] ?? $material['unit_cost'] ?? 0),
                    ];
                }

                upsertBomItemsForProduct($pdo, $productId, $selectedMaterials);

                jsonResponse([
                    'success' => true,
                    'message' => 'BOM item saved.',
                    'bom_costing' => calculateBomCostingSnapshot($pdo),
                ]);
            }

            if ($action === 'delete') {
                $productId = (int) ($payload['id'] ?? 0);

                if ($productId <= 0) {
                    jsonResponse(['success' => false, 'message' => 'A BOM item id is required for deletion.'], 400);
                }

                try {
                    $pdo->beginTransaction();

                    $pdo->prepare('DELETE FROM bom_items WHERE product_id = :product_id')->execute([':product_id' => $productId]);
                    $pdo->prepare('DELETE FROM work_in_progress WHERE product_id = :product_id')->execute([':product_id' => $productId]);
                    $pdo->prepare('DELETE FROM production_costs WHERE product_id = :product_id')->execute([':product_id' => $productId]);
                    $pdo->prepare('DELETE FROM products WHERE id = :id')->execute([':id' => $productId]);

                    $pdo->commit();
                } catch (Throwable $exception) {
                    if ($pdo->inTransaction()) {
                        $pdo->rollBack();
                    }

                    jsonResponse([
                        'success' => false,
                        'message' => 'Unable to delete BOM item.',
                        'error' => $exception->getMessage(),
                    ], 500);
                }

                jsonResponse([
                    'success' => true,
                    'message' => 'BOM item deleted.',
                    'bom_costing' => calculateBomCostingSnapshot($pdo),
                ]);
            }

            if ($action === 'reset') {
                try {
                    $pdo->beginTransaction();
                    $pdo->query('DELETE FROM bom_items');
                    $pdo->query('DELETE FROM work_in_progress');
                    $pdo->query('DELETE FROM production_costs');
                    $pdo->query('DELETE FROM products');
                    $pdo->commit();
                } catch (Throwable $exception) {
                    if ($pdo->inTransaction()) {
                        $pdo->rollBack();
                    }

                    jsonResponse([
                        'success' => false,
                        'message' => 'Unable to clear BOM data.',
                        'error' => $exception->getMessage(),
                    ], 500);
                }

                jsonResponse([
                    'success' => true,
                    'message' => 'BOM data was cleared.',
                    'bom_costing' => calculateBomCostingSnapshot($pdo),
                ]);
            }
        }

        $payloadRows = deduplicateRowsByKey(normalizeImportRows($payload), 'sku', 'product_name');

        if (empty($payloadRows)) {
            jsonResponse(['success' => false, 'message' => 'No payload provided.'], 400);
        }

        foreach ($payloadRows as $row) {
            if (!is_array($row)) {
                continue;
            }
            upsertProduct($pdo, $row);
        }

        $bomCosting = calculateBomCostingSnapshot($pdo);
        jsonResponse([
            'success' => true,
            'message' => 'BOM costing updated.',
            'count' => count($payloadRows),
            'bom_costing' => $bomCosting,
        ]);
    }

    jsonResponse(['success' => true, 'data' => calculateBomCostingSnapshot($pdo)]);
}

function handleWip(): void
{
    $pdo = getDatabaseConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        $payload = parseJsonBody();
        $rows = deduplicateRowsByKey(normalizeImportRows($payload), 'batch_name', 'stage');

        if (empty($rows)) {
            jsonResponse(['success' => false, 'message' => 'No payload provided.'], 400);
        }

        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }
            upsertWip($pdo, $row);
        }

        jsonResponse(['success' => true, 'message' => 'WIP updated.', 'count' => count($rows)]);
    }

    $stmt = $pdo->query('SELECT * FROM work_in_progress ORDER BY batch_name ASC');
    jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
}

function handleFinancials(): void
{
    $pdo = getDatabaseConnection();
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $segments = array_values(array_filter(explode('/', $path), fn ($segment) => $segment !== ''));
    $apiIndex = array_search('api', $segments, true);

    if ($apiIndex === false) {
        jsonResponse(['success' => false, 'message' => 'Unknown financial route.'], 404);
    }

    $routeSegments = array_slice($segments, $apiIndex + 1);

    if (!isset($routeSegments[1]) || $routeSegments[1] !== 'cogm-cogs') {
        jsonResponse(['success' => false, 'message' => 'Unknown financial route.'], 404);
    }

    $sql = "
        SELECT
            ROUND(COALESCE(SUM(beginning_stock * unit_cost), 0), 2) AS beginning_finished_goods_value,
            ROUND(COALESCE(SUM(production * unit_cost), 0), 2) AS total_manufacturing_cost,
            ROUND(COALESCE(SUM(sold * unit_cost), 0), 2) AS cogs,
            ROUND(COALESCE(SUM(ending_stock * unit_cost), 0), 2) AS ending_finished_goods_value
        FROM finished_goods
    ";

    $statement = $pdo->query($sql);
    $row = $statement->fetch();

    $beginningFg = (float) ($row['beginning_finished_goods_value'] ?? 0);
    $totalManufacturing = (float) ($row['total_manufacturing_cost'] ?? 0);
    $cogs = (float) ($row['cogs'] ?? 0);
    $endingFg = (float) ($row['ending_finished_goods_value'] ?? 0);
    $cogm = $beginningFg + $totalManufacturing - $endingFg;

    jsonResponse([
        'success' => true,
        'data' => [
            'beginning_finished_goods' => round($beginningFg, 2),
            'total_manufacturing_cost' => round($totalManufacturing, 2),
            'cogm' => round($cogm, 2),
            'cogs' => round($cogs, 2),
            'ending_finished_goods' => round($endingFg, 2),
        ],
    ]);
}

$route = $_GET['route'] ?? null;

if ($route === null || $route === '') {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $segments = array_values(array_filter(explode('/', $uri), fn ($segment) => $segment !== ''));
    $apiIndex = array_search('api', $segments, true);

    if ($apiIndex === false || count($segments) < $apiIndex + 2) {
        jsonResponse(['success' => false, 'message' => 'Invalid API route.'], 404);
    }

    $route = $segments[$apiIndex + 1] ?? null;
}

switch ($route) {
    case 'raw-materials':
        handleRawMaterials();
        break;
    case 'finished-goods':
        handleFinishedGoods();
        break;
    case 'bom-costing':
        handleBomCosting();
        break;
    case 'wip':
    case 'work-in-progress':
        handleWip();
        break;
    case 'financials':
        handleFinancials();
        break;
    default:
        jsonResponse(['success' => false, 'message' => 'Route not found.'], 404);
}
