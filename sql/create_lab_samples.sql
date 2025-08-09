-- SQL script to create the lab_samples table in DB_GORE database
-- Run this in your Cloudflare D1 console or database management tool

CREATE TABLE IF NOT EXISTS lab_samples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    扫描单 TEXT,
    货位 TEXT,
    条码 TEXT,
    数量 INTEGER,
    品名 TEXT,
    状态 TEXT,
    单位 TEXT,
    价格 REAL,
    品牌 TEXT,
    产地 TEXT,
    时间 TEXT,
    作业者 TEXT,
    其他1 TEXT,
    其他2 TEXT,
    其他3 TEXT,
    其他4 TEXT,
    其他5 TEXT,
    其他6 TEXT,
    其他7 TEXT,
    其他8 TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index on barcode for faster lookups
CREATE INDEX IF NOT EXISTS idx_lab_samples_barcode ON lab_samples(条码);

-- Create index on 扫描单 for batch operations
CREATE INDEX IF NOT EXISTS idx_lab_samples_scan ON lab_samples(扫描单);