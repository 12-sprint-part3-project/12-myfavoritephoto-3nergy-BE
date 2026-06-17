-- This is an empty migration.
CREATE OR REPLACE FUNCTION create_history_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  pk_column TEXT;
  record_id TEXT;
  history_operation "OperationType";
  before_data JSONB;
  after_data JSONB;
BEGIN
  pk_column := TG_ARGV[0];

  IF TG_OP = 'INSERT' THEN
    after_data := to_jsonb(NEW) - 'password_hash' - 'token';
    record_id := after_data ->> pk_column;
    history_operation := 'CREATE';

    INSERT INTO histories (table_name, table_id, operation_type, data, created_at)
    VALUES (
      TG_TABLE_NAME,
      COALESCE(record_id, 'UNKNOWN'),
      history_operation,
      jsonb_build_object('before', NULL, 'after', after_data),
      NOW()
    );

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    before_data := to_jsonb(OLD) - 'password_hash' - 'token';
    after_data := to_jsonb(NEW) - 'password_hash' - 'token';
    record_id := after_data ->> pk_column;
    history_operation := 'UPDATE';

    INSERT INTO histories (table_name, table_id, operation_type, data, created_at)
    VALUES (
      TG_TABLE_NAME,
      COALESCE(record_id, 'UNKNOWN'),
      history_operation,
      jsonb_build_object('before', before_data, 'after', after_data),
      NOW()
    );

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    before_data := to_jsonb(OLD) - 'password_hash' - 'token';
    record_id := before_data ->> pk_column;
    history_operation := 'DELETE';

    INSERT INTO histories (table_name, table_id, operation_type, data, created_at)
    VALUES (
      TG_TABLE_NAME,
      COALESCE(record_id, 'UNKNOWN'),
      history_operation,
      jsonb_build_object('before', before_data, 'after', NULL),
      NOW()
    );

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_history_audit_trigger ON users;
CREATE TRIGGER users_history_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION create_history_audit_log('uuid');

DROP TRIGGER IF EXISTS user_points_history_audit_trigger ON user_points;
CREATE TRIGGER user_points_history_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_points
FOR EACH ROW
EXECUTE FUNCTION create_history_audit_log('user_uuid');

DROP TRIGGER IF EXISTS photocards_history_audit_trigger ON photocards;
CREATE TRIGGER photocards_history_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON photocards
FOR EACH ROW
EXECUTE FUNCTION create_history_audit_log('id');

DROP TRIGGER IF EXISTS user_photocards_history_audit_trigger ON user_photocards;
CREATE TRIGGER user_photocards_history_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_photocards
FOR EACH ROW
EXECUTE FUNCTION create_history_audit_log('id');

DROP TRIGGER IF EXISTS sales_history_audit_trigger ON sales;
CREATE TRIGGER sales_history_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON sales
FOR EACH ROW
EXECUTE FUNCTION create_history_audit_log('id');

DROP TRIGGER IF EXISTS trades_history_audit_trigger ON trades;
CREATE TRIGGER trades_history_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON trades
FOR EACH ROW
EXECUTE FUNCTION create_history_audit_log('id');

DROP TRIGGER IF EXISTS notifications_history_audit_trigger ON notifications;
CREATE TRIGGER notifications_history_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON notifications
FOR EACH ROW
EXECUTE FUNCTION create_history_audit_log('id');