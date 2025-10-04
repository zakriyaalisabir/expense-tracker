"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";

export default function TrendHeatmap(){
  const { transactions } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 720, height = 160, margin = { top: 10, right: 10, bottom: 20, left: 30 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const byDay = d3.rollups(
      transactions,
      v => ({
        income: d3.sum(v.filter(t => t.type==="income"), d => d.base_amount),
        expense: d3.sum(v.filter(t => t.type==="expense"), d => d.base_amount)
      }),
      d => d.date.slice(0,10)
    ).sort((a,b) => d3.ascending(a[0], b[0]));

    const x = d3.scaleBand().domain(byDay.map(d=>d[0])).range([0, innerW]).padding(0.05);
    const y = d3.scaleBand().domain(["income","expense"]).range([0, innerH]).padding(0.1);
    const maxV = d3.max(byDay, d => Math.max(d[1].income, d[1].expense)) || 1;
    const color = d3.scaleLinear<string>().domain([0, maxV]).range(["#eee","#999"]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    byDay.forEach(d => {
      ["income","expense"].forEach(k => {
        g.append("rect")
          .attr("x", x(d[0]) ?? 0)
          .attr("y", y(k) ?? 0)
          .attr("width", x.bandwidth())
          .attr("height", y.bandwidth())
          .attr("fill", color(d[1][k as "income"|"expense"]));
      });
    });

    g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x).tickValues(x.domain().filter((_,i)=>i%3===0)));
    g.append("g").call(d3.axisLeft(y));
  }, [transactions]);

  return <svg ref={ref} width={720} height={160} role="img" aria-label="Daily/Weekly trend heatmap" />;
}
