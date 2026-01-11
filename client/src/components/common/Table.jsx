import React from 'react';

/**
 * A reusable table component with Tailwind CSS.
 *
 * @param {Array<Object>} columns - Array of column definitions. e.g., [{ header: 'Name', accessor: 'name' }]
 * @param {Array<Object>} data - Array of data objects to display in rows.
 * @param {Function} [renderActions] - Optional function that receives a data row and returns JSX for the actions cell.
 */
const Table = ({ columns, data, renderActions }) => {
  if (!data || data.length === 0) {
    return <p className="py-4 text-center text-gray-500">No data to display.</p>;
  }

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow-md sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.accessor}
                      scope="col"
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      {column.header}
                    </th>
                  ))}
                  {renderActions && (
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, rowIndex) => (
                  <tr key={row._id || rowIndex} className="transition-colors hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.accessor} className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {/* Use a function for nested accessors like 'user.name' if needed in the future */}
                          {row[column.accessor] || 'N/A'}
                        </div>
                      </td>
                    ))}
                    {renderActions && (
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        {renderActions(row)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;