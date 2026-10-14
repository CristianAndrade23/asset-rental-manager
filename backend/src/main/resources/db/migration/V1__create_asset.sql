CREATE TABLE asset (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code             VARCHAR(30)    NOT NULL,
    name             VARCHAR(120)   NOT NULL,
    category         VARCHAR(60)    NOT NULL,
    serial_number    VARCHAR(60),
    daily_rate       NUMERIC(12, 2) NOT NULL CHECK (daily_rate >= 0),
    status           VARCHAR(20)    NOT NULL,
    acquisition_date DATE,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
    version          BIGINT         NOT NULL DEFAULT 0,
    CONSTRAINT uk_asset_code UNIQUE (code),
    CONSTRAINT ck_asset_status CHECK (status IN ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'RETIRED'))
);

CREATE INDEX idx_asset_status ON asset (status);
