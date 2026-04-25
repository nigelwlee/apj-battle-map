import type { Edge, Person, WarmPath } from "./types";

const CRM_STATUS_WEIGHT: Record<string, number> = {
  champion: 1.0,
  meeting_held: 0.8,
  contacted: 0.5,
  cold: 0.2,
  detractor: 0.05,
};

const EDGE_TYPE_WEIGHT: Record<string, number> = {
  co_worked: 1.0,
  board: 0.9,
  alumni: 0.7,
  co_author: 0.6,
  co_panelist: 0.5,
};

/**
 * Find top warm-intro paths from any champion/engaged person to a target.
 * Returns up to maxPaths paths sorted by score descending.
 * Max hops: 3.
 */
export function findWarmPaths(
  targetId: string,
  people: Person[],
  edges: Edge[],
  maxPaths = 3,
  maxHops = 3
): WarmPath[] {
  const personMap = new Map(people.map((p) => [p.id, p]));

  // Build adjacency: personId → [{neighborId, edge}]
  const adj = new Map<string, { neighborId: string; edge: Edge }[]>();
  for (const e of edges) {
    if (!adj.has(e.sourceId)) adj.set(e.sourceId, []);
    if (!adj.has(e.targetId)) adj.set(e.targetId, []);
    adj.get(e.sourceId)!.push({ neighborId: e.targetId, edge: e });
    adj.get(e.targetId)!.push({ neighborId: e.sourceId, edge: e });
  }

  // BFS from all champion/meeting_held people toward target
  const seeds = people.filter((p) =>
    (p.crmStatus === "champion" || p.crmStatus === "meeting_held") &&
    p.id !== targetId
  );

  const results: WarmPath[] = [];

  for (const seed of seeds) {
    // BFS queue: [currentId, pathSoFar, scoreSoFar]
    type QueueItem = { id: string; path: string[]; score: number };
    const queue: QueueItem[] = [{ id: seed.id, path: [seed.id], score: 1.0 }];
    const visited = new Set<string>([seed.id]);

    while (queue.length > 0) {
      const { id, path, score } = queue.shift()!;
      if (path.length > maxHops + 1) continue;

      const neighbors = adj.get(id) ?? [];
      for (const { neighborId, edge } of neighbors) {
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);

        const neighbor = personMap.get(neighborId);
        if (!neighbor) continue;

        const edgeScore =
          (EDGE_TYPE_WEIGHT[edge.type] ?? 0.5) *
          edge.strength / 3 *
          (CRM_STATUS_WEIGHT[neighbor.crmStatus] ?? 0.2);

        const newScore = score * edgeScore;
        const newPath = [...path, neighborId];

        if (neighborId === targetId) {
          results.push({ path: newPath, score: newScore, hops: newPath.length - 1 });
          break;
        }

        if (newPath.length <= maxHops) {
          queue.push({ id: neighborId, path: newPath, score: newScore });
        }
      }
    }
  }

  // Deduplicate by path, sort by score desc, return top N
  const seen = new Set<string>();
  return results
    .filter((r) => {
      const key = r.path.join("→");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPaths);
}
