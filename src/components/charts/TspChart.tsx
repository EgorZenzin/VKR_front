import type { City } from '../../types';

interface Props {
  data: Record<string, unknown>;
}

const PAD = 40;
const W = 600;
const H = 360;
const R = 14; // city circle radius

function toSvg(
  val: number,
  min: number,
  max: number,
  svgMin: number,
  svgMax: number,
): number {
  if (max === min) return (svgMin + svgMax) / 2;
  return svgMin + ((val - min) / (max - min)) * (svgMax - svgMin);
}

export default function TspChart({ data }: Props) {
  const routeCoords = (data.route_coordinates || []) as City[];
  const allCities = (data.cities || routeCoords) as City[];

  const rawRoute = routeCoords.length > 0 ? routeCoords : allCities;

  if (rawRoute.length === 0) {
    return <p className="text-slate-400 text-sm">Нет данных маршрута</p>;
  }

  // Drop duplicate closing point if backend returns closed route
  const first = rawRoute[0];
  const last = rawRoute[rawRoute.length - 1];
  const isClosed = first.x === last.x && first.y === last.y && rawRoute.length > 1;
  const route = isClosed ? rawRoute.slice(0, -1) : rawRoute;

  const xs = route.map((c) => c.x);
  const ys = route.map((c) => c.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  const px = (x: number) => toSvg(x, minX, maxX, PAD, W - PAD);
  const py = (y: number) => toSvg(y, minY, maxY, H - PAD, PAD);

  const n = route.length;
  const indices = Array.from({ length: n + 1 }, (_, i) => i % n);

  // Map coordinate key -> original city index (1-based) for tooltip-style label.
  // allCities holds the original ordered list sent to the backend.
  const origIndexMap = new Map<string, number>();
  allCities.forEach((c, i) => {
    origIndexMap.set(`${c.x},${c.y}`, i + 1);
  });

  function arrowLine(i: number, j: number) {
    const ax = px(route[i].x), ay = py(route[i].y);
    const bx = px(route[j].x), by = py(route[j].y);
    const dx = bx - ax, dy = by - ay;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    return {
      x1: ax + ux * (R + 2),
      y1: ay + uy * (R + 2),
      x2: bx - ux * (R + 6),
      y2: by - uy * (R + 6),
    };
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 360 }}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="2"
            orient="auto"
          >
            <path d="M0,0 L0,4 L8,2 z" fill="#3B82F6" />
          </marker>
        </defs>

        {/* Edges with arrows */}
        {indices.slice(0, -1).map((ci, step) => {
          const nxt = indices[step + 1];
          const { x1, y1, x2, y2 } = arrowLine(ci, nxt);
          return (
            <line
              key={`edge-${step}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#3B82F6"
              strokeWidth={1.8}
              strokeOpacity={0.7}
              markerEnd="url(#arrow)"
            />
          );
        })}

        {/* City nodes */}
        {route.map((city, idx) => {
          const cx = px(city.x);
          const cy = py(city.y);
          const isFirst = idx === 0;
          const origIdx = origIndexMap.get(`${city.x},${city.y}`);
          return (
            <g key={`city-${idx}`}>
              <circle
                cx={cx} cy={cy} r={R}
                fill={isFirst ? '#F59E0B' : '#1e40af'}
                stroke={isFirst ? '#FDE68A' : '#93C5FD'}
                strokeWidth={2}
              />
              {/* Route order number inside circle */}
              <text
                x={cx} y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight="bold"
                fill="white"
              >
                {idx + 1}
              </text>
              {/* Original city index — small badge top-right of circle */}
              {origIdx !== undefined && (
                <>
                  <circle
                    cx={cx + R - 1} cy={cy - R + 1} r={8}
                    fill="#0f172a"
                    stroke="#94a3b8"
                    strokeWidth={1}
                  />
                  <text
                    x={cx + R - 1} y={cy - R + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={8}
                    fill="#94a3b8"
                  >
                    {origIdx}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <circle cx={PAD} cy={H - 10} r={6} fill="#F59E0B" stroke="#FDE68A" strokeWidth={1.5} />
        <text x={PAD + 10} y={H - 6} fontSize={10} fill="#94a3b8">Старт</text>
        <circle cx={PAD + 70} cy={H - 10} r={6} fill="#1e40af" stroke="#93C5FD" strokeWidth={1.5} />
        <text x={PAD + 80} y={H - 6} fontSize={10} fill="#94a3b8">Город</text>
      </svg>
    </div>
  );
}
