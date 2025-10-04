"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";
import { CurrencyCode } from "@lib/types";

export default function CategoryByCurrencyChart() {
  const { transactions, categories } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 720, height = 400, margin = { top: 20, right: 120, bottom: 40, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const expenseTransactions = transactions.filter(t => t.type === "expense");
    const byCategoryCurrency = d3.rollups(
      expenseTransactions,
      v => {
        const byCurrency: Record<CurrencyCode, number> = {} as any;
        v.forEach(t => {
          if (!byCurrency[t.currency]) byCurrency[t.currency] = 0;
          byCurrency[t.currency] += t.amount;
        });
        return byCurrency;
      },
      d => d.category_id
    );

    if (byCategoryCurrency.length === 0) return;

    const allCurrencies = Array.from(new Set(expenseTransactions.map(t => t.currency)));
    const categoryNames = byCategoryCurrency.map(([catId]) => 
      categories.find(c => c.id === catId)?.name || catId
    );

    const x = d3.scaleBand().domain(categoryNames).range([0, innerW]).padding(0.1);
    const maxY = d3.max(byCategoryCurrency, ([, currencyData]) => 
      d3.max(Object.values(currencyData))
    ) || 1;
    const y = d3.scaleLinear().domain([0, maxY]).nice().range([innerH, 0]);

    const color = d3.scaleOrdinal<string>()
      .domain(allCurrencies)
      .range(d3.schemeTableau10);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const barWidth = x.bandwidth() / allCurrencies.length;

    byCategoryCurrency.forEach(([catId, currencyData]) => {
      const categoryName = categories.find(c => c.id === catId)?.name || catId;
      let offset = 0;
      
      allCurrencies.forEach(currency => {
        const amount = currencyData[currency as CurrencyCode] || 0;
        
        if (amount > 0) {
          g.append("rect")
            .attr("x", (x(categoryName) || 0) + offset)
            .attr("y", y(amount))
            .attr("width", barWidth)
            .attr("height", innerH - y(amount))
            .attr("fill", color(currency))
            .append("title")
            .text(`${categoryName} (${currency}): ${amount.toFixed(2)}`);
        }
        
        offset += barWidth;
      });
    });

    g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x));
    g.append("g").call(d3.axisLeft(y));

    const legend = svg.append("g").attr("transform", `translate(${width - 110}, 30)`);
    allCurrencies.forEach((currency, i) => {
      const legendRow = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      legendRow.append("rect").attr("width", 15).attr("height", 15).attr("fill", color(currency));
      legendRow.append("text").attr("x", 20).attr("y", 12).attr("font-size", "12px").text(currency);
    });
  }, [transactions, categories]);

  return <svg ref={ref} width={720} height={400} role="img" aria-label="Category breakdown by currency chart" />;
}