-- ============================================================
-- QUANTUM STATE FINANCIAL ENGINE - Seed Data
-- ============================================================

-- Default analyst user (password: Qfse@2025)
INSERT INTO users (id, email, password_hash, name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'sarah.chen@qfse.bank', '$2b$12$KIX8Yg9J1YrpzTHJa6Yb9urIIX8YDZi8WQ3lLFZK6E5N1R7q0X5y6', 'Sarah Chen', 'senior_analyst')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- PERSONAS
-- ============================================================
INSERT INTO personas (name, color, emoji, avg_risk) VALUES
  ('Salary-Dependent Struggler',    '#BD10E0', '🟣', 54),
  ('Credit-Heavy Overuser',         '#F5A623', '🟡', 67),
  ('Emergency Cash Withdrawer',     '#FF8C00', '🟠', 71),
  ('Silent Saver Drain',            '#4169E1', '🔵', 32),
  ('Paycheck-to-Paycheck Survivor', '#2E8B57', '🟢', 45)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- CUSTOMERS (15 seed customers from existing app)
-- ============================================================
INSERT INTO customers (id, name, email, phone, persona_id, monthly_income, loan_amount, emi_amount, emi_due_days,
  credit_utilization, salary_delay_freq, emi_payment_consistency, withdrawal_spikes, loan_to_income_ratio, affordability_surplus, employer)
VALUES
  -- CUST_01: Neha Verma - Silent Saver Drain - Healthy
  ('CUST_01', 'Neha Verma',          'neha.v@email.com',          '+91-98765-43001', 4, 65000,  120000,  12000,  12, 25.0, 0.05, 0.95, 0, 0.15, 15400, 'Infosys Ltd'),
  -- CUST_02: Rohan Patil - Paycheck-to-Paycheck - Early Stress
  ('CUST_02', 'Rohan Patil',         'rohan.p@email.com',          '+91-98765-43002', 5, 42000,   85000,   8500,   4, 40.0, 0.25, 0.75, 1, 0.17, 5000,  'State Bank of India'),
  -- CUST_03: Amit Sharma - Salary-Dependent - Warning
  ('CUST_03', 'Amit Sharma',         'amit.sharma@email.com',      '+91-98765-43210', 1, 58000,  250000,  25000,   6, 55.0, 0.60, 0.55, 2, 0.36, 12400, 'HDFC Securities'),
  -- CUST_04: Sneha Iyer - Salary-Dependent - Warning
  ('CUST_04', 'Sneha Iyer',          'sneha.i@email.com',          '+91-98765-43004', 1, 54000,  320000,  28000,   3, 62.0, 0.65, 0.50, 2, 0.52, 8500,  'Wipro Technologies'),
  -- CUST_05: Priya Mehta - Credit-Heavy - Critical
  ('CUST_05', 'Priya Mehta',         'priya.m@email.com',          '+91-98765-43005', 2, 72000,  450000,  45000,   2, 87.0, 0.30, 0.70, 1, 0.52, 3200,  'Accenture'),
  -- CUST_06: Vikas Nair - Emergency Cash - Critical
  ('CUST_06', 'Vikas Nair',          'vikas.n@email.com',          '+91-98765-43006', 3, 48000,  180000,  18000,   3, 70.0, 0.40, 0.60, 5, 0.31, 2800,  'TCS'),
  -- CUST_07: Rajesh Kulkarni - Emergency Cash - Imminent Default
  ('CUST_07', 'Rajesh Kulkarni',     'rajesh.k@email.com',         '+91-98765-43007', 3, 60000,  520000,  52000,   1, 82.0, 0.75, 0.35, 8, 0.72, 500,   'Reliance Industries'),
  -- CUST_08: Ankit Joshi - Credit-Heavy - Imminent Default
  ('CUST_08', 'Ankit Joshi',         'ankit.j@email.com',          '+91-98765-43008', 2, 80000,  670000,  67000,   0, 95.0, 0.55, 0.25, 6, 0.70, 0,     'Barclays Bank'),
  -- CUST_09: Kavita Rao - Salary-Dependent - Recovery
  ('CUST_09', 'Kavita Rao',          'kavita.r@email.com',         '+91-98765-43009', 1, 52000,  210000,  21000,   8, 30.0, 0.15, 0.90, 0, 0.33, 15000, 'Cognizant'),
  -- CUST_10: Manoj Deshpande - Paycheck-to-Paycheck - Critical
  ('CUST_10', 'Manoj Deshpande',     'manoj.d@email.com',          '+91-98765-43010', 5, 36000,   95000,   9500,   2, 78.0, 0.70, 0.40, 4, 0.22, 1200,  'BPCL'),
  -- CUST_11: Divya Krishnan - Salary-Dependent - Critical
  ('CUST_11', 'Divya Krishnan',      'divya.k@email.com',          '+91-98765-43011', 1, 65000,  380000,  38000,   5, 68.0, 0.70, 0.45, 3, 0.49, 4200,  'HCL Technologies'),
  -- CUST_12: Karthik Subramanian - Credit-Heavy - Warning
  ('CUST_12', 'Karthik Subramanian', 'karthik.s@email.com',        '+91-98765-43012', 2, 68000,  290000,  29000,  10, 72.0, 0.20, 0.80, 1, 0.35, 0,     'Deloitte'),
  -- CUST_13: Meera Chandran - Silent Saver - Early Stress
  ('CUST_13', 'Meera Chandran',      'meera.c@email.com',          '+91-98765-43013', 4, 55000,  150000,  15000,  15, 38.0, 0.10, 0.88, 0, 0.23, 0,     'Amazon India'),
  -- CUST_14: Sunil Gawande - Paycheck-to-Paycheck - Early Stress
  ('CUST_14', 'Sunil Gawande',       'sunil.g@email.com',          '+91-98765-43014', 5, 38000,   75000,   7500,   5, 42.0, 0.20, 0.85, 0, 0.16, 0,     'MSRTC'),
  -- CUST_15: Pooja Desai - Emergency Cash - Warning
  ('CUST_15', 'Pooja Desai',         'pooja.d@email.com',          '+91-98765-43015', 3, 50000,  220000,  22000,   8, 55.0, 0.35, 0.65, 3, 0.36, 0,     'Flipkart')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- LOANS
