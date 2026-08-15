import { Headset, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { useT } from "@/lib/locale";

/** Four-up trust/reassurance strip shown under the hero. */
export function TrustBar() {
  const t = useT();
  const items = [
    {
      icon: Truck,
      label: t("product.trustFastShipping"),
      short: t("product.trustFastShippingShort"),
    },
    { icon: ShieldCheck, label: t("announce.warranty"), short: t("announce.warrantyShort") },
    { icon: Headset, label: t("benefit.support"), short: t("benefit.supportShort") },
    { icon: RotateCcw, label: t("benefit.returns"), short: t("benefit.returnsShort") },
  ];
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-[1280px] px-5 md:px-[64px]">
        <Reveal>
          <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
            {items.map(({ icon: Icon, label, short }, i) => (
              <div
                key={i}
                className="group flex items-center justify-center gap-2.5 bg-surface px-2 py-4 md:gap-3 md:py-6"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition-transform duration-300 ease-out group-hover:scale-110 md:size-11">
                  <Icon className="size-4 md:size-5" strokeWidth={1.75} />
                </span>
                <span className="text-center text-xs font-bold leading-tight text-foreground transition-colors duration-300 group-hover:text-brand md:text-sm">
                  <span className="md:hidden">{short}</span>
                  <span className="hidden md:inline">{label}</span>
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
