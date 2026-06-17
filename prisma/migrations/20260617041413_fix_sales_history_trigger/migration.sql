-- This is an empty migration.
CREATE OR REPLACE FUNCTION create_history_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  record_id TEXT;
  history_operation "OperationType";
BEGIN
  IF TG_OP = 'INSERT' THEN
    record_id := NEW.id::TEXT;
    history_operation := 'CREATE';

    INSERT INTO histories (table_name, table_id, operation_type, data, created_at)
    VALUES (
      TG_TABLE_NAME,
      record_id,
      history_operation,
      jsonb_build_object('before', NULL, 'after', to_jsonb(NEW)),
      NOW()
    );

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    record_id := NEW.id::TEXT;
    history_operation := 'UPDATE';

    INSERT INTO histories (table_name, table_id, operation_type, data, created_at)
    VALUES (
      TG_TABLE_NAME,
      record_id,
      history_operation,
      jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW)),
      NOW()
    );

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    record_id := OLD.id::TEXT;
    history_operation := 'DELETE';

    INSERT INTO histories (table_name, table_id, operation_type, data, created_at)
    VALUES (
      TG_TABLE_NAME,
      record_id,
      history_operation,
      jsonb_build_object('before', to_jsonb(OLD), 'after', NULL),
      NOW()
    );

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;