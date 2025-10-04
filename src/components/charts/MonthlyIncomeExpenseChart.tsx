"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";

export default function MonthlyIncomeExpenseChart(){
  const { transactions } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 720, height = 320, margin = { top: 20, right: 120, bottom: 40, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const incomeColor = "#4caf50";
    const expenseColor = "#ef5350";

    const byMonth = d3.rollups(transactions, v => ({
      income: d3.sum(v.filter(t => t.type==="income"), d => d.base_amount),
      expense: d3.sum(v.filter(t => t.type==="expense"), d => d.base_amount)
    }), d => d.date.slice(0,7)).sort((a,b) => d3.ascending(a[0], b[0]));

    const x = d3.scaleBand().domain(byMonth.map(d=>d[0])).range([0, innerW]).padding(0.2);
    const maxY = d3.max(byMonth, d => Math.max(d[1].income, d[1].expense)) || 1;
    const y = d3.scaleLinear().domain([0, maxY]).nice().range([innerH, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll(".bar-inc").data(byMonth).enter().append("rect")
      .attr("class", "bar-inc")
      .attr("x", d => (x(d[0]) ?? 0))
      .attr("y", d => y(d[1].income))
      .attr("width", x.bandwidth()/2)
      .attr("height", d => innerH - y(d[1].income))
      .attr("fill", incomeColor)
      .attr("rx", 4)
      .style("cursor", "pointer")
      .on("mouseover", function() { d3.select(this).attr("opacity", 0.8); })
      .on("mouseout", function() { d3.select(this).attr("opacity", 1); })
      .append("title")
      .text(d => `${d[0]} Income: ${d3.format("$,.2f")(d[1].income)}`);

    g.selectAll(".bar-exp").data(byMonth).enter().append("rect")
      .attr("class", "bar-exp")
      .attr("x", d => (x(d[0]) ?? 0) + x.bandwidth()/2)
      .attr("y", d => y(d[1].expense))
      .attr("width", x.bandwidth()/2)
      .attr("height", d => innerH - y(d[1].expense))
      .attr("fill", expenseColor)
      .attr("rx", 4)
      .style("cursor", "pointer")
      .on("mouseover", function() { d3.select(this).attr("opacity", 0.8); })
      .on("mouseout", function() { d3.select(this).attr("opacity", 1); })
      .append("title")
      .text(d => `${d[0]} Expense: ${d3.format("$,.2f")(d[1].expense)}`);

    g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x)).selectAll("text").style("font-size", "11px");
    g.append("g").call(d3.axisLeft(y).tickFormat(d => d3.format("$,.0f")(d as number))).selectAll("text").style("font-size", "11px");

    const legend = svg.append("g").attr("transform", `translate(${width - 110}, 20)`);
    legend.append("rect").attr("width", 90).attr("height", 50).attr("fill", "white").attr("stroke", "#ddd").attr("rx", 4);
    [["Income", incomeColor], ["Expense", expenseColor]].forEach(([label, color], i) => {
      const row = legend.append("g").attr("transform", `translate(8, ${i * 20 + 15})`);
      row.append("rect").attr("width", 12).attr("height", 12).attr("fill", color).attr("rx", 2);
      row.append("text").attr("x", 18).attr("y", 10).attr("font-size", "11px").attr("font-weight", "500").text(label);
    });
  }, [transactions]);

  return <svg ref={ref} width={720} height={320} role="img" aria-label="Monthly Income vs Expense chart" />;
}
