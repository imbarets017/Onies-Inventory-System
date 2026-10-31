CREATE DATABASE IF NOT EXISTS slipper_inventory;
USE slipper_inventory;

DROP TABLE IF EXISTS production_costs;
DROP TABLE IF EXISTS work_in_progress;
DROP TABLE IF EXISTS bom_items;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS finished_goods;
DROP TABLE IF EXISTS raw_material_transactions;
DROP TABLE IF EXISTS raw_materials;

CREATE TABLE raw_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(30) NOT NULL DEFAULT 'unit',
    unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    beginning_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
    received DECIMAL(12,2) NOT NULL DEFAULT 0,
    usage_gross DECIMAL(12,2) NOT NULL DEFAULT 0,
    ending_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
    ending_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    daily_usage DECIMAL(12,2) NOT NULL DEFAULT 0,
    annual_demand DECIMAL(12,2) NOT NULL DEFAULT 0,
    lead_time_days INT NOT NULL DEFAULT 0,
    safety_stock_factor DECIMAL(8,2) NOT NULL DEFAULT 0,
    reorder_point DECIMAL(12,2) NOT NULL DEFAULT 0,
    holding_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    ordering_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    eoq DECIMAL(12,2) NOT NULL DEFAULT 0,
    status ENUM('OK', 'REORDER') NOT NULL DEFAULT 'OK',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_raw_material_category (category),
    INDEX idx_raw_material_status (status)
);

CREATE TABLE raw_material_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    raw_material_id INT NOT NULL,
    transaction_type ENUM('RECEIPT', 'ISSUE', 'ADJUSTMENT') NOT NULL,
    quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
    unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    reference_no VARCHAR(100) DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_raw_material_transaction_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id) ON DELETE CASCADE
);

CREATE TABLE finished_goods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(120) NOT NULL,
    size VARCHAR(30) NOT NULL DEFAULT 'N/A',
    unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    beginning_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
    production DECIMAL(12,2) NOT NULL DEFAULT 0,
    sold DECIMAL(12,2) NOT NULL DEFAULT 0,
    ending_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
    ending_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    monthly_sales_rate DECIMAL(12,2) NOT NULL DEFAULT 0,
    lead_time INT NOT NULL DEFAULT 0,
    buffer DECIMAL(12,2) NOT NULL DEFAULT 0,
    safety_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
    reorder_point DECIMAL(12,2) NOT NULL DEFAULT 0,
    days_of_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
    status ENUM('OK', 'PRODUCE') NOT NULL DEFAULT 'OK',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_finished_goods_status (status)
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(120) NOT NULL,
    selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    direct_labor_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    overhead_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    waste_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE bom_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    raw_material_id INT NOT NULL,
    quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
    unit_cost_snapshot DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bom_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_bom_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id) ON DELETE CASCADE,
    UNIQUE KEY uq_bom_product_material (product_id, raw_material_id)
);

CREATE TABLE work_in_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    batch_name VARCHAR(120) NOT NULL,
    quantity_in_process DECIMAL(12,2) NOT NULL DEFAULT 0,
    direct_material_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    direct_labor_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    overhead_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    status ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wip_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_wip_batch_product (product_id, batch_name)
);

CREATE TABLE production_costs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    period_month DATE NOT NULL,
    direct_material_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    direct_labor_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    overhead_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    beginning_wip DECIMAL(12,2) NOT NULL DEFAULT 0,
    ending_wip DECIMAL(12,2) NOT NULL DEFAULT 0,
    cogs DECIMAL(12,2) NOT NULL DEFAULT 0,
    cogm DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_production_costs_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_month_product (product_id, period_month)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_raw_material_material_name ON raw_materials(material_name);
