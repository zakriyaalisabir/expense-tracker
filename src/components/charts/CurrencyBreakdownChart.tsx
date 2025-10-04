"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";
import { groupByCurrency } from "@lib/currency";

export default function CurrencyBreakdownChart() {
  const { transactions } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 720, height = 320, margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const currencyData = groupByCurrency(transactions);
    const data = Object.entries(currencyData).map(([currency, totals]) => ({
      currency,
      income: totals.income,
      expense: totals.expense,
      saved: totals.saved,
      savings: totals.savings
    }));

    if (data.length === 0) return;

    const x0 = d3.scaleBand().domain(data.map(d => d.currency)).range([0, innerW]).padding(0.1);
    const x1 = d3.scaleBand().domain(["income", "expense", "saved"]).range([0, x0.bandwidth()]).padding(0.05);
    const maxY = d3.max(data, d => Math.max(d.income, d.expense, d.saved)) || 1;
    const y = d3.scaleLinear().domain([-maxY * 0.2, maxY]).nice().range([innerH, 0]);

    const color = d3.scaleOrdinal<string>()
      .domain(["income", "expense", "saved"])
      .range(["#4caf50", "#ef5350", "#2196f3"]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    data.forEach(d => {
      const currencyG = g.append("g").attr("transform", `translate(${x0(d.currency)},0)`);
      
      currencyG.append("rect")
        .attr("x", x1("income"))
        .attr("y", y(d.income))
        .attr("width", x1.bandwidth())
        .attr("height", innerH - y(d.income))
        .attr("fill", color("income"))
        .append("title")
        .text(`${d.currency} Income: ${d.income.toFixed(2)}`);

      currencyG.append("rect")
        .attr("x", x1("expense"))
        .attr("y", y(d.expense))
        .attr("width", x1.bandwidth())
        .attr("height", innerH - y(d.expense))
        .attr("fill", color("expense"))
        .append("title")
        .text(`${d.currency} Expense: ${d.expense.toFixed(2)}`);

      currencyG.append("rect")
        .attr("x", x1("saved"))
        .attr("y", y(d.saved))
        .attr("width", x1.bandwidth())
        .attr("height", innerH - y(d.saved))
        .attr("fill", color("saved"))
        .append("title")
        .text(`${d.currency} Saved: ${d.saved.toFixed(2)}`);
    });

    g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x0));
    g.append("g").call(d3.axisLeft(y));
    g.append("line").attr("x1", 0).attr("x2", innerW).attr("y1", y(0)).attr("y2", y(0))
      .attr("stroke", "#666").attr("stroke-dasharray", "3,3");
  }, [transactions]);

  return <svg ref={ref} width={720} height={320} role="img" aria-label="Currency breakdown chart" />;
}