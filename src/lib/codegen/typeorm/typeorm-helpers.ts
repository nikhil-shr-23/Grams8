export function toTypeOrmTableName(tableName: string): string {
  return tableName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

export function toTypeOrmClassName(tableName: string): string {
  const pascalCase = tableName
    .split(/[^a-zA-Z0-9]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  return `Create${pascalCase}Table`;
}

export function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function escapeString(str: string): string {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

export function getTypeOrmColumnType(columnType: string): string {
  const type = columnType.toLowerCase();
  
  // Map common database types to TypeORM column types
  switch (type) {
    case 'varchar':
    case 'text':
    case 'longtext':
    case 'mediumtext':
    case 'tinytext':
      return 'varchar';
    case 'char':
      return 'char';
    case 'int':
    case 'integer':
    case 'tinyint':
    case 'smallint':
    case 'mediumint':
    case 'bigint':
      return 'int';
    case 'float':
    case 'double':
    case 'real':
      return 'float';
    case 'decimal':
    case 'numeric':
      return 'decimal';
    case 'boolean':
    case 'bool':
      return 'boolean';
    case 'date':
      return 'date';
    case 'time':
      return 'time';
    case 'datetime':
    case 'timestamp':
      return 'timestamp';
    case 'json':
    case 'jsonb':
      return 'json';
    case 'uuid':
      return 'uuid';
    case 'enum':
      return 'enum';
    case 'set':
      return 'set';
    default:
      return 'varchar';
  }
}