-- ============================================================
INSERT INTO loans (customer_id, loan_type, sanctioned_amt, outstanding_amt, emi_amount, tenure_months, interest_rate, disbursed_at, maturity_date, status)
VALUES
  ('CUST_01', 'Personal Loan', 120000,  85000,  12000, 12, 10.5, '2025-01-15', '2026-01-15', 'active'),
  ('CUST_02', 'Personal Loan',  85000,  72000,   8500, 12, 11.0, '2025-02-01', '2026-02-01', 'active'),
  ('CUST_03', 'Home Loan',     250000, 220000,  25000, 12, 12.5, '2025-03-01', '2026-03-01', 'active'),
  ('CUST_04', 'Home Loan',     320000, 298000,  28000, 14, 13.0, '2025-01-20', '2026-03-20', 'active'),
  ('CUST_05', 'Credit Card Loan', 450000, 430000, 45000, 12, 15.0, '2025-02-10', '2026-02-10', 'active'),
  ('CUST_06', 'Personal Loan', 180000, 165000,  18000, 12, 12.0, '2025-03-05', '2026-03-05', 'active'),
  ('CUST_07', 'Business Loan', 520000, 510000,  52000, 12, 14.0, '2025-02-20', '2026-02-20', 'active'),
  ('CUST_08', 'Personal Loan', 670000, 668000,  67000, 12, 16.0, '2025-03-10', '2026-03-10', 'active'),
  ('CUST_09', 'Personal Loan', 210000, 168000,  21000, 12, 11.5, '2025-01-01', '2026-01-01', 'active'),
  ('CUST_10', 'Personal Loan',  95000,  88000,   9500, 12, 11.0, '2025-02-15', '2026-02-15', 'active'),
  ('CUST_11', 'Home Loan',     380000, 360000,  38000, 12, 13.5, '2025-01-25', '2026-01-25', 'active'),
  ('CUST_12', 'Personal Loan', 290000, 255000,  29000, 12, 12.0, '2025-02-05', '2026-02-05', 'active'),
  ('CUST_13', 'Personal Loan', 150000, 125000,  15000, 12, 10.5, '2025-03-01', '2026-03-01', 'active'),
  ('CUST_14', 'Personal Loan',  75000,  60000,   7500, 12, 11.0, '2025-01-15', '2026-01-15', 'active'),
  ('CUST_15', 'Personal Loan', 220000, 195000,  22000, 12, 12.5, '2025-02-20', '2026-02-20', 'active')
