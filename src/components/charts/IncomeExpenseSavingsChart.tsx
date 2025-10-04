"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";

export default function IncomeExpenseSavingsChart() {
  const { transactions } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 720, height = 320, margin = { top: 20, right: 120, bottom: 40, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const byMonth = d3.rollups(transactions, v => ({
      income: d3.sum(v.filter(t => t.type === "income"), d => d.base_amount),
      expense: d3.sum(v.filter(t => t.type === "expense"), d => d.base_amount),
      savings: d3.sum(v.filter(t => t.type === "savings"), d => d.base_amount)
    }), d => d.date.slice(0, 7)).sort((a, b) => d3.ascending(a[0], b[0]));

    if (byMonth.length === 0) return;

    const x = d3.scaleBand().domain(byMonth.map(d => d[0])).range([0, innerW]).padding(0.2);
    const maxY = d3.max(byMonth, d => Math.max(d[1].income, d[1].expense, d[1].savings)) || 1;
    const y = d3.scaleLinear().domain([0, maxY]).nice().range([innerH, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const barWidth = x.bandwidth() / 3;

    byMonth.forEach(([month, data]) => {
      const xPos = x(month) || 0;
      
      g.append("rect")
        .attr("x", xPos)
        .attr("y", y(data.income))
        .attr("width", barWidth)
        .attr("height", innerH - y(data.income))
        .attr("fill", "#4caf50")
        .attr("rx", 4)
        .style("cursor", "pointer")
        .on("mouseover", function() { d3.select(this).attr("opacity", 0.8); })
        .on("mouseout", function() { d3.select(this).attr("opacity", 1); })
        .append("title")
        .text(`${month} Income: ${d3.format("$,.2f")(data.income)}`);

      g.append("rect")
        .attr("x", xPos + barWidth)
        .attr("y", y(data.expense))
        .attr("width", barWidth)
        .attr("height", innerH - y(data.expense))
        .attr("fill", "#ef5350")
        .attr("rx", 4)
        .style("cursor", "pointer")
        .on("mouseover", function() { d3.select(this).attr("opacity", 0.8); })
        .on("mouseout", function() { d3.select(this).attr("opacity", 1); })
        .append("title")
        .text(`${month} Expense: ${d3.format("$,.2f")(data.expense)}`);

      g.append("rect")
        .attr("x", xPos + barWidth * 2)
        .attr("y", y(data.savings))
        .attr("width", barWidth)
        .attr("height", innerH - y(data.savings))
        .attr("fill", "#2196f3")
        .attr("rx", 4)
        .style("cursor", "pointer")
        .on("mouseover", function() { d3.select(this).attr("opacity", 0.8); })
        .on("mouseout", function() { d3.select(this).attr("opacity", 1); })
        .append("title")
        .text(`${month} Savings: ${d3.format("$,.2f")(data.savings)}`);
    });

    g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x)).selectAll("text").style("font-size", "11px");
    g.append("g").call(d3.axisLeft(y).tickFormat(d => d3.format("$,.0f")(d as number))).selectAll("text").style("font-size", "11px");

    const legend = svg.append("g").attr("transform", `translate(${width - 110}, 20)`);
    legend.append("rect").attr("width", 100).attr("height", 70).attr("fill", "white").attr("stroke", "#ddd").attr("rx", 4);
    [["Income", "#4caf50"], ["Expense", "#ef5350"], ["Savings", "#2196f3"]].forEach(([label, color], i) => {
      const row = legend.append("g").attr("transform", `translate(8, ${i * 20 + 15})`);
      row.append("rect").attr("width", 12).attr("height", 12).attr("fill", color).attr("rx", 2);
      row.append("text").attr("x", 18).attr("y", 10).attr("font-size", "11px").attr("font-weight", "500").text(label);
    });
  }, [transactions]);

  return <svg ref={ref} width={720} height={320} role="img" aria-label="Income, Expense, and Savings chart" />;
}
