interface Props {
  matrix: number[][];
  solution: number[];
}

export default function AssignmentVisualization({ matrix, solution }: Props) {
  const assignments = new Set<string>();
  if (Array.isArray(solution)) {
    solution.forEach((col, row) => {
      assignments.add(`${row}-${col}`);
    });
  }

  return (
    <div className="overflow-auto">
      <table className="text-sm">
        <thead>
          <tr>
            <th className="w-10" />
            {matrix[0]?.map((_, c) => (
              <th key={c} className="text-slate-400 px-3 py-2 text-center">
                Задача {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, r) => (
            <tr key={r}>
              <td className="text-slate-400 pr-2 text-right font-medium">
                Раб. {r}
              </td>
              {row.map((val, c) => {
                const isAssigned = assignments.has(`${r}-${c}`);
                return (
                  <td
                    key={c}
                    className={`px-3 py-2 text-center border border-slate-700 ${
                      isAssigned
                        ? 'bg-emerald-600/30 text-emerald-300 font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
