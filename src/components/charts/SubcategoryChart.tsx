"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";

export default function SubcategoryChart() {
  const { transactions, categories } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 720, height = 320, margin = { top: 20, right: 20, bottom: 80, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const subcatTxs = transactions.filter(t => t.subcategory_id && t.type === "expense");
    const sums = d3.rollups(subcatTxs, v => d3.sum(v, d => d.base_amount), d => d.subcategory_id);
    
    const data = sums.map(([subId, total]) => {
      const subcat = categories.find(c => c.id === subId);
      const parent = subcat?.parent_id ? categories.find(c => c.id === subcat.parent_id) : null;
      return {
        label: subcat?.name ?? subId,
        parent: parent?.name ?? "",
        value: total
      };
    }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

    if (data.length === 0) return;

    const x = d3.scaleBand().domain(data.map(d => d.label)).range([0, innerW]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) || 1]).nice().range([innerH, 0]);
    const color = d3.scaleOrdinal<string>().domain(data.map(d => d.parent)).range(d3.schemeTableau10);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.label) ?? 0)
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => innerH - y(d.value))
      .attr("fill", d => color(d.parent))
      .append("title")
      .text(d => `${d.parent} > ${d.label}: ${d3.format("$.2f")(d.value)}`);

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    g.append("g").call(d3.axisLeft(y));
  }, [transactions, categories]);

  return <svg ref={ref} width={720} height={320} role="img" aria-label="Subcategory expenses" />;
}
