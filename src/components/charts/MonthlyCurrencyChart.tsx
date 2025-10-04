"use client";
import * as React from "react";
import * as d3 from "d3";
import { useAppStore } from "@lib/store";
import { CurrencyCode } from "@lib/types";

export default function MonthlyCurrencyChart() {
  const { transactions } = useAppStore();
  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 720, height = 400, margin = { top: 20, right: 100, bottom: 40, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const byMonthCurrency = d3.rollups(
      transactions,
      v => {
        const byCurrency: Record<CurrencyCode, { income: number; expense: number }> = {} as any;
        v.forEach(t => {
          if (!byCurrency[t.currency]) {
            byCurrency[t.currency] = { income: 0, expense: 0 };
          }
          if (t.type === "income") {
            byCurrency[t.currency].income += t.amount;
          } else {
            byCurrency[t.currency].expense += t.amount;
          }
        });
        return byCurrency;
      },
      d => d.date.slice(0, 7)
    ).sort((a, b) => d3.ascending(a[0], b[0]));

    if (byMonthCurrency.length === 0) return;

    const allCurrencies = Array.from(new Set(transactions.map(t => t.currency)));
    const x = d3.scaleBand().domain(byMonthCurrency.map(d => d[0])).range([0, innerW]).padding(0.1);
    
    const maxY = d3.max(byMonthCurrency, d => 
      d3.max(Object.values(d[1]), v => Math.max(v.income, v.expense))
    ) || 1;
    const y = d3.scaleLinear().domain([0, maxY]).nice().range([innerH, 0]);

    const color = d3.scaleOrdinal<string>()
      .domain(allCurrencies)
      .range(d3.schemeTableau10);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const barWidth = x.bandwidth() / (allCurrencies.length * 2);

    byMonthCurrency.forEach(([month, currencyData]) => {
      let offset = 0;
      allCurrencies.forEach(currency => {
        const data = currencyData[currency as CurrencyCode] || { income: 0, expense: 0 };
        
        if (data.income > 0) {
          g.append("rect")
            .attr("x", (x(month) || 0) + offset)
            .attr("y", y(data.income))
            .attr("width", barWidth)
            .attr("height", innerH - y(data.income))
            .attr("fill", color(currency))
            .attr("opacity", 0.8)
            .append("title")
            .text(`${month} ${currency} Income: ${data.income.toFixed(2)}`);
        }

        if (data.expense > 0) {
          g.append("rect")
            .attr("x", (x(month) || 0) + offset + barWidth)
            .attr("y", y(data.expense))
            .attr("width", barWidth)
            .attr("height", innerH - y(data.expense))
            .attr("fill", color(currency))
            .attr("opacity", 0.4)
            .append("title")
            .text(`${month} ${currency} Expense: ${data.expense.toFixed(2)}`);
        }

        offset += barWidth * 2;
      });
    });

    g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x));
    g.append("g").call(d3.axisLeft(y));

    const legend = svg.append("g").attr("transform", `translate(${width - 90}, 30)`);
    allCurrencies.forEach((currency, i) => {
      const legendRow = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      legendRow.append("rect").attr("width", 15).attr("height", 15).attr("fill", color(currency));
      legendRow.append("text").attr("x", 20).attr("y", 12).attr("font-size", "12px").text(currency);
    });
  }, [transactions]);

  return <svg ref={ref} width={720} height={400} role="img" aria-label="Monthly currency breakdown chart" />;
}