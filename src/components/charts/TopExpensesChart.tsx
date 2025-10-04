"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";

export default function TopExpensesChart() {
  const { transactions } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 360, height = 320, margin = { top: 20, right: 20, bottom: 40, left: 120 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const expenses = transactions
      .filter(t => t.type === "expense")
      .sort((a, b) => b.base_amount - a.base_amount)
      .slice(0, 10)
      .map(t => ({
        desc: t.description || "No description",
        amount: t.base_amount,
        date: t.date.slice(5, 10)
      }));

    if (expenses.length === 0) return;

    const x = d3.scaleLinear().domain([0, d3.max(expenses, d => d.amount) || 1]).nice().range([0, innerW]);
    const y = d3.scaleBand().domain(expenses.map((_, i) => i.toString())).range([0, innerH]).padding(0.2);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll("rect")
      .data(expenses)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (_, i) => y(i.toString()) ?? 0)
      .attr("width", d => x(d.amount))
      .attr("height", y.bandwidth())
      .attr("fill", "#ef5350")
      .append("title")
      .text(d => `${d.desc} (${d.date}): ${d3.format("$.2f")(d.amount)}`);

    g.selectAll("text.label")
      .data(expenses)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", -5)
      .attr("y", (_, i) => (y(i.toString()) ?? 0) + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "10px")
      .text(d => d.desc.slice(0, 15) + (d.desc.length > 15 ? "..." : ""));

    g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x).ticks(5));
  }, [transactions]);

  return <svg ref={ref} width={360} height={320} role="img" aria-label="Top 10 expenses" />;
}
