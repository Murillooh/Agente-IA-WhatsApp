import { Users, PhoneCall, LayoutDashboard } from "lucide-react";

// Painel direito compartilhado entre /login e /signup — branding +
// destaques do sistema.
export function AuthInfoPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 lg:flex lg:flex-col lg:justify-center lg:px-14 lg:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_65%,white,transparent_30%)]"
      />
      <div className="relative">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Fechar reuniões, no automático
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-indigo-100">
          Prospecção por WhatsApp, Instagram e ligação com IA de voz — tudo
          registrado numa timeline até a reunião ser agendada.
        </p>

        <ul className="mt-10 space-y-6">
          <Feature
            icon={Users}
            title="Leads em um só lugar"
            desc="Cadastro manual ou importação em massa via CSV, com busca e filtros."
          />
          <Feature
            icon={PhoneCall}
            title="Disparo em lote"
            desc="Modo 2 liga pra vários leads ao mesmo tempo, com IA de voz."
          />
          <Feature
            icon={LayoutDashboard}
            title="Funil visual"
            desc="Dashboard com funil de status e próximas reuniões, tudo em tempo real."
          />
        </ul>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Users;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex gap-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
        <Icon size={17} />
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-indigo-100/80">{desc}</p>
      </div>
    </li>
  );
}
