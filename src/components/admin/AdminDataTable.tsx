import type React from "react";

export function AdminDataTable({
  columns,
  rows
}: {
  columns: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[#0f1812] text-[#f4ecd9] shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
      <table className="w-full text-sm">
        <thead className="bg-white/5">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-4 text-left font-medium text-[#e8dcc8]">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-white/8">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-4 align-top text-[#d8ccb8]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
