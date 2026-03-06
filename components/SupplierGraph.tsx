
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Supplier } from '../types';

interface SupplierGraphProps {
  suppliers: Supplier[];
}

const SupplierGraph: React.FC<SupplierGraphProps> = ({ suppliers }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || suppliers.length === 0) return;

    const width = 600;
    const height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = suppliers.map(s => ({ 
      id: s.id, 
      name: s.name, 
      score: s.contributionScore,
      industry: s.industry 
    }));
    
    const links: any[] = [];
    suppliers.forEach(s => {
      s.dependencies.forEach(dep => {
        links.push({ source: s.id, target: dep });
      });
    });

    const simulation = d3.forceSimulation(nodes as any)
     .force("link", d3.forceLink(links).id((d: any) => d.id).distance(140))
.force("charge", d3.forceManyBody().strength(-500))
.force("collision", d3.forceCollide().radius((d: any) => Math.sqrt(d.score) * 0.8 + 12))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d: any) => Math.sqrt(d.score) * 0.8 + 6)
      .attr("fill", (d: any) =>
  d.score > 2000 ? "#ef4444" :
  d.score > 1500 ? "#f59e0b" :
  "#10b981"
)
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    const labels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d: any) => d.name)
      .attr("font-size", "10px")
      .attr("dx", 12)
      .attr("dy", 4)
      .attr("class", "pointer-events-none fill-slate-600 font-medium");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
  .attr("cx", (d: any) => d.x = Math.max(30, Math.min(width - 30, d.x)))
  .attr("cy", (d: any) => d.y = Math.max(30, Math.min(height - 30, d.y)));

      labels
  .attr("x", (d: any) => d.x)
  .attr("y", (d: any) => d.y);
    });
    return () => {
    simulation.stop();
  };

  }, [suppliers]);

  return (
    <div className="w-full h-[400px] bg-white border border-slate-200 rounded-xl overflow-hidden relative shadow-inner">
      <div className="absolute top-4 left-4 z-10">
        <h4 className="text-sm font-semibold text-slate-700">Supplier Dependency Graph</h4>
        <p className="text-xs text-slate-400">Node size indicates carbon impact</p>
      </div>
      <svg ref={svgRef} className="w-full h-full" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
};

export default SupplierGraph;
