"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";

export default function WeekdaySpendingChart() {
  const { transactions } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 360, height = 280, margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const byWeekday = d3.rollups(
      transactions.filter(t => t.type === "expense"),
      v => d3.sum(v, d => d.base_amount),
      d => new Date(d.date).getDay()
    );

    const data = weekdays.map((day, i) => ({
      day,
      amount: byWeekday.find(([idx]) => idx === i)?.[1] || 0
    }));

    const x = d3.scaleBand().domain(weekdays).range([0, innerW]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.amount) || 1]).nice().range([innerH, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.day) ?? 0)
      .attr("y", d => y(d.amount))
      .attr("width", x.bandwidth())
      .attr("height", d => innerH - y(d.amount))
      .attr("fill", "#ff9800")
      .append("title")
      .text(d => `${d.day}: ${d3.format("$.2f")(d.amount)}`);

    g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x));
    g.append("g").call(d3.axisLeft(y));
  }, [transactions]);

  return <svg ref={ref} width={360} height={280} role="img" aria-label="Spending by weekday" />;
}