ON CONFLICT DO NOTHING;

-- ============================================================
-- RISK SCORES (Latest scores per customer)
-- ============================================================
INSERT INTO risk_scores (customer_id, scored_at, probability, risk_state, feature_importance, model_version) VALUES
  ('CUST_01', NOW() - INTERVAL '1 day', 0.08, 'Healthy',          '{"salary_delay_freq":0.02,"credit_utilization_ratio":0.08,"emi_payment_consistency":0.05,"withdrawal_spikes":0.01,"loan_to_income_ratio":0.04}', 'v1'),
  ('CUST_02', NOW() - INTERVAL '1 day', 0.28, 'Watchlist',        '{"salary_delay_freq":0.12,"credit_utilization_ratio":0.10,"emi_payment_consistency":0.15,"withdrawal_spikes":0.05,"loan_to_income_ratio":0.08}', 'v1'),
  ('CUST_03', NOW() - INTERVAL '1 day', 0.55, 'At Risk',          '{"salary_delay_freq":0.30,"credit_utilization_ratio":0.12,"emi_payment_consistency":0.22,"withdrawal_spikes":0.08,"loan_to_income_ratio":0.18}', 'v1'),
  ('CUST_04', NOW() - INTERVAL '1 day', 0.58, 'At Risk',          '{"salary_delay_freq":0.32,"credit_utilization_ratio":0.14,"emi_payment_consistency":0.25,"withdrawal_spikes":0.07,"loan_to_income_ratio":0.20}', 'v1'),
  ('CUST_05', NOW() - INTERVAL '1 day', 0.72, 'Imminent Default', '{"salary_delay_freq":0.10,"credit_utilization_ratio":0.42,"emi_payment_consistency":0.15,"withdrawal_spikes":0.05,"loan_to_income_ratio":0.22}', 'v1'),
  ('CUST_06', NOW() - INTERVAL '1 day', 0.76, 'Imminent Default', '{"salary_delay_freq":0.15,"credit_utilization_ratio":0.20,"emi_payment_consistency":0.18,"withdrawal_spikes":0.28,"loan_to_income_ratio":0.12}', 'v1'),
  ('CUST_07', NOW() - INTERVAL '1 day', 0.88, 'Imminent Default', '{"salary_delay_freq":0.35,"credit_utilization_ratio":0.22,"emi_payment_consistency":0.35,"withdrawal_spikes":0.38,"loan_to_income_ratio":0.25}', 'v1'),
  ('CUST_08', NOW() - INTERVAL '1 day', 0.92, 'Imminent Default', '{"salary_delay_freq":0.20,"credit_utilization_ratio":0.48,"emi_payment_consistency":0.40,"withdrawal_spikes":0.25,"loan_to_income_ratio":0.30}', 'v1'),
  ('CUST_09', NOW() - INTERVAL '1 day', 0.18, 'Watchlist',        '{"salary_delay_freq":0.08,"credit_utilization_ratio":0.06,"emi_payment_consistency":0.08,"withdrawal_spikes":0.02,"loan_to_income_ratio":0.10}', 'v1'),
  ('CUST_10', NOW() - INTERVAL '1 day', 0.80, 'Imminent Default', '{"salary_delay_freq":0.28,"credit_utilization_ratio":0.25,"emi_payment_consistency":0.30,"withdrawal_spikes":0.20,"loan_to_income_ratio":0.08}', 'v1'),
  ('CUST_11', NOW() - INTERVAL '1 day', 0.68, 'At Risk',          '{"salary_delay_freq":0.32,"credit_utilization_ratio":0.18,"emi_payment_consistency":0.28,"withdrawal_spikes":0.12,"loan_to_income_ratio":0.18}', 'v1'),
  ('CUST_12', NOW() - INTERVAL '1 day', 0.45, 'At Risk',          '{"salary_delay_freq":0.08,"credit_utilization_ratio":0.35,"emi_payment_consistency":0.10,"withdrawal_spikes":0.05,"loan_to_income_ratio":0.15}', 'v1'),
  ('CUST_13', NOW() - INTERVAL '1 day', 0.35, 'Watchlist',        '{"salary_delay_freq":0.05,"credit_utilization_ratio":0.12,"emi_payment_consistency":0.08,"withdrawal_spikes":0.02,"loan_to_income_ratio":0.10}', 'v1'),
  ('CUST_14', NOW() - INTERVAL '1 day', 0.22, 'Watchlist',        '{"salary_delay_freq":0.10,"credit_utilization_ratio":0.12,"emi_payment_consistency":0.10,"withdrawal_spikes":0.02,"loan_to_income_ratio":0.08}', 'v1'),
  ('CUST_15', NOW() - INTERVAL '1 day', 0.42, 'At Risk',          '{"salary_delay_freq":0.15,"credit_utilization_ratio":0.18,"emi_payment_consistency":0.12,"withdrawal_spikes":0.18,"loan_to_income_ratio":0.15}', 'v1');

