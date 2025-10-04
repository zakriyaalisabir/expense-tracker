"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";

export default function CategoryBreakdownChart(){
  const { transactions, categories } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 360, height = 360, radius = Math.min(width, height) / 2;

    const sums = d3.rollups(
      transactions.filter(t => t.type==="expense"),
      v => d3.sum(v, d => d.base_amount),
      d => d.category_id
    );
    const data = sums.map(([catId, total]) => ({
      label: categories.find(c => c.id===catId)?.name ?? catId,
      value: total
    })).filter(d => d.value > 0);

    const g = svg.append("g").attr("transform", `translate(${width/2},${height/2})`);
    const pie = d3.pie<any>().value(d => d.value);
    const arc = d3.arc<any>().innerRadius(radius*0.5).outerRadius(radius*0.9);
    const color = d3.scaleOrdinal<string>().domain(data.map(d => d.label)).range(d3.schemeTableau10);
    const arcs = g.selectAll("path").data(pie(data)).enter().append("path").attr("d", arc as any);
    arcs
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("fill", d => color(d.data.label))
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.8).attr("stroke-width", 3);
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1).attr("stroke-width", 2);
      })
      .append("title")
      .text(d => `${d.data.label}: ${d3.format("$,.2f")(d.data.value)} (${((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1)}%)`);

    const legend = svg.append("g").attr("transform", `translate(10, 10)`);
    data.forEach((d, i) => {
      const row = legend.append("g").attr("transform", `translate(0, ${i * 18})`);
      row.append("rect").attr("width", 12).attr("height", 12).attr("fill", color(d.label)).attr("rx", 2);
      row.append("text").attr("x", 16).attr("y", 10).attr("font-size", "10px").attr("font-weight", "500").text(d.label);
    });
  }, [transactions, categories]);

  return <svg ref={ref} width={360} height={360} role="img" aria-label="Category breakdown pie chart" />;
}
