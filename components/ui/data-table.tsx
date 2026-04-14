export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  actions,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-3 text-left text-sm font-medium text-gray-700"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={String((item as any)._id || (item as any).id || index)} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-6 py-4 text-sm text-gray-900"
                >
                  {col.render ? col.render(item[col.key], item) : String(item[col.key])}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 text-right text-sm space-x-2">
                  {actions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
