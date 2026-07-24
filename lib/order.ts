export const CURRICULUM_ORDER: Record<string, number> = {
  "getting-started": 1,
  "web-basics": 2,
  "git-and-github": 3,
  "command": 4,
  "javascript": 5,
  "typescript": 6,
  "browser-tools": 7,
  "react": 8,
  "state-management": 9,
  "nextjs": 10,
  "nextjs-auth": 11,
  "frontend-design": 12,
  "ui-patterns": 13,
  "color": 14,
  "tailwind": 15,
  "shadcn": 16,
  "frontend-testing": 17,
  "Prisma": 18,
  "Backend-from-first-principle": 19,
  "libraries": 20,
  "project-ideas": 21,
  "reading-list": 22,
  "plan": 23,
  "plan-archive": 24,
  "README": 25,
};

export function getOrder(slug: string): number {
  const baseName = slug.split('/').pop() || slug;
  if (CURRICULUM_ORDER[baseName]) return CURRICULUM_ORDER[baseName];
  
  const match = baseName.match(/^(\d+)-/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return 999;
}
