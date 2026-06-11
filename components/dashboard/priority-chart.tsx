"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PriorityItem {
  name: string;
  value: number;
  color: string;
}

interface PriorityChartProps {
  data: PriorityItem[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: PriorityItem }> }) {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-sm">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-medium">{name}</span>
      </div>
      <p className="text-muted-foreground mt-0.5">{value}개 이슈</p>
    </div>
  );
}

export function PriorityChart({ data }: PriorityChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary/40" />
          <CardTitle className="text-sm font-medium">우선순위 분포</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground/50 text-center py-6 italic">데이터가 없습니다</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={62}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5 min-w-0">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                  <span className="ml-auto font-medium tabular-nums">{item.value}</span>
                  <span className="text-muted-foreground/50 w-8 text-right tabular-nums">
                    {Math.round((item.value / total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
