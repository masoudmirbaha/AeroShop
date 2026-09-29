import { LifeBuoy, MessagesSquare, Presentation, Workflow, Wrench } from "lucide-react";

const icons = {
  "free-consultation": MessagesSquare,
  "project-order": Workflow,
  "private-training": Presentation,
  "technical-support": LifeBuoy,
};

export function serviceIcon(slug: string) {
  return icons[slug as keyof typeof icons] ?? Wrench;
}
