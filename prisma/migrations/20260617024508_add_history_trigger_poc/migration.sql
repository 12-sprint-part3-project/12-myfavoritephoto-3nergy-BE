-- History Audit Log Trigger Function
CREATE OR REPLACE FUNCTION create_history_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  record_id TEXT;
  history_operation "OperationType";
  before_data JSONB;
  after_data JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    record_id := COALESCE(NEW.id::TEXT, NEW.uuid::TEXT, NEW.user_uuid::TEXT);
    history_operation := 'CREATE';

    before_data := NULL;
    after_data := to_jsonb(NEW) - 'password_hash' - 'token';

    INSERT INTO histories (
      table_name,
      table_id,
      operation_type,
      data,
      created_at
    )
    VALUES (
      TG_TABLE_NAME,
      record_id,
      history_operation,
      jsonb_build_object(
        'before', before_data,
        'after', after_data
      ),
      NOW()
    );

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    record_id := COALESCE(NEW.id::TEXT, NEW.uuid::TEXT, NEW.user_uuid::TEXT);
    history_operation := 'UPDATE';

    before_data := to_jsonb(OLD) - 'password_hash' - 'token';
    after_data := to_jsonb(NEW) - 'password_hash' - 'token';

    INSERT INTO histories (
      table_name,
      table_id,
      operation_type,
      data,
      created_at
    )
    VALUES (
      TG_TABLE_NAME,
      record_id,
      history_operation,
      jsonb_build_object(
        'before', before_data,
        'after', after_data
      ),
      NOW()
    );

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    record_id := COALESCE(OLD.id::TEXT, OLD.uuid::TEXT, OLD.user_uuid::TEXT);
    history_operation := 'DELETE';

    before_data := to_jsonb(OLD) - 'password_hash' - 'token';
    after_data := NULL;

    INSERT INTO histories (
      table_name,
      table_id,
      operation_type,
      data,
      created_at
    )
    VALUES (
      TG_TABLE_NAME,
      record_id,
      history_operation,
      jsonb_build_object(
        'before', before_data,
        'after', after_data
      ),
      NOW()
    );

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Sale table PoC Trigger
DROP TRIGGER IF EXISTS sales_history_audit_trigger ON sales;

CREATE TRIGGER sales_history_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON sales
FOR EACH ROW
EXECUTE FUNCTION create_history_audit_log();