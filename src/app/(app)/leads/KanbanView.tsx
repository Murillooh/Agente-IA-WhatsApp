"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { ModeBadge } from "@/components/Badges";
import type { Lead, LeadStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const COLUMNS: LeadStatus[] = [
  "NOVO",
  "CONTATADO",
  "RESPONDENDO",
  "REUNIAO_AGENDADA",
  "FECHADO",
  "PERDIDO",
];

const COLUMN_ACCENT: Record<LeadStatus, string> = {
  NOVO: "border-t-slate-400",
  CONTATADO: "border-t-blue-500",
  RESPONDENDO: "border-t-amber-500",
  REUNIAO_AGENDADA: "border-t-violet-500",
  FECHADO: "border-t-emerald-500",
  PERDIDO: "border-t-rose-500",
};

function groupByStatus(leads: Lead[]): Record<LeadStatus, Lead[]> {
  const groups = Object.fromEntries(COLUMNS.map((s) => [s, [] as Lead[]])) as Record<
    LeadStatus,
    Lead[]
  >;
  for (const lead of leads) groups[lead.status].push(lead);
  return groups;
}

// Arrastar um card entre colunas chama o mesmo PATCH /api/leads/[id] que a
// tela de detalhe usa pra mudar status — sem endpoint novo.
export function KanbanView({ leads, onChanged }: { leads: Lead[]; onChanged: () => void }) {
  const [groups, setGroups] = useState(() => groupByStatus(leads));
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  // Ressincroniza com o prop sem useEffect (padrão do React pra "ajustar
  // estado quando uma prop muda") — leads só troca de identidade quando o
  // filtro muda ou o router.refresh() traz dado novo do servidor.
  const [syncedLeads, setSyncedLeads] = useState(leads);
  if (leads !== syncedLeads) {
    setSyncedLeads(leads);
    setGroups(groupByStatus(leads));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const lead = leads.find((l) => l.id === event.active.id);
    setActiveLead(lead ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    // Otimista: move o card na hora, sem esperar a resposta do servidor.
    setGroups((prev) => {
      const next = { ...prev };
      next[lead.status] = next[lead.status].filter((l) => l.id !== leadId);
      next[newStatus] = [...next[newStatus], { ...lead, status: newStatus }];
      return next;
    });

    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    onChanged();
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((status) => (
          <Column key={status} status={status} leads={groups[status]} />
        ))}
      </div>
      <DragOverlay>
        {activeLead && <LeadCard lead={activeLead} dragging />}
      </DragOverlay>
    </DndContext>
  );
}

function Column({ status, leads }: { status: LeadStatus; leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-xl border-t-2 bg-slate-50/60 p-3 transition-colors dark:bg-slate-900/40 ${COLUMN_ACCENT[status]} ${
        isOver ? "bg-indigo-50/80 dark:bg-indigo-500/10" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {STATUS_LABELS[status]}
        </h3>
        <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-400 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700">
          {leads.length}
        </span>
      </div>
      <div className="flex min-h-[4rem] flex-1 flex-col gap-2">
        {leads.map((lead) => (
          <DraggableLeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

function DraggableLeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={isDragging ? "opacity-30" : ""}
    >
      <LeadCard lead={lead} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function LeadCard({
  lead,
  dragHandleProps,
  dragging,
}: {
  lead: Lead;
  dragHandleProps?: Record<string, unknown>;
  dragging?: boolean;
}) {
  return (
    <div
      className={`card flex items-start gap-2 p-3 ${dragging ? "rotate-2 shadow-lg" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <Link
          href={`/leads/${lead.id}`}
          className="block truncate text-sm font-medium text-slate-900 hover:text-indigo-600 hover:underline dark:text-white dark:hover:text-indigo-400"
        >
          {lead.name}
        </Link>
        <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
          {lead.whatsapp || lead.phone || lead.instagram || "sem contato"}
        </p>
        <div className="mt-2">
          <ModeBadge mode={lead.mode} />
        </div>
      </div>
      {dragHandleProps && (
        <button
          {...dragHandleProps}
          className="shrink-0 cursor-grab touch-none rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing dark:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label={`Arrastar ${lead.name}`}
        >
          <GripVertical size={14} />
        </button>
      )}
    </div>
  );
}