CREATE UNIQUE INDEX IF NOT EXISTS uq_finished_goods_sku ON finished_goods(sku);
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_sku ON products(sku);
CREATE UNIQUE INDEX IF NOT EXISTS uq_bom_product_material ON bom_items(product_id, raw_material_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_wip_batch_product ON work_in_progress(product_id, batch_name);
CREATE UNIQUE INDEX IF NOT EXISTS uq_production_product_month ON production_costs(product_id, period_month);

INSERT INTO raw_materials (
    material_name, category, unit_cost, beginning_stock, received, usage_gross, ending_stock, ending_value,
    daily_usage, annual_demand, lead_time_days, safety_stock_factor, reorder_point, holding_cost, ordering_cost, eoq, status
) VALUES
('EVA Foam Sheet', 'Foam', 42.50, 180, 220, 215, 185, 7862.50, 7.5, 1800, 10, 1.2, 95.00, 8.50, 1800.00, 680.00, 'OK'),
('Strap Webbing', 'Accessories', 18.00, 90, 120, 130, 80, 1440.00, 4.5, 1000, 8, 1.0, 49.00, 3.60, 950.00, 410.00, 'OK'),
('Sole Unit', 'Sole', 65.00, 120, 200, 190, 130, 8450.00, 6.8, 1500, 12, 1.3, 118.00, 13.00, 2200.00, 720.00, 'OK'),
('Adhesive Glue', 'Consumable', 9.20, 25, 50, 40, 35, 322.00, 1.4, 350, 5, 1.5, 13.00, 1.84, 420.00, 210.00, 'OK'),
('Packaging Bag', 'Packaging', 3.75, 200, 100, 150, 150, 562.50, 5.2, 1200, 7, 1.0, 42.00, 0.75, 180.00, 150.00, 'OK');

INSERT INTO finished_goods (
    sku, product_name, size, unit_cost, beginning_stock, production, sold, ending_stock, ending_value, selling_price,
    monthly_sales_rate, lead_time, buffer, safety_stock, reorder_point, days_of_stock, status
) VALUES
('SLIP-BASIC-01', 'Basic Slipper', 'N/A', 120.00, 160, 240, 210, 190, 22800.00, 180.00, 60, 10, 20, 40, 52.00, 3.17, 'OK'),
('SLIP-PREM-02', 'Premium Slide', 'N/A', 180.00, 90, 150, 120, 120, 21600.00, 260.00, 42, 12, 30, 45, 60.00, 2.86, 'OK'),
('SLIP-KIDS-03', 'Kids EVA Slipper', 'N/A', 95.00, 70, 120, 95, 95, 9025.00, 150.00, 35, 8, 18, 32, 40.00, 2.71, 'OK');

INSERT INTO products (
    sku, product_name, selling_price, direct_labor_cost, overhead_cost, waste_percentage, description
) VALUES
('BASIC-SLIP', 'Basic Slipper', 180.00, 24.00, 14.50, 6.50, 'Everyday slipper made from EVA foam with strap and sole assembly.'),
('PREMIUM-SLIDE', 'Premium Slide', 260.00, 30.00, 18.00, 8.00, 'Premium slide slipper with reinforced sole and softer EVA foam.'),
('KIDS-EVA', 'Kids EVA Slipper', 150.00, 20.00, 12.00, 5.50, 'Soft, lightweight EVA slipper designed for kids.');

INSERT INTO bom_items (
    product_id, raw_material_id, quantity, unit_cost_snapshot
) VALUES
((SELECT id FROM products WHERE sku = 'BASIC-SLIP'), (SELECT id FROM raw_materials WHERE material_name = 'EVA Foam Sheet'), 0.80, 42.50),
((SELECT id FROM products WHERE sku = 'BASIC-SLIP'), (SELECT id FROM raw_materials WHERE material_name = 'Sole Unit'), 1.00, 65.00),
((SELECT id FROM products WHERE sku = 'BASIC-SLIP'), (SELECT id FROM raw_materials WHERE material_name = 'Strap Webbing'), 1.50, 18.00),
((SELECT id FROM products WHERE sku = 'BASIC-SLIP'), (SELECT id FROM raw_materials WHERE material_name = 'Adhesive Glue'), 0.15, 9.20),
((SELECT id FROM products WHERE sku = 'PREMIUM-SLIDE'), (SELECT id FROM raw_materials WHERE material_name = 'EVA Foam Sheet'), 1.10, 42.50),
((SELECT id FROM products WHERE sku = 'PREMIUM-SLIDE'), (SELECT id FROM raw_materials WHERE material_name = 'Sole Unit'), 1.20, 65.00),
((SELECT id FROM products WHERE sku = 'PREMIUM-SLIDE'), (SELECT id FROM raw_materials WHERE material_name = 'Strap Webbing'), 1.25, 18.00),
((SELECT id FROM products WHERE sku = 'PREMIUM-SLIDE'), (SELECT id FROM raw_materials WHERE material_name = 'Adhesive Glue'), 0.25, 9.20),
((SELECT id FROM products WHERE sku = 'KIDS-EVA'), (SELECT id FROM raw_materials WHERE material_name = 'EVA Foam Sheet'), 0.70, 42.50),
((SELECT id FROM products WHERE sku = 'KIDS-EVA'), (SELECT id FROM raw_materials WHERE material_name = 'Sole Unit'), 0.90, 65.00),
((SELECT id FROM products WHERE sku = 'KIDS-EVA'), (SELECT id FROM raw_materials WHERE material_name = 'Strap Webbing'), 0.80, 18.00),
((SELECT id FROM products WHERE sku = 'KIDS-EVA'), (SELECT id FROM raw_materials WHERE material_name = 'Adhesive Glue'), 0.12, 9.20);

INSERT INTO work_in_progress (product_id, batch_name, quantity_in_process, direct_material_cost, direct_labor_cost, overhead_cost, status)
VALUES
((SELECT id FROM products WHERE sku = 'BASIC-SLIP'), 'Batch B-1201', 120, 4200.00, 1800.00, 980.00, 'OPEN'),
((SELECT id FROM products WHERE sku = 'PREMIUM-SLIDE'), 'Batch P-2041', 90, 5100.00, 2100.00, 1100.00, 'OPEN');

INSERT INTO production_costs (product_id, period_month, direct_material_cost, direct_labor_cost, overhead_cost, beginning_wip, ending_wip, cogs, cogm)
VALUES
((SELECT id FROM products WHERE sku = 'BASIC-SLIP'), '2026-10-01', 7450.00, 2900.00, 1200.00, 1500.00, 1800.00, 9820.00, 10200.00),
((SELECT id FROM products WHERE sku = 'PREMIUM-SLIDE'), '2026-10-01', 9100.00, 3600.00, 1700.00, 2200.00, 2500.00, 13700.00, 14150.00),
((SELECT id FROM products WHERE sku = 'KIDS-EVA'), '2026-10-01', 6200.00, 2500.00, 1100.00, 1400.00, 1600.00, 8740.00, 9030.00);

SELECT 'schema_ready' AS status;
