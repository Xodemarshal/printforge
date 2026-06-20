"use client";

import type React from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, Loader2, Sparkles } from "lucide-react";
import { submitIdeaRequestAction } from "@/actions/stl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

type RequestState = {
  success?: boolean;
  error?: string;
  request?: {
    id: string;
    file_url?: string | null;
  } | null;
};

const INITIAL_STATE: RequestState = {
  success: false,
  error: "",
  request: null
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full">
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          Sending brief...
        </span>
      ) : (
        "Send my idea"
      )}
    </Button>
  );
}

export function IdeaRequestForm() {
  const [state, formAction] = useActionState(submitIdeaRequestAction, INITIAL_STATE);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const { success, error } = useToast();
  const lastToastKey = useRef<string>("");

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  useEffect(() => {
    if (state.success && state.request?.id) {
      const toastKey = `success:${state.request.id}`;
      if (lastToastKey.current !== toastKey) {
        success("Request sent", "We received your brief and inspiration images.");
        lastToastKey.current = toastKey;
      }
      return;
    }

    if (state.error) {
      const toastKey = `error:${state.error}`;
      if (lastToastKey.current !== toastKey) {
        error("Upload failed", state.error);
        lastToastKey.current = toastKey;
      }
    }
  }, [state.error, state.request?.id, state.success, success, error]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setPreviews(
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }))
    );
  }

  return (
    <form action={formAction} className="mt-6 flex flex-1 flex-col gap-4">
      <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#c5a059]/20 text-[#c5a059]">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#c5a059]/80">Private brief</p>
            <p className="text-sm text-[#d9cfbf]">Tell us the vibe, not just the object.</p>
          </div>
        </div>

        {state.error ? (
          <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Request received. Our team will review your brief and reply with the next steps.
            {state.request?.id ? ` Reference: ${state.request.id.slice(0, 8)}` : null}
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          <label className="block text-xs uppercase tracking-[0.24em] text-[#c9bea8]">Instagram handle</label>
          <Input
            name="instagramHandle"
            placeholder="@yourhandle"
            className="border-[#c5a059]/20 bg-black/20 text-[#f4ecd9] placeholder:text-[#a89880]"
          />
          <p className="text-xs text-[#c9bea8]">
            We use this to understand your profile style and aesthetic.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-xs uppercase tracking-[0.24em] text-[#c9bea8]">Your idea</label>
          <Textarea
            name="idea"
            placeholder="Example: make me a compact desk item inspired by my love for minimal gadgets, nature tones, and soft organic shapes."
            rows={6}
            className="border-[#c5a059]/20 bg-black/20 text-[#f4ecd9] placeholder:text-[#a89880]"
          />
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-xs uppercase tracking-[0.24em] text-[#c9bea8]">Reference images</label>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#c5a059]/30 bg-black/20 px-6 py-8 text-center">
            <ImagePlus size={24} className="text-[#c5a059]" />
            <p className="mt-3 font-semibold text-[#f4ecd9]">Upload multiple inspiration images</p>
            <p className="mt-1 text-sm text-[#c9bea8]">PNG, JPG, JPEG, GIF, or WEBP</p>
            <Input
              name="referenceImages"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="mt-4 border-[#c5a059]/20 bg-black/20 text-[#f4ecd9] file:mr-4 file:rounded-full file:border-0 file:bg-[#c5a059]/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#f4ecd9]"
            />
          </label>
        </div>

        {previews.length > 0 ? (
          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[#c9bea8]">
              <span>Selected files</span>
              <span>{previews.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {previews.map((preview) => (
                <figure key={preview.url} className="overflow-hidden rounded-[18px] border border-white/10 bg-black/20">
                  <img src={preview.url} alt={preview.name} className="h-28 w-full object-cover" />
                  <figcaption className="truncate px-3 py-2 text-xs text-[#c9bea8]">{preview.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        ) : null}

        <div className={cn("mt-5 flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/5 px-4 py-3 text-xs text-[#c9bea8]")}>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#76c893]/15 text-[#76c893]">
            01
          </span>
          <span>Share a handle, a detailed idea, and a few visual references. We turn that into a one-off concept.</span>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
