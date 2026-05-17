"use client";

const modules = [
  "KillAura", "Velocity", "AutoCrystal", "TriggerBot", "Speed", "Flight", "NoFall", "Step",
  "ESP", "Tracers", "Nametags", "FreeCam", "Scaffold", "AutoTool", "ChestStealer",
  "InvManager", "ReallyWorld", "Sloth", "FunTimeV2", "AntiBot", "AutoTotem", "Criticals",
  "Hitbox", "Reach", "Timer", "Blink", "Phase", "Jesus", "Spider", "XRay", "Fullbright",
];

export function ModuleMarquee() {
  const items = [...modules, ...modules];
  return (
    <section className="py-12 overflow-hidden border-y border-white/5">
      <div className="marquee-track gap-4">
        {items.map((m, i) => (
          <span
            key={`${m}-${i}`}
            className="shrink-0 rounded-full px-5 py-2 text-sm font-medium border border-white/15 bg-white/5 backdrop-blur-xl"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }}
          >
            {m}
          </span>
        ))}
      </div>
    </section>
  );
}
