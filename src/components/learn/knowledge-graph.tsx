"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Network, Sparkles, Plus, X, Loader2, Lightbulb, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGrowth } from "@/store/growth";
import { useTwin } from "@/store/twin";
import { useToast } from "@/hooks/use-toast";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  brightness: number;
  constellation: string;
}

interface GraphEdge {
  from: string;
  to: string;
}

// Deterministic position in a circle, grouped by constellation.
function layoutNodes(
  stars: { id: string; concept: string; brightness: number; constellation: string }[]
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (stars.length === 0) return { nodes: [], edges: [] };

  // Group by constellation
  const groups: Record<string, typeof stars> = {};
  for (const s of stars) {
    const k = s.constellation || "Ideas";
    if (!groups[k]) groups[k] = [];
    groups[k].push(s);
  }

  const groupKeys = Object.keys(groups);
  const groupCount = groupKeys.length;
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Place each group at an angle around the center
  groupKeys.forEach((gk, gi) => {
    const groupAngle = (gi / Math.max(1, groupCount)) * Math.PI * 2;
    const groupRadius = 32; // % from center
    const gx = 50 + Math.cos(groupAngle) * groupRadius;
    const gy = 50 + Math.sin(groupAngle) * groupRadius;
    const members = groups[gk];
    members.forEach((m, mi) => {
      const localAngle = (mi / Math.max(1, members.length)) * Math.PI * 2;
      const localR = members.length > 1 ? 10 : 0;
      nodes.push({
        id: m.id,
        label: m.concept,
        x: gx + Math.cos(localAngle) * localR,
        y: gy + Math.sin(localAngle) * localR,
        brightness: m.brightness,
        constellation: gk,
      });
      // connect within group
      if (mi > 0) {
        const prev = members[mi - 1];
        edges.push({ from: prev.id, to: m.id });
      }
    });
  });

  // Connect groups: link first node of each adjacent group
  if (groupCount > 1) {
    groupKeys.forEach((gk, gi) => {
      const next = groupKeys[(gi + 1) % groupCount];
      const a = groups[gk][0];
      const b = groups[next][0];
      if (a && b) edges.push({ from: a.id, to: b.id });
    });
  }

  return { nodes, edges };
}

const CONSTELLATION_COLORS: Record<string, string> = {
  Learn: "oklch(0.74 0.12 155)",
  Revision: "oklch(0.82 0.13 80)",
  Wellness: "oklch(0.78 0.08 15)",
  Ideas: "oklch(0.7 0.13 330)",
};

