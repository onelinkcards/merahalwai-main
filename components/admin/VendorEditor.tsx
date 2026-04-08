"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import type { AdminVendorRecord } from "@/data/mockAdmin";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default function VendorEditor({
  vendorId,
  mode,
}: {
  vendorId?: string;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const { state, createVendor, updateVendor } = useAdmin();

  const seedVendor = useMemo(() => {
    const source = state.vendors.find((vendor) => vendor.id === vendorId) ?? state.vendors[0];
    if (!source) return null;
    if (mode === "edit") return clone(source);
    return {
      ...clone(source),
      id: `vendor-${Date.now()}`,
      slug: `new-vendor-${Date.now()}`,
      name: "",
      ownerName: "",
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
      locality: "",
      coverPhoto: "",
      gallery: [],
      shortDescription: "",
      about: "",
      googlePlaceId: "",
      googleReviewsEnabled: true,
      totalOrders: 0,
      status: "inactive" as const,
    } satisfies AdminVendorRecord;
  }, [mode, state.vendors, vendorId]);

  const [form, setForm] = useState<AdminVendorRecord | null>(seedVendor);
  const [saving, setSaving] = useState(false);

  if (!form) {
    return (
      <AdminShell title="Vendor unavailable" description="Vendor record could not be loaded.">
        <div className="rounded-[30px] border border-[#E7DED2] bg-white px-6 py-14 text-center shadow-[0_18px_40px_rgba(24,20,16,0.05)]">
          Vendor record unavailable.
        </div>
      </AdminShell>
    );
  }

  const saveVendor = () => {
    if (saving) return;
    setSaving(true);
    if (mode === "create") {
      createVendor(form);
    } else {
      updateVendor(form.id, form);
    }
    router.push("/admin/vendors");
  };

  return (
    <AdminShell
      title={mode === "create" ? "Add New Vendor" : `Edit ${form.name || "Vendor"}`}
      description="Configure business info, media, menu type, bank details, and activation status before the vendor goes live."
      actions={
        <button
          type="button"
          onClick={saveVendor}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#111111] px-5 text-[13px] font-bold text-white"
        >
          {saving ? "Saving..." : "Save Vendor"}
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Section title="Basic Business Info" eyebrow="Identity">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Vendor Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
              <Input label="Owner Name" value={form.ownerName} onChange={(value) => setForm({ ...form, ownerName: value })} />
              <Input label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
              <Input label="WhatsApp" value={form.whatsapp} onChange={(value) => setForm({ ...form, whatsapp: value })} />
              <Input label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
              <Input label="Locality" value={form.locality} onChange={(value) => setForm({ ...form, locality: value })} />
              <Input label="City" value={form.city} onChange={(value) => setForm({ ...form, city: value })} />
              <Input label="Pincode" value={form.pincode} onChange={(value) => setForm({ ...form, pincode: value })} />
              <Input label="Slug" value={form.slug} onChange={(value) => setForm({ ...form, slug: value })} />
              <Input
                label="Event Specialization"
                value={form.eventSpecialization.join(", ")}
                onChange={(value) => setForm({ ...form, eventSpecialization: value.split(",").map((entry) => entry.trim()).filter(Boolean) })}
              />
            </div>
            <Textarea label="Full Address" value={form.address} onChange={(value) => setForm({ ...form, address: value })} />
          </Section>

          <Section title="Media" eyebrow="Media">
            <div className="grid gap-4 md:grid-cols-2">
              <FileInput
                label="Cover Photo"
                helper="Upload one main image"
                onFiles={async (files) => {
                  const first = files[0];
                  if (!first) return;
                  const preview = await readFileAsDataUrl(first);
                  setForm({ ...form, coverPhoto: preview });
                }}
              />
              <FileInput
                label="Gallery Images"
                helper="Upload multiple images"
                multiple
                onFiles={async (files) => {
                  const previews = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
                  setForm({ ...form, gallery: previews });
                }}
              />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {form.coverPhoto ? (
                <PreviewCard title="Cover Preview" image={form.coverPhoto} />
              ) : (
                <PreviewCard title="Cover Preview" empty />
              )}
              <PreviewCard title="Gallery Preview" images={form.gallery} />
            </div>
          </Section>

          <Section title="Configuration" eyebrow="Setup">
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Menu Type"
                value={form.menuType}
                onChange={(value) => setForm({ ...form, menuType: value as AdminVendorRecord["menuType"] })}
              >
                <option value="veg_only">Veg Only</option>
                <option value="veg_and_non_veg">Veg + Non-Veg</option>
              </Select>
              <Select
                label="Status"
                value={form.status}
                onChange={(value) => setForm({ ...form, status: value as AdminVendorRecord["status"] })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="Short Description" value={form.shortDescription} onChange={(value) => setForm({ ...form, shortDescription: value })} />
              <Input
                label="Google Place ID"
                value={form.googlePlaceId ?? ""}
                onChange={(value) => setForm({ ...form, googlePlaceId: value })}
              />
            </div>
            <div className="mt-2 rounded-[16px] border border-[#E6E6E6] bg-[#F9F9F9] px-4 py-3 text-[13px] text-[#4A4A4A]">
              Ratings and reviews are fetched from Google. No manual rating entry is required.
            </div>
            <Textarea label="About Text" value={form.about} onChange={(value) => setForm({ ...form, about: value })} />
          </Section>

          <Section title="Bank Info" eyebrow="Billing">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Bank Name" value={form.bankInfo.bankName} onChange={(value) => setForm({ ...form, bankInfo: { ...form.bankInfo, bankName: value } })} />
              <Input label="Holder Name" value={form.bankInfo.holderName} onChange={(value) => setForm({ ...form, bankInfo: { ...form.bankInfo, holderName: value } })} />
              <Input label="Account Number" value={form.bankInfo.accountNumber} onChange={(value) => setForm({ ...form, bankInfo: { ...form.bankInfo, accountNumber: value } })} />
              <Input label="IFSC" value={form.bankInfo.ifsc} onChange={(value) => setForm({ ...form, bankInfo: { ...form.bankInfo, ifsc: value } })} />
            </div>
            <FileInput
              label="Cancelled Cheque"
              helper="Upload cheque image"
              onFiles={async (files) => {
                const first = files[0];
                if (!first) return;
                const preview = await readFileAsDataUrl(first);
                setForm({ ...form, bankInfo: { ...form.bankInfo, cancelledChequeUrl: preview } });
              }}
            />
          </Section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Section title="Go-live Checklist" eyebrow="Validation">
            <div className="space-y-3">
              {[
                ["Basic info", Boolean(form.name && form.phone && form.address)],
                ["Media", Boolean(form.coverPhoto && form.gallery.length)],
                ["Packages configured", Object.values(form.packages).every((pkg) => pkg.enabled && pkg.pricePerPlate > 0)],
                ["Bank info", Boolean(form.bankInfo.bankName && form.bankInfo.accountNumber && form.bankInfo.ifsc)],
              ].map(([label, done]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-[20px] border border-[#ECE2D6] bg-[#FCFAF7] px-4 py-3">
                  <span className="text-[14px] font-semibold text-[#2A251F]">{label}</span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${done ? "bg-[#EAF7ED] text-[#166534]" : "bg-[#FFF3F3] text-[#B54545]"}`}>
                    {done ? "Ready" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </aside>
      </div>
    </AdminShell>
  );
}

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[24px] border border-[#E6E6E6] bg-white p-6 shadow-[0_12px_26px_rgba(0,0,0,0.05)]">
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#111111]">{eyebrow}</p>
      <h2 className="mt-2 text-[24px] font-black tracking-[-0.04em] text-[#111111]">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </article>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#111111]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-[14px] border border-[#E6E6E6] bg-white px-4 text-[14px] font-medium text-[#111111] outline-none focus:border-[#111111]"
      />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#111111]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[110px] w-full rounded-[14px] border border-[#E6E6E6] bg-white px-4 py-3 text-[14px] font-medium text-[#111111] outline-none focus:border-[#111111]"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#111111]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-[14px] border border-[#E6E6E6] bg-white px-4 text-[14px] font-medium text-[#111111] outline-none focus:border-[#111111]"
      >
        {children}
      </select>
    </label>
  );
}

function FileInput({
  label,
  helper,
  multiple = false,
  onFiles,
}: {
  label: string;
  helper?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void | Promise<void>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#111111]">{label}</span>
      <div className="flex items-center gap-3 rounded-[14px] border border-dashed border-[#CFCFCF] bg-white px-4 py-4">
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
          className="w-full text-[13px] text-[#111111] file:mr-3 file:rounded-full file:border-0 file:bg-[#111111] file:px-3 file:py-2 file:text-[12px] file:font-bold file:text-white"
        />
      </div>
      {helper ? <p className="mt-2 text-[12px] text-[#6A6A6A]">{helper}</p> : null}
    </label>
  );
}

function PreviewCard({
  title,
  image,
  images = [],
  empty,
}: {
  title: string;
  image?: string;
  images?: string[];
  empty?: boolean;
}) {
  return (
    <div className="rounded-[16px] border border-[#E6E6E6] bg-white px-4 py-4">
      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#111111]">{title}</p>
      {empty ? (
        <p className="mt-3 text-[13px] text-[#7A7A7A]">No image uploaded yet.</p>
      ) : null}
      {image ? (
        <img src={image} alt="" className="mt-3 h-28 w-full rounded-[12px] object-cover" />
      ) : null}
      {images.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {images.slice(0, 6).map((src, index) => (
            <img key={index} src={src} alt="" className="h-16 w-full rounded-[10px] object-cover" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
