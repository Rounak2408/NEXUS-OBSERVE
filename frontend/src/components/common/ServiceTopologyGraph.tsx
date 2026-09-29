import React, { useState } from 'react';
import { Server, Database, ShieldCheck, Globe, Cpu, Layers, HardDrive, Info, Activity } from 'lucide-react';
import { TopologyNode, TopologyLink } from '../../types';

interface ServiceTopologyGraphProps {
  nodes: TopologyNode[];
  links: TopologyLink[];
  onSelectNode?: (node: TopologyNode) => void;
}

export const ServiceTopologyGraph: React.FC<ServiceTopologyGraphProps> = ({
  nodes,
  links,
  onSelectNode
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TopologyNode | null>(null);

  // Position nodes into 4 Tiers:
  // Tier 0: Internet
  // Tier 1: Load Balancers (CloudFront, NGINX)
  // Tier 2: API Services (Auth, Checkout, Payment, User)
  // Tier 3: Data & Processing (Redis, RDS, Postgres, Workers, Kafka, Prometheus)
  const tierMap: Record<string, number> = {
    'Internet': 0,
    'Load Balancer': 1,
    'Auth API': 2,
    'Web API': 2,
    'Payment Gateway': 2,
    'Database': 3,
    'Redis Cache': 3,
    'Worker': 3,
    'Monitoring': 3,
  };

  const tiers: Record<number, TopologyNode[]> = { 0: [], 1: [], 2: [], 3: [] };

  nodes.forEach(n => {
    const tier = tierMap[n.serviceType] ?? 2;
    tiers[tier].push(n);
  });

  const getCoordinates = (node: TopologyNode) => {
    const tier = tierMap[node.serviceType] ?? 2;
    const itemsInTier = tiers[tier];
    const indexInTier = itemsInTier.findIndex(x => x.id === node.id);

    // Tier horizontal positions
    const xMap: Record<number, number> = {
      0: 100,
      1: 340,
      2: 620,
      3: 920
    };
    const x = xMap[tier] || 500;

    // Fixed height spacing for height 560px
    const canvasHeight = 560;
    const count = itemsInTier.length || 1;
    const spacing = canvasHeight / (count + 1);
    const y = Math.round((indexInTier + 1) * spacing);

    return { x, y };
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'Internet': return <Globe className="w-4 h-4 text-blue-400" />;
      case 'Load Balancer': return <Layers className="w-4 h-4 text-purple-400" />;
      case 'Database': return <Database className="w-4 h-4 text-amber-400" />;
      case 'Redis Cache': return <HardDrive className="w-4 h-4 text-rose-400" />;
      case 'Worker': return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'Monitoring': return <Activity className="w-4 h-4 text-emerald-400" />;
      default: return <Server className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'border-rose-500 shadow-rose-500/30 ring-1 ring-rose-500/50';
      case 'DEGRADED': return 'border-amber-500 shadow-amber-500/30 ring-1 ring-amber-500/50';
      case 'OFFLINE': return 'border-slate-600 shadow-slate-600/30';
      default: return 'border-emerald-500/60 shadow-emerald-500/20';
    }
  };

  const NODE_WIDTH = 160; // 80px radius from center
  const HALF_WIDTH = NODE_WIDTH / 2;

  return (
    <div className="bg-[#121722] border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
      {/* Topology Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Infrastructure Topology Map & Connected Graph
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Interactive end-to-end service dependency traffic flow</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Degraded</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Critical</span>
        </div>
      </div>

      {/* Canvas Viewport Container */}
      <div className="relative w-full h-[580px] bg-[#0B0E14] border border-slate-900 rounded-lg overflow-x-auto overflow-y-hidden flex items-center justify-center p-2">
        {/* SVG Connections Overlay */}
        <svg className="absolute inset-0 w-[1080px] h-[560px] pointer-events-none left-1/2 -translate-x-1/2">
          {links.map((link, idx) => {
            const srcNode = nodes.find(n => n.id === link.source);
            const tgtNode = nodes.find(n => n.id === link.target);
            if (!srcNode || !tgtNode) return null;

            const src = getCoordinates(srcNode);
            const tgt = getCoordinates(tgtNode);

            // Calculate precise node boundary anchors
            const x1 = src.x + HALF_WIDTH;
            const y1 = src.y;
            const x2 = tgt.x - HALF_WIDTH;
            const y2 = tgt.y;

            // Smooth cubic bezier control points
            const deltaX = Math.abs(x2 - x1) * 0.5;
            const pathD = `M ${x1} ${y1} C ${x1 + deltaX} ${y1}, ${x2 - deltaX} ${y2}, ${x2} ${y2}`;

            const isWarning = srcNode.status === 'DEGRADED' || tgtNode.status === 'DEGRADED';
            const isCritical = srcNode.status === 'CRITICAL' || tgtNode.status === 'CRITICAL';
            const lineColor = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#3B82F6';

            return (
              <g key={`${link.source}-${link.target}-${idx}`}>
                {/* Connection Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="2"
                  strokeOpacity="0.55"
                  strokeDasharray="4,4"
                />

                {/* Connection Anchor Dots */}
                <circle cx={x1} cy={y1} r="3" fill={lineColor} />
                <circle cx={x2} cy={y2} r="3" fill={lineColor} />

                {/* Animated Traffic Particle */}
                <circle r="3.5" fill={lineColor}>
                  <animateMotion
                    path={pathD}
                    dur={`${1.8 + (idx % 4) * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Nodes layer rendering */}
        <div className="relative w-[1080px] h-[560px] shrink-0">
          {nodes.map(node => {
            const { x, y } = getCoordinates(node);
            const isSelected = selectedId === node.id;

            return (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedId(node.id);
                  if (onSelectNode) onSelectNode(node);
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ left: `${x - HALF_WIDTH}px`, top: `${y - 32}px` }}
                className={`absolute w-40 bg-[#161C2A] border-2 ${getStatusBorder(node.status)} ${
                  isSelected ? 'ring-2 ring-blue-500 scale-105' : ''
                } rounded-xl p-2.5 cursor-pointer shadow-xl hover:scale-105 transition-all duration-200 z-10`}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {getNodeIcon(node.serviceType)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold text-white truncate">{node.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{node.serviceType}</div>
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-300">
                  <span>{node.latency}ms</span>
                  <span className={node.cpu > 75 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{node.cpu}% CPU</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Detail Info Footer */}
      {hoveredNode && (
        <div className="mt-3 bg-[#161C2A] border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs font-mono animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-white">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="font-semibold">{hoveredNode.name}</span>
            <span className="text-slate-400">({hoveredNode.host || 'Cluster Domain'})</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>Latency: <strong className="text-white">{hoveredNode.latency}ms</strong></span>
            <span>CPU: <strong className="text-white">{hoveredNode.cpu}%</strong></span>
            <span>Memory: <strong className="text-white">{hoveredNode.memory || 45}%</strong></span>
            <span>Status: <strong className={hoveredNode.status === 'HEALTHY' ? 'text-emerald-400' : 'text-rose-400'}>{hoveredNode.status}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
