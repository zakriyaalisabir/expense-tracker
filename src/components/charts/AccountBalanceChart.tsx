"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";

export default function AccountBalanceChart() {
  const { accounts, transactions } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 360, height = 360, radius = Math.min(width, height) / 2;

    const tooltip = d3.select(tooltipRef.current);

    const balances = accounts.map(acc => {
      const txs = transactions.filter(t => t.account_id === acc.id);
      const balance = acc.opening_balance + txs.reduce((sum, t) => 
        sum + (t.type === "income" ? t.amount : -t.amount), 0);
      return { name: acc.name, balance: Math.abs(balance), currency: acc.currency };
    }).filter(d => d.balance > 0);

    if (balances.length === 0) return;

    const total = d3.sum(balances, d => d.balance);

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
    const pie = d3.pie<any>().value(d => d.balance);
    const arc = d3.arc<any>().innerRadius(0).outerRadius(radius * 0.8);
    const color = d3.scaleOrdinal<string>().domain(balances.map(d => d.name)).range(d3.schemeSet3);

    g.selectAll("path")
      .data(pie(balances))
      .enter()
      .append("path")
      .attr("d", arc as any)
      .attr("fill", d => color(d.data.name))
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) { 
        d3.select(this).attr("opacity", 0.8).attr("stroke-width", 4);
        const pct = ((d.data.balance / total) * 100).toFixed(1);
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.data.name}</strong><br/>Balance: ${d.data.balance.toFixed(2)} ${d.data.currency}<br/>Share: ${pct}%`);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() { 
        d3.select(this).attr("opacity", 1).attr("stroke-width", 3);
        tooltip.style("opacity", 0);
      });

    const legend = svg.append("g").attr("transform", `translate(10, 10)`);
    balances.forEach((d, i) => {
      const row = legend.append("g").attr("transform", `translate(0, ${i * 18})`);
      row.append("rect").attr("width", 12).attr("height", 12).attr("fill", color(d.name)).attr("rx", 2);
      row.append("text").attr("x", 16).attr("y", 10).attr("font-size", "10px").attr("font-weight", "500").text(d.name);
    });
  }, [accounts, transactions]);

  return (
    <>
      <svg ref={ref} width={360} height={360} role="img" aria-label="Account balance distribution" />
      <div ref={tooltipRef} style={{
        position: 'fixed',
        opacity: 0,
        pointerEvents: 'none',
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'opacity 0.2s'
      }} />
    </>
  );
}