export function KnowledgeGraph() {
  const stars = useGrowth((s) => s.stars);
  const addStar = useGrowth((s) => s.addStar);
  const twin = useTwin();
  const { toast } = useToast();
  const reduced = useReducedMotion();

  const [adding, setAdding] = useState(false);
  const [newConcept, setNewConcept] = useState("");
  const [newGroup, setNewGroup] = useState("Ideas");
  const [selected, setSelected] = useState<string | null>(null);
  const [connections, setConnections] = useState<
    { from: string; to: string; bridge: string }[]
  >([]);
  const [insight, setInsight] = useState<string>("");
  const [findingConnections, setFindingConnections] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  const { nodes, edges } = useMemo(() => layoutNodes(stars), [stars]);
  const nodeMap = useMemo(() => {
    const m: Record<string, GraphNode> = {};
    for (const n of nodes) m[n.id] = n;
    return m;
  }, [nodes]);

  const handleAdd = () => {
    if (!newConcept.trim()) return;
    addStar({
      concept: newConcept.trim(),
      constellation: newGroup,
      brightness: 45,
    });
    twin.bumpTrait("curiosity", 3, `Added "${newConcept.trim()}" to your knowledge graph.`);
    toast({
      title: "Concept added",
      description: `"${newConcept.trim()}" is now part of your knowledge web.`,
    });
    setNewConcept("");
    setAdding(false);
  };

  const selectedNode = selected ? nodeMap[selected] : null;

  const findConnections = useCallback(async () => {
    if (stars.length < 2 || findingConnections) return;
    setFindingConnections(true);
    setShowConnections(true);
    try {
      const res = await fetch("/api/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concepts: stars.map((s) => s.concept),
        }),
      });
      const data = await res.json();
      setConnections(data.connections || []);
      setInsight(data.insight || "");
      if ((data.connections || []).length > 0) {
        twin.bumpTrait("curiosity", 3, "Explored how your concepts connect.");
        twin.addMemory({
          text: "You discovered connections between your concepts.",
          kind: "insight",
        });
      }
    } catch {
      setConnections([]);
      setInsight("I couldn't map those right now — try again?");
    } finally {
      setFindingConnections(false);
    }
  }, [stars, findingConnections, twin]);

  return (
    <Card className="relative overflow-hidden border-border/60 nt-shadow-soft">
      <div className="p-4 sm:p-5 border-b border-border/50 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Network className="size-4 text-primary shrink-0" aria-hidden />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">Knowledge Graph</h3>
            <p className="text-xs text-muted-foreground">
              How your ideas connect
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stars.length > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {nodes.length} concepts · {Object.keys(CONSTELLATION_COLORS).filter(k => stars.some(s => s.constellation === k)).length} groups
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-full"
            onClick={() => setAdding((a) => !a)}
          >
            {adding ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
            {adding ? "Cancel" : "Add concept"}
          </Button>
          {stars.length >= 2 && (
            <Button
              size="sm"
              className="gap-1.5 rounded-full"
              onClick={findConnections}
              disabled={findingConnections}
            >
              {findingConnections ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Zap className="size-3.5" />
              )}
              {findingConnections ? "Mapping…" : "Find connections"}
            </Button>
          )}
        </div>
      </div>

      {adding && (
        <MotionDiv
          initial={reduced ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-4 sm:px-5 py-3 border-b border-border/50 bg-muted/30"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={newConcept}
              onChange={(e) => setNewConcept(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="A concept or idea..."
              className="flex-1"
              autoFocus
              aria-label="New concept"
            />
            <div className="flex gap-1.5">
              {["Learn", "Revision", "Ideas"].map((g) => (
                <button
                  key={g}
                  onClick={() => setNewGroup(g)}
                  aria-pressed={newGroup === g}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-all whitespace-nowrap",
                    newGroup === g
                      ? "border-primary bg-primary/15 text-primary font-medium"
                      : "hover:bg-accent"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
            <Button
              onClick={handleAdd}
              disabled={!newConcept.trim()}
              size="sm"
              className="rounded-full"
            >
              Add
            </Button>
          </div>
        </MotionDiv>
      )}

      <div className="relative h-[340px] sm:h-[380px] bg-gradient-to-br from-background to-muted/30">
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center px-6"
            >
              <div className="relative mx-auto mb-3 size-14 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg nt-breathe" />
                <div className="relative size-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Network className="size-6 text-primary" />
                </div>
              </div>
              <p className="text-sm font-medium text-foreground/90">
                Your knowledge web is waiting
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Learn and revise concepts, and watch them connect into a living
                map of what you know.
              </p>
            </MotionDiv>
          </div>
        ) : (
          <>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-label="Knowledge graph showing connected concepts"
            >
              {/* Edges */}
              {edges.map((e, i) => {
                const a = nodeMap[e.from];
                const b = nodeMap[e.to];
                if (!a || !b) return null;
                return (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="oklch(0.6 0.05 150 / 0.35)"
                    strokeWidth={0.3}
                    strokeDasharray="0.8 0.6"
                  />
                );
              })}
            </svg>
            {/* Nodes */}
            {nodes.map((n, i) => {
              const color =
                CONSTELLATION_COLORS[n.constellation] || CONSTELLATION_COLORS.Ideas;
              const size = 14 + (n.brightness / 100) * 20; // 14-34px
              const isSelected = selected === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setSelected(isSelected ? null : n.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none z-10"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  aria-label={`Concept: ${n.label}, brightness ${n.brightness}`}
                >
                  {/* Glow halo */}
                  <div
                    className="absolute inset-0 rounded-full -z-10"
                    style={{
                      width: `${size * 2.5}px`,
                      height: `${size * 2.5}px`,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
                    }}
                  />
                  <motion.div
                    initial={reduced ? false : { opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
                    className="relative flex items-center justify-center rounded-full transition-transform group-hover:scale-125 border-2 border-white/40"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      background: color,
                      boxShadow: `0 0 ${size}px ${color}, 0 2px 8px oklch(0.2 0.02 150 / 0.2)`,
                      outline: isSelected ? "3px solid oklch(0.3 0.02 150)" : "none",
                      outlineOffset: "3px",
                    }}
                  />
                  {/* Persistent label */}
                  <span
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 -bottom-6 text-[10px] font-medium whitespace-nowrap rounded-full px-2 py-0.5 transition-all",
                      isSelected
                        ? "bg-foreground text-background opacity-100"
                        : "bg-background/80 text-muted-foreground opacity-70 group-hover:opacity-100 backdrop-blur-sm"
                    )}
                  >
                    {n.label.length > 20
                      ? n.label.slice(0, 18) + "…"
                      : n.label}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Legend */}
      {nodes.length > 0 && (
        <div className="px-4 sm:px-5 py-2.5 border-t border-border/50 flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-muted/20">
          {Object.entries(CONSTELLATION_COLORS).map(([name, color]) => {
            const count = nodes.filter((n) => n.constellation === name).length;
            if (count === 0) return null;
            return (
              <div key={name} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                  aria-hidden
                />
                <span className="text-[11px] text-muted-foreground">
                  {name} ({count})
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* AI connections panel */}
      {showConnections && (
        <MotionDiv
          initial={reduced ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-4 sm:px-5 py-4 border-t border-primary/20 bg-primary/5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="size-4 text-primary" aria-hidden />
            <p className="text-sm font-semibold">How your ideas connect</p>
            <Badge variant="secondary" className="rounded-full text-[10px] ml-auto gap-1">
              <Sparkles className="size-3" /> Explainable AI
            </Badge>
          </div>

          {findingConnections ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="nt-shimmer h-12 rounded-lg" />
              ))}
            </div>
          ) : connections.length > 0 ? (
            <div className="space-y-2.5">
              {connections.map((c, i) => (
                <motion.div
                  key={i}
                  initial={reduced ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-border/50 bg-card/70 p-3"
                >
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge className="rounded-full bg-primary/15 text-primary hover:bg-primary/15 text-xs">
                      {c.from}
                    </Badge>
                    <span className="text-muted-foreground text-xs">↔</span>
                    <Badge className="rounded-full bg-amber-glow/15 text-amber-glow-foreground hover:bg-amber-glow/15 text-xs">
                      {c.to}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {c.bridge}
                  </p>
                </motion.div>
              ))}
              {insight && (
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 mt-3">
                  <p className="text-xs text-primary font-medium flex items-start gap-1.5">
                    <Sparkles className="size-3.5 shrink-0 mt-0.5" />
                    {insight}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {insight || "I couldn't find strong connections between these concepts yet. Keep learning — patterns will emerge."}
            </p>
          )}
        </MotionDiv>
      )}

      {/* Selected node detail */}
      {selectedNode && (
        <MotionDiv
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 sm:px-5 py-3 border-t border-border/50 bg-muted/30"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{selectedNode.label}</p>
              <p className="text-xs text-muted-foreground">
                Group: {selectedNode.constellation} · Mastery:{" "}
                {Math.round(selectedNode.brightness)}%
              </p>
            </div>
            <Badge
              className="rounded-full shrink-0"
              style={{
                background: `${CONSTELLATION_COLORS[selectedNode.constellation] || CONSTELLATION_COLORS.Ideas}20`,
                color: CONSTELLATION_COLORS[selectedNode.constellation] || CONSTELLATION_COLORS.Ideas,
              }}
            >
              {selectedNode.constellation}
            </Badge>
          </div>
        </MotionDiv>
      )}
    </Card>
  );
}
