import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const childrenSizeGuideRows = [
  { size: "حديثي ولادة", age: "0 - 1 شهر", height: "50 - 56 سم", chest: "38 - 40 سم" },
  { size: "0-3 شهور", age: "0 - 3 شهور", height: "56 - 62 سم", chest: "40 - 43 سم" },
  { size: "3-6 شهور", age: "3 - 6 شهور", height: "62 - 68 سم", chest: "43 - 45 سم" },
  { size: "6-9 شهور", age: "6 - 9 شهور", height: "68 - 74 سم", chest: "45 - 47 سم" },
  { size: "9-12 شهر", age: "9 - 12 شهر", height: "74 - 80 سم", chest: "47 - 49 سم" },
  { size: "1-2 سنة", age: "1 - 2 سنة", height: "80 - 92 سم", chest: "49 - 52 سم" },
  { size: "3-4 سنوات", age: "3 - 4 سنوات", height: "98 - 104 سم", chest: "54 - 56 سم" },
  { size: "5-6 سنوات", age: "5 - 6 سنوات", height: "110 - 116 سم", chest: "58 - 60 سم" },
  { size: "7-8 سنوات", age: "7 - 8 سنوات", height: "122 - 128 سم", chest: "62 - 64 سم" },
  { size: "9-10 سنوات", age: "9 - 10 سنوات", height: "134 - 140 سم", chest: "66 - 70 سم" },
  { size: "11-12 سنة", age: "11 - 12 سنة", height: "146 - 152 سم", chest: "72 - 76 سم" },
  { size: "13-14 سنة", age: "13 - 14 سنة", height: "158 - 164 سم", chest: "78 - 82 سم" },
];

export function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 underline-offset-4 transition-colors hover:underline"
        >
          <Ruler className="size-4" aria-hidden="true" />
          دليل مقاسات ملابس الأطفال
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
        <DialogHeader className="text-start">
          <DialogTitle className="text-sky-700 dark:text-sky-400">دليل مقاسات ملابس الأطفال</DialogTitle>
          <DialogDescription>
            المقاسات الموضحة لمساعدتك في اختيار أفضل مقاس مناسب لطفلك بالسنتيمتر.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[28rem] border-collapse text-start text-sm">
            <thead>
              <tr className="border-b border-sky-100 bg-sky-50/50 dark:border-slate-800 dark:bg-slate-800/50 text-start text-xs font-bold text-sky-900 dark:text-sky-300">
                <th scope="col" className="py-2.5 px-3 text-start">المقاس</th>
                <th scope="col" className="py-2.5 px-3 text-start">السن / العمر</th>
                <th scope="col" className="py-2.5 px-3 text-start">الطول (سم)</th>
                <th scope="col" className="py-2.5 px-3 text-start">محيط الصدر (سم)</th>
              </tr>
            </thead>
            <tbody>
              {childrenSizeGuideRows.map((row) => (
                <tr key={row.size} className="border-b border-border/60 hover:bg-sky-50/30 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-foreground">{row.size}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{row.age}</td>
                  <td className="py-2.5 px-3 tabular-nums text-muted-foreground">{row.height}</td>
                  <td className="py-2.5 px-3 tabular-nums text-muted-foreground">{row.chest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
