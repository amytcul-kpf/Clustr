"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { GraphData, GraphNode, getCategoryColor } from "@/lib/types";
import dynamic from "next/dynamic";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

interface GraphViewProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  selectedNodeId: string | null;
}

export default function GraphView({
  data,
  onNodeClick,
  selectedNodeId,
}: GraphViewProps) {
  const fgRef = useRef<ReturnType<typeof import("react-force-graph-3d").default> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      onNodeClick(node as GraphNode);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fg = fgRef.current as any;
      if (fg) {
        const distance = 120;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        fg.cameraPosition(
          {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio,
          },
          node,
          1000
        );
      }
    },
    [onNodeClick]
  );

  const graphData = {
    nodes: data.nodes.map((n) => ({
      ...n,
      color: getCategoryColor(n.category),
      val: 2 + n.importance * 10,
    })),
    links: data.links.map((l) => ({
      ...l,
      color: `rgba(180, 190, 254, ${0.15 + l.strength * 0.4})`,
    })),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkWidthAccessor = (link: any) => 0.5 + (link.strength || 0.5) * 2;

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <ForceGraph3D
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={fgRef as any}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#1e1e2e"
        nodeLabel="label"
        nodeVal="val"
        nodeColor="color"
        nodeOpacity={0.9}
        nodeResolution={16}
        linkWidth={linkWidthAccessor}
        linkOpacity={0.6}
        linkColor="color"
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={handleNodeClick}
        nodeThreeObjectExtend={true}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeThreeObject={(node: any) => {
          // Add text labels to nodes
          const THREE = require("three");
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: createTextTexture(node.label, node.color || "#b4befe"),
              transparent: true,
              depthWrite: false,
            })
          );
          const size = 4 + (node.importance || 0.5) * 6;
          sprite.scale.set(size * 4, size, 1);
          sprite.position.set(0, -(2 + (node.val || 4) * 0.6), 0);

          // Highlight selected node
          if (selectedNodeId === node.id) {
            const ring = new THREE.Mesh(
              new THREE.RingGeometry(
                (node.val || 4) * 0.5 + 1,
                (node.val || 4) * 0.5 + 2,
                32
              ),
              new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide,
              })
            );
            const group = new THREE.Group();
            group.add(sprite);
            group.add(ring);
            return group;
          }

          return sprite;
        }}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm border border-border rounded-lg p-3 z-10">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          Categories
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[...new Set(data.nodes.map((n) => n.category))].map((cat) => (
            <div key={cat} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getCategoryColor(cat) }}
              />
              <span className="text-xs text-text-dim">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createTextTexture(text: string, color: string): any {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const fontSize = 48;
  canvas.width = 512;
  canvas.height = 128;

  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 20);

  const THREE = require("three");
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