-- Historical risk scores (last 4 weeks per customer)
INSERT INTO risk_scores (customer_id, scored_at, probability, risk_state, model_version) VALUES
  ('CUST_01', NOW()-INTERVAL '7 days',  0.07, 'Healthy',          'v1'),
  ('CUST_01', NOW()-INTERVAL '14 days', 0.06, 'Healthy',          'v1'),
  ('CUST_01', NOW()-INTERVAL '21 days', 0.05, 'Healthy',          'v1'),
  ('CUST_02', NOW()-INTERVAL '7 days',  0.25, 'Watchlist',        'v1'),
  ('CUST_02', NOW()-INTERVAL '14 days', 0.22, 'Watchlist',        'v1'),
  ('CUST_02', NOW()-INTERVAL '21 days', 0.20, 'Healthy',          'v1'),
  ('CUST_03', NOW()-INTERVAL '7 days',  0.50, 'At Risk',          'v1'),
  ('CUST_03', NOW()-INTERVAL '14 days', 0.42, 'At Risk',          'v1'),
  ('CUST_03', NOW()-INTERVAL '21 days', 0.35, 'Watchlist',        'v1'),
  ('CUST_03', NOW()-INTERVAL '28 days', 0.25, 'Watchlist',        'v1'),
  ('CUST_04', NOW()-INTERVAL '7 days',  0.52, 'At Risk',          'v1'),
  ('CUST_04', NOW()-INTERVAL '14 days', 0.45, 'At Risk',          'v1'),
  ('CUST_04', NOW()-INTERVAL '21 days', 0.38, 'Watchlist',        'v1'),
  ('CUST_05', NOW()-INTERVAL '7 days',  0.68, 'At Risk',          'v1'),
  ('CUST_05', NOW()-INTERVAL '14 days', 0.62, 'At Risk',          'v1'),
  ('CUST_05', NOW()-INTERVAL '21 days', 0.55, 'At Risk',          'v1'),
  ('CUST_06', NOW()-INTERVAL '7 days',  0.70, 'Imminent Default', 'v1'),
  ('CUST_06', NOW()-INTERVAL '14 days', 0.62, 'At Risk',          'v1'),
  ('CUST_06', NOW()-INTERVAL '21 days', 0.50, 'At Risk',          'v1'),
  ('CUST_07', NOW()-INTERVAL '7 days',  0.82, 'Imminent Default', 'v1'),
  ('CUST_07', NOW()-INTERVAL '14 days', 0.75, 'Imminent Default', 'v1'),
  ('CUST_07', NOW()-INTERVAL '21 days', 0.65, 'At Risk',          'v1'),
  ('CUST_08', NOW()-INTERVAL '7 days',  0.88, 'Imminent Default', 'v1'),
  ('CUST_08', NOW()-INTERVAL '14 days', 0.82, 'Imminent Default', 'v1'),
  ('CUST_08', NOW()-INTERVAL '21 days', 0.75, 'Imminent Default', 'v1'),
  ('CUST_09', NOW()-INTERVAL '7 days',  0.22, 'Watchlist',        'v1'),
  ('CUST_09', NOW()-INTERVAL '14 days', 0.30, 'Watchlist',        'v1'),
  ('CUST_09', NOW()-INTERVAL '21 days', 0.45, 'At Risk',          'v1'),
  ('CUST_10', NOW()-INTERVAL '7 days',  0.75, 'Imminent Default', 'v1'),
  ('CUST_10', NOW()-INTERVAL '14 days', 0.65, 'At Risk',          'v1'),
  ('CUST_10', NOW()-INTERVAL '21 days', 0.50, 'At Risk',          'v1'),
  ('CUST_11', NOW()-INTERVAL '7 days',  0.62, 'At Risk',          'v1'),
  ('CUST_11', NOW()-INTERVAL '14 days', 0.55, 'At Risk',          'v1'),
  ('CUST_11', NOW()-INTERVAL '21 days', 0.45, 'At Risk',          'v1'),
  ('CUST_12', NOW()-INTERVAL '7 days',  0.42, 'At Risk',          'v1'),
  ('CUST_12', NOW()-INTERVAL '14 days', 0.38, 'Watchlist',        'v1'),
  ('CUST_12', NOW()-INTERVAL '21 days', 0.35, 'Watchlist',        'v1'),
  ('CUST_13', NOW()-INTERVAL '7 days',  0.32, 'Watchlist',        'v1'),
  ('CUST_13', NOW()-INTERVAL '14 days', 0.28, 'Watchlist',        'v1'),
  ('CUST_13', NOW()-INTERVAL '21 days', 0.25, 'Watchlist',        'v1'),
  ('CUST_14', NOW()-INTERVAL '7 days',  0.21, 'Watchlist',        'v1'),
  ('CUST_14', NOW()-INTERVAL '14 days', 0.20, 'Healthy',          'v1'),
  ('CUST_14', NOW()-INTERVAL '21 days', 0.20, 'Healthy',          'v1'),
  ('CUST_15', NOW()-INTERVAL '7 days',  0.38, 'Watchlist',        'v1'),
  ('CUST_15', NOW()-INTERVAL '14 days', 0.35, 'Watchlist',        'v1'),
  ('CUST_15', NOW()-INTERVAL '21 days', 0.30, 'Watchlist',        'v1');

