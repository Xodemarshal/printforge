import type { Metadata } from "next";
import { uploadSTLAction, estimatePriceAction, createCustomPrintRequestAction } from "@/actions/stl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DESIGN_IMAGES } from "@/lib/design";

export const metadata: Metadata = {
  title: "Upload Design | Wooden Guardian",
  description: "Upload STL, OBJ, or 3MF files for custom printing."
};

export default function UploadStlPage() {
  return (
    <div className="page-shell py-8 lg:py-10">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">STL upload experience</p>
        <h1 className="display-font mt-2 text-4xl text-[#243223] md:text-5xl">Upload your design</h1>
      </div>

      <div className="panel-soft rounded-[34px] p-4 lg:p-6">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="wood-texture flex flex-col rounded-[28px] border border-[#8c6f42]/20 p-6 text-[#f4ecd9]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#c5a059]/80">Step 1</p>
            <h2 className="display-font mt-2 text-2xl">Drag & drop zone</h2>
            <p className="mt-2 text-sm text-[#d9cfbf]">Upload your STL, OBJ, or 3MF file</p>
            <form 
              action={async (formData) => {
                "use server";
                await uploadSTLAction(formData);
              }} 
              encType="multipart/form-data" 
              className="mt-6 flex flex-1 flex-col space-y-4"
            >
              <div className="flex flex-1 flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#c5a059]/30 bg-black/20 p-8 text-center">
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#c5a059]/20 text-[#c5a059]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                </div>
                <p className="font-semibold">Drag and drop your file</p>
                <p className="mt-1 text-sm text-[#c9bea8]">or click to browse</p>
                <Input name="file" type="file" accept=".stl,.obj,.3mf" className="mt-4 border-[#c5a059]/20 bg-black/20 text-[#f4ecd9]" />
              </div>
              <div className="grid gap-3">
                <Select name="material" className="border-[#c5a059]/20 bg-black/20 text-[#f4ecd9]">
                  <option value="PLA">PLA</option>
                  <option value="PETG">PETG</option>
                  <option value="Resin">Resin</option>
                </Select>
                <Input name="color" placeholder="Color" className="border-[#c5a059]/20 bg-black/20 text-[#f4ecd9] placeholder:text-[#a89880]" />
                <Input name="layerHeight" type="number" step="0.01" defaultValue="0.2" className="border-[#c5a059]/20 bg-black/20 text-[#f4ecd9]" />
                <Input name="infill" type="number" defaultValue="20" className="border-[#c5a059]/20 bg-black/20 text-[#f4ecd9]" />
                <Input name="quantity" type="number" defaultValue="1" className="border-[#c5a059]/20 bg-black/20 text-[#f4ecd9]" />
              </div>
              <Textarea name="notes" placeholder="Notes" className="border-[#c5a059]/20 bg-black/20 text-[#f4ecd9] placeholder:text-[#a89880]" />
              <Button type="submit" className="w-full">
                Upload file
              </Button>
            </form>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-[#f6eddc] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Step 2</p>
            <h2 className="display-font mt-2 text-2xl text-[#243223]">3D mesh health check</h2>
            <div className="mt-4 overflow-hidden rounded-[24px] border border-black/10 bg-white/75 p-3">
              <img src={DESIGN_IMAGES.uploadModel} alt="3D model preview" className="h-72 w-full rounded-[18px] object-cover lg:h-96" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm">
                <p className="font-medium text-green-800">Manifold mesh</p>
                <p className="text-xs text-green-600">Ready for printing</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                <p className="font-medium text-amber-800">Potential errors</p>
                <p className="text-xs text-amber-600">Review recommended</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-[#fffaf1] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Step 3</p>
            <h2 className="display-font mt-2 text-2xl text-[#243223]">Material & quote</h2>
            <div className="mt-4 space-y-3">
              {[
                ["Bronze", "Matte Black Resin", true],
                ["Oak wood-fill PLA", "Natural finish", false],
                ["Transparent Bio-Resin", "Clear", false]
              ].map(([label, sub, active]) => (
                <label
                  key={label as string}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                    active ? "border-primary bg-primary/5" : "border-black/10 bg-white/70"
                  }`}
                >
                  <input type="radio" name="material-preview" defaultChecked={active as boolean} className="accent-primary" />
                  <div>
                    <p className="font-medium text-[#243223]">{label as string}</p>
                    <p className="text-xs text-foreground/55">{sub as string}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-5 space-y-2 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm">
              <div className="flex justify-between text-foreground/60">
                <span>Material cost</span>
                <span>$12.00</span>
              </div>
              <div className="flex justify-between text-foreground/60">
                <span>Print time</span>
                <span>$6.00</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 font-semibold text-[#243223]">
                <span>Total estimate</span>
                <span>$18.00</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4">
              <form 
                action={async (formData) => {
                  "use server";
                  await estimatePriceAction(formData);
                }} 
                className="space-y-3"
              >
                <p className="text-sm font-medium text-[#243223]">Instant quote</p>
                <Input name="material" placeholder="Material" />
                <Input name="color" placeholder="Color" />
                <Input name="layerHeight" type="number" step="0.01" defaultValue="0.2" />
                <Input name="infill" type="number" defaultValue="20" />
                <Input name="quantity" type="number" defaultValue="1" />
                <Button type="submit" variant="outline" className="w-full">
                  Calculate quote
                </Button>
              </form>
            </div>

            <form 
              action={async (formData) => {
                "use server";
                await createCustomPrintRequestAction(formData);
              }} 
              className="mt-4 space-y-3"
            >
              <Input name="stlUploadId" placeholder="Upload ID" />
              <Input name="material" placeholder="Material" />
              <Input name="color" placeholder="Color" />
              <Input name="layerHeight" type="number" step="0.01" defaultValue="0.2" />
              <Input name="infill" type="number" defaultValue="20" />
              <Input name="quantity" type="number" defaultValue="1" />
              <Input name="estimatedHours" type="number" defaultValue="0" />
              <Textarea name="notes" placeholder="Notes" />
              <Button type="submit" variant="gold" className="w-full">
                Instant Quote
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
