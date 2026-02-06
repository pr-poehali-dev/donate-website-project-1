CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_logs (
    id SERIAL PRIMARY KEY,
    player_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL,
    price INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_logs_created_at ON purchase_logs(created_at DESC);