-- ============================================================
-- ENTANGLEMENTS
-- ============================================================
INSERT INTO entanglements (customer_id, linked_customer_id, linked_name, relationship, link_type, risk_impact_pct, linked_risk_score) VALUES
  ('CUST_04', NULL, 'Rahul Iyer',      'Spouse',   'family',   12.0, 0.32),
  ('CUST_07', NULL, 'Meera Kulkarni',  'Spouse',   'family',   20.0, 0.45),
  ('CUST_07', NULL, 'Suresh Kulkarni', 'Parent',   'family',   10.0, 0.32),
  ('CUST_08', NULL, 'Neha Joshi',      'Sibling',  'family',   15.0, 0.38),
  ('CUST_08', NULL, 'Ramesh Joshi',    'Parent',   'family',    8.0, 0.25),
  ('CUST_15', NULL, 'Sibling',         'Sibling',  'family',    8.0, 0.28)
ON CONFLICT DO NOTHING;

-- ============================================================
-- TIMELINE EVENTS
-- ============================================================
INSERT INTO timeline_events (customer_id, event_date, event_type, severity, title, description, risk_at_event) VALUES
  -- CUST_03 Amit Sharma
  ('CUST_03', CURRENT_DATE-25, 'salary_delay',   'warning',  'First Salary Delay',      'Salary delayed by 3 days',               0.35),
  ('CUST_03', CURRENT_DATE-18, 'savings_drain',  'warning',  'Savings Withdrawal',      'Withdrew ₹8,000 from savings',           0.42),
  ('CUST_03', CURRENT_DATE-10, 'salary_delay',   'critical', 'Repeated Salary Delay',   'Salary delayed by 7 days',               0.50),
  ('CUST_03', CURRENT_DATE-3,  'savings_drain',  'critical', 'Major Savings Drain',     'Withdrew ₹15,000 in 3 days',             0.55),
  -- CUST_07 Rajesh Kulkarni
  ('CUST_07', CURRENT_DATE-30, 'missed_emi',     'warning',  'First EMI Miss',          'Auto-debit failed due to low balance',   0.65),
  ('CUST_07', CURRENT_DATE-22, 'loan_app',       'warning',  'Loan App Detected',       '3 predatory loan apps active',           0.72),
  ('CUST_07', CURRENT_DATE-15, 'missed_emi',     'critical', 'Second EMI Miss',         'Second consecutive EMI failure',         0.78),
  ('CUST_07', CURRENT_DATE-7,  'loan_app',       'critical', 'Debt Stacking Critical',  '5+ loan apps — debt spiral risk',        0.85),
  -- CUST_08 Ankit Joshi
  ('CUST_08', CURRENT_DATE-28, 'credit_roll',    'warning',  'Credit Rollover Detected','First credit card rollover',             0.75),
  ('CUST_08', CURRENT_DATE-14, 'loan_app',       'critical', 'Multiple Loan Apps',      '8 loan apps active',                     0.88),
  ('CUST_08', CURRENT_DATE-5,  'missed_emi',     'critical', 'EMI Due - No Payment',    'EMI overdue 5 days, balance zero',       0.92),
  -- CUST_09 Kavita Rao (Recovery)
  ('CUST_09', CURRENT_DATE-21, 'salary_delay',   'warning',  'Salary Irregularity',     'Salary inconsistency flagged',           0.45),
  ('CUST_09', CURRENT_DATE-14, 'intervention',   'success',  'EMI Holiday Applied',     'Bank granted 1-month EMI holiday',       0.38),
  ('CUST_09', CURRENT_DATE-7,  'recovery',       'success',  'Salary Regularized',      'On-time salary received',                0.22),
  -- CUST_05 Priya Mehta
  ('CUST_05', CURRENT_DATE-20, 'credit_util',    'warning',  'Credit Utilization 85%',  'Credit card near max limit',             0.62),
  ('CUST_05', CURRENT_DATE-10, 'balance_transfer','warning', 'Balance Transfer',         'Third balance transfer this quarter',   0.68),
  ('CUST_05', CURRENT_DATE-3,  'credit_util',    'critical', 'Credit Utilization 91%',  'Critical threshold breached',            0.72);

