-- v2: protect ticket stock under concurrency.

-- Version number for the optimistic "compare-and-set" strategy:
-- UPDATE ... WHERE id = ? AND version = <the version I read>.
ALTER TABLE ticket_types ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- Safety net: the database itself refuses a negative or too-high "sold" counter.
-- Note: this alone does NOT stop lost updates (two buyers both writing sold = 51),
-- that's why the code also needs a correct concurrency strategy.
ALTER TABLE ticket_types ADD CONSTRAINT ck_ticket_types_sold CHECK (sold >= 0 AND sold <= total_available);
