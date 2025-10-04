"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";

export default function CashFlowChart() {
  const { transactions } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 720, height = 280, margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulative = 0;
    const data = sorted.map(t => {
      cumulative += t.type === "income" ? t.base_amount : -t.base_amount;
      return { date: t.date.slice(0, 10), balance: cumulative };
    });

    if (data.length === 0) return;

    const x = d3.scaleTime()
      .domain([new Date(data[0].date), new Date(data[data.length - 1].date)])
      .range([0, innerW]);
    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d.balance) || 0, d3.max(data, d => d.balance) || 1])
      .nice()
      .range([innerH, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const area = d3.area<any>()
      .x(d => x(new Date(d.date)))
      .y0(innerH)
      .y1(d => y(d.balance));

    const line = d3.line<any>()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.balance));

    g.append("path")
      .datum(data)
      .attr("fill", "rgba(33, 150, 243, 0.2)")
      .attr("d", area);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#2196f3")
      .attr("stroke-width", 2)
      .attr("d", line);

    g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x).ticks(6));
    g.append("g").call(d3.axisLeft(y));
  }, [transactions]);

  return <svg ref={ref} width={720} height={280} role="img" aria-label="Cumulative cash flow" />;
}