-- ============================================================
-- MONTHLY SNAPSHOTS (Last 3 months per key customers)
-- ============================================================
INSERT INTO snapshots (customer_id, snapshot_month, avg_balance, total_credits, total_debits, emi_paid, risk_score, risk_state, savings_balance, credit_util_pct) VALUES
  ('CUST_03', DATE_TRUNC('month', NOW()-INTERVAL '2 months')::DATE, 35000, 58000, 52000, TRUE,  0.35, 'Watchlist', 45000, 40.0),
  ('CUST_03', DATE_TRUNC('month', NOW()-INTERVAL '1 month')::DATE,  22000, 58000, 62000, TRUE,  0.45, 'At Risk',   32000, 52.0),
  ('CUST_03', DATE_TRUNC('month', NOW())::DATE,                       8000, 58000, 72000, FALSE, 0.55, 'At Risk',   18000, 55.0),
  ('CUST_07', DATE_TRUNC('month', NOW()-INTERVAL '2 months')::DATE, 18000, 60000, 58000, TRUE,  0.65, 'At Risk',   15000, 78.0),
  ('CUST_07', DATE_TRUNC('month', NOW()-INTERVAL '1 month')::DATE,   5000, 60000, 65000, FALSE, 0.78, 'Imminent Default', 3000, 82.0),
  ('CUST_07', DATE_TRUNC('month', NOW())::DATE,                        500, 60000, 72000, FALSE, 0.88, 'Imminent Default', 0, 82.0),
  ('CUST_08', DATE_TRUNC('month', NOW()-INTERVAL '2 months')::DATE, 12000, 80000, 78000, TRUE,  0.75, 'Imminent Default', 5000, 90.0),
  ('CUST_08', DATE_TRUNC('month', NOW()-INTERVAL '1 month')::DATE,   2000, 80000, 88000, FALSE, 0.88, 'Imminent Default', 0, 95.0),
  ('CUST_08', DATE_TRUNC('month', NOW())::DATE,                          0, 80000, 90000, FALSE, 0.92, 'Imminent Default', 0, 95.0),
  ('CUST_09', DATE_TRUNC('month', NOW()-INTERVAL '2 months')::DATE, 25000, 52000, 50000, TRUE,  0.45, 'At Risk',   30000, 35.0),
  ('CUST_09', DATE_TRUNC('month', NOW()-INTERVAL '1 month')::DATE,  35000, 52000, 42000, TRUE,  0.28, 'Watchlist', 40000, 30.0),
  ('CUST_09', DATE_TRUNC('month', NOW())::DATE,                      42000, 52000, 38000, TRUE,  0.18, 'Watchlist', 50000, 25.0)
ON CONFLICT (customer_id, snapshot_month) DO NOTHING;

-- ============================================================
-- QUARTERLY SUMMARIES
-- ============================================================
INSERT INTO quarterly_summaries (customer_id, quarter_start, quarter_label, avg_risk_score, risk_trend, interventions_count, successful_interventions, total_emi_paid, missed_payments) VALUES
  ('CUST_03', '2024-10-01', 'Q4 2024', 0.28, 'deteriorating', 0, 0, 75000, 0),
  ('CUST_03', '2025-01-01', 'Q1 2025', 0.45, 'deteriorating', 0, 0, 50000, 1),
  ('CUST_07', '2024-10-01', 'Q4 2024', 0.55, 'deteriorating', 0, 0, 150000, 0),
  ('CUST_07', '2025-01-01', 'Q1 2025', 0.78, 'deteriorating', 0, 0, 100000, 2),
  ('CUST_09', '2024-10-01', 'Q4 2024', 0.50, 'deteriorating', 0, 0, 63000, 0),
  ('CUST_09', '2025-01-01', 'Q1 2025', 0.30, 'improving',     1, 1, 42000, 0)
ON CONFLICT (customer_id, quarter_start) DO NOTHING;
