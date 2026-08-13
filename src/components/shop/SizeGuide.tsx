import { Ruler } from "lucide-react";
import { sizeGuideRows } from "@/data/catalog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocalized, useT } from "@/lib/locale";

export function SizeGuide() {
  const t = useT();
  const L = useLocalized();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand underline-offset-4 transition-colors hover:text-brand-hover hover:underline"
        >
          <Ruler className="size-4" aria-hidden="true" />
          {t("product.sizeGuide")}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
        <DialogHeader className="text-start">
          <DialogTitle>{t("sizeGuide.title")}</DialogTitle>
          <DialogDescription>{t("sizeGuide.intro")}</DialogDescription>
        </DialogHeader>
        <div className="-mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[34rem] border-collapse text-start text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs text-muted-foreground">
                <th scope="col" className="py-2.5 pe-3 text-start font-medium">
                  {t("sizeGuide.name")}
                </th>
                <th scope="col" className="py-2.5 pe-3 text-start font-medium">
                  {t("sizeGuide.length")}
                </th>
                <th scope="col" className="py-2.5 pe-3 text-start font-medium">
                  {t("sizeGuide.width")}
                </th>
                <th scope="col" className="py-2.5 pe-3 text-start font-medium">
                  {t("sizeGuide.height")}
                </th>
                <th scope="col" className="py-2.5 text-start font-medium">
                  {t("sizeGuide.usage")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sizeGuideRows.map((row) => (
                <tr key={row.name.en} className="border-b border-border/70 last:border-0">
                  <td className="py-3 pe-3 font-medium text-foreground">{L(row.name)}</td>
                  <td className="py-3 pe-3 tabular-nums text-muted-foreground">{row.length}</td>
                  <td className="py-3 pe-3 tabular-nums text-muted-foreground">{row.width}</td>
                  <td className="py-3 pe-3 tabular-nums text-muted-foreground">{row.height}</td>
                  <td className="py-3 text-muted-foreground">{L(row.usage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
