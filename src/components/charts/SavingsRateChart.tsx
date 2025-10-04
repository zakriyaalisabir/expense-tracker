"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";

export default function SavingsRateChart() {
  const { transactions } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 720, height = 280, margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const byMonth = d3.rollups(transactions, v => {
      const income = d3.sum(v.filter(t => t.type === "income"), d => d.base_amount);
      const expense = d3.sum(v.filter(t => t.type === "expense"), d => d.base_amount);
      return { income, expense, rate: income ? ((income - expense) / income) * 100 : 0 };
    }, d => d.date.slice(0, 7)).sort((a, b) => d3.ascending(a[0], b[0]));

    if (byMonth.length === 0) return;

    const x = d3.scaleBand().domain(byMonth.map(d => d[0])).range([0, innerW]).padding(0.2);
    const y = d3.scaleLinear().domain([-20, 100]).range([innerH, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const line = d3.line<any>()
      .x(d => (x(d[0]) ?? 0) + x.bandwidth() / 2)
      .y(d => y(d[1].rate));

    g.append("path")
      .datum(byMonth)
      .attr("fill", "none")
      .attr("stroke", "#2196f3")
      .attr("stroke-width", 2)
      .attr("d", line);

    g.selectAll("circle")
      .data(byMonth)
      .enter()
      .append("circle")
      .attr("cx", d => (x(d[0]) ?? 0) + x.bandwidth() / 2)
      .attr("cy", d => y(d[1].rate))
      .attr("r", 4)
      .attr("fill", d => d[1].rate >= 0 ? "#4caf50" : "#ef5350")
      .append("title")
      .text(d => `${d[0]}: ${d[1].rate.toFixed(1)}%`);

    g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x));
    g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));
    g.append("line").attr("x1", 0).attr("x2", innerW).attr("y1", y(0)).attr("y2", y(0))
      .attr("stroke", "#999").attr("stroke-dasharray", "2,2");
  }, [transactions]);

  return <svg ref={ref} width={720} height={280} role="img" aria-label="Savings rate trend" />;
}
