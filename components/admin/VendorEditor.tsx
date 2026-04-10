"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImagePlus, Landmark, Store, Wallet } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import type { AdminVendorRecord } from "@/data/mockAdmin";
import {
  AdminButton,
  AdminEmptyState,
  AdminInput,
  AdminPanel,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/AdminUi";

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
        <AdminEmptyState title="Vendor record unavailable" body="The vendor state could not be loaded for editing." />
      </AdminShell>
    );
  }

  const goLiveChecks = [
    { label: "Basic business info", done: Boolean(form.name && form.phone && form.address) },
    { label: "Media uploaded", done: Boolean(form.coverPhoto && form.gallery.length) },
    { label: "Packages configured", done: Object.values(form.packages).every((pkg) => pkg.enabled && pkg.pricePerPlate > 0) },
    { label: "Bank details added", done: Boolean(form.bankInfo.bankName && form.bankInfo.accountNumber && form.bankInfo.ifsc) },
  ];

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
      title={mode === "create" ? "Create Vendor" : `Edit ${form.name || "Vendor"}`}
      description="Manage vendor business identity, media, menu configuration metadata, banking, and go-live readiness."
      actions={
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/vendors")}
            className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-bold text-[#0F172A]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveVendor}
            className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#0F172A] px-4 text-[13px] font-bold text-white"
          >
            {saving ? "Saving..." : "Save Vendor"}
          </button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <AdminPanel
            eyebrow="Business"
            title="Vendor Identity"
            description="Core listing and operations fields used by discovery, booking assignment, and admin records."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <AdminInput label="Vendor Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <AdminInput label="Owner Name" value={form.ownerName} onChange={(event) => setForm({ ...form, ownerName: event.target.value })} />
              <AdminInput label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              <AdminInput label="WhatsApp" value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} />
              <AdminInput label="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <AdminInput label="Slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
              <AdminInput label="Locality" value={form.locality} onChange={(event) => setForm({ ...form, locality: event.target.value })} />
              <AdminInput label="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
              <AdminInput label="Pincode" value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value })} />
              <AdminInput
                label="Event Specialization"
                value={form.eventSpecialization.join(", ")}
                onChange={(event) =>
                  setForm({
                    ...form,
                    eventSpecialization: event.target.value.split(",").map((entry) => entry.trim()).filter(Boolean),
                  })
                }
              />
            </div>
            <div className="mt-4">
              <AdminTextarea label="Full Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </div>
          </AdminPanel>

          <AdminPanel
            eyebrow="Media"
            title="Cover & Gallery"
            description="Upload real vendor assets. Images here should match the customer-facing vendor profile."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FileField
                label="Cover Photo"
                helper="One primary image for the vendor detail hero."
                icon={ImagePlus}
                onFiles={async (files) => {
                  const first = files[0];
                  if (!first) return;
                  const preview = await readFileAsDataUrl(first);
                  setForm({ ...form, coverPhoto: preview });
                }}
              />
              <FileField
                label="Gallery Images"
                helper="Multiple customer-facing images."
                icon={ImagePlus}
                multiple
                onFiles={async (files) => {
                  const previews = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
                  setForm({ ...form, gallery: previews });
                }}
              />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <PreviewPanel title="Cover Preview" image={form.coverPhoto} emptyLabel="No cover image uploaded" />
              <PreviewPanel title="Gallery Preview" images={form.gallery} emptyLabel="No gallery images uploaded" />
            </div>
          </AdminPanel>

          <AdminPanel
            eyebrow="Listing Configuration"
            title="Customer-facing Settings"
            description="These values drive the customer vendor page and discovery cards."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <AdminSelect
                label="Menu Type"
                value={form.menuType}
                onChange={(event) => setForm({ ...form, menuType: event.target.value as AdminVendorRecord["menuType"] })}
              >
                <option value="veg_only">Veg Only</option>
                <option value="veg_and_non_veg">Veg + Non-Veg</option>
              </AdminSelect>
              <AdminSelect
                label="Status"
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as AdminVendorRecord["status"] })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </AdminSelect>
              <AdminInput label="Short Description" value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} />
              <AdminInput
                label="Google Place ID"
                value={form.googlePlaceId ?? ""}
                onChange={(event) => setForm({ ...form, googlePlaceId: event.target.value })}
              />
            </div>

            <div className="mt-4 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-[13px] leading-[1.7] text-[#5B6574]">
              Ratings and reviews are expected from Google reviews integration. Do not manually manufacture rating values here.
            </div>

            <div className="mt-4">
              <AdminTextarea label="About Text" value={form.about} onChange={(event) => setForm({ ...form, about: event.target.value })} />
            </div>
          </AdminPanel>

          <AdminPanel
            eyebrow="Banking"
            title="Vendor Bank Details"
            description="Required for operational payout and reconciliation."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <AdminInput label="Bank Name" value={form.bankInfo.bankName} onChange={(event) => setForm({ ...form, bankInfo: { ...form.bankInfo, bankName: event.target.value } })} />
              <AdminInput label="Holder Name" value={form.bankInfo.holderName} onChange={(event) => setForm({ ...form, bankInfo: { ...form.bankInfo, holderName: event.target.value } })} />
              <AdminInput label="Account Number" value={form.bankInfo.accountNumber} onChange={(event) => setForm({ ...form, bankInfo: { ...form.bankInfo, accountNumber: event.target.value } })} />
              <AdminInput label="IFSC" value={form.bankInfo.ifsc} onChange={(event) => setForm({ ...form, bankInfo: { ...form.bankInfo, ifsc: event.target.value } })} />
            </div>
            <div className="mt-4">
              <FileField
                label="Cancelled Cheque"
                helper="Used for vendor verification."
                icon={Landmark}
                onFiles={async (files) => {
                  const first = files[0];
                  if (!first) return;
                  const preview = await readFileAsDataUrl(first);
                  setForm({ ...form, bankInfo: { ...form.bankInfo, cancelledChequeUrl: preview } });
                }}
              />
            </div>
          </AdminPanel>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <AdminPanel eyebrow="Readiness" title="Go-live Checklist">
            <div className="space-y-3">
              {goLiveChecks.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                  <span className="text-[14px] font-medium text-[#334155]">{item.label}</span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                      item.done ? "border border-[#B7E0C5] bg-[#EEFDF3] text-[#15803D]" : "border border-[#E2E8F0] bg-white text-[#64748B]"
                    }`}
                  >
                    {item.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                    {item.done ? "Ready" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel eyebrow="Shortcuts" title="Next Configuration Steps">
            <div className="space-y-3">
              <Link
                href={`/admin/vendors/${form.id}/menu`}
                className="flex items-center justify-between rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-[14px] font-semibold text-[#0F172A]"
              >
                <span className="flex items-center gap-3">
                  <Store className="h-4 w-4 text-[#64748B]" />
                  Package menu manager
                </span>
                <span className="text-[12px] text-[#64748B]">Open</span>
              </Link>
              <Link
                href={`/admin/vendors/${form.id}/addons`}
                className="flex items-center justify-between rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-[14px] font-semibold text-[#0F172A]"
              >
                <span className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-[#64748B]" />
                  Add-ons & water config
                </span>
                <span className="text-[12px] text-[#64748B]">Open</span>
              </Link>
            </div>
          </AdminPanel>

          <AdminPanel eyebrow="Actions" title="Save Vendor">
            <p className="text-[14px] leading-[1.7] text-[#5B6574]">
              Save after each major edit so packages, images, and customer-facing details stay in sync.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <AdminButton onClick={saveVendor}>{saving ? "Saving..." : "Save Vendor"}</AdminButton>
              <AdminButton variant="secondary" onClick={() => router.push("/admin/vendors")}>
                Back to Vendors
              </AdminButton>
            </div>
          </AdminPanel>
        </div>
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

function FileField({
  label,
  helper,
  icon: Icon,
  multiple = false,
  onFiles,
}: {
  label: string;
  helper?: string;
  icon: typeof ImagePlus;
  multiple?: boolean;
  onFiles: (files: File[]) => void | Promise<void>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{label}</span>
      <div className="rounded-[16px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4">
        <div className="mb-3 flex items-center gap-3 text-[#334155]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#D9E1EC] bg-white">
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-[13px] font-medium">{helper || "Upload image"}</span>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
          className="w-full text-[13px] text-[#0F172A] file:mr-3 file:rounded-[10px] file:border-0 file:bg-[#0F172A] file:px-3 file:py-2 file:text-[12px] file:font-bold file:text-white"
        />
      </div>
    </label>
  );
}

function PreviewPanel({
  title,
  image,
  images = [],
  emptyLabel,
}: {
  title: string;
  image?: string;
  images?: string[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{title}</p>
      {image ? (
        <Image src={image} alt="" width={640} height={320} unoptimized className="mt-3 h-40 w-full rounded-[14px] object-cover" />
      ) : images.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {images.slice(0, 6).map((src, index) => (
            <Image
              key={index}
              src={src}
              alt=""
              width={160}
              height={120}
              unoptimized
              className="h-20 w-full rounded-[12px] object-cover"
            />
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-[#64748B]">{emptyLabel}</p>
      )}
    </div>
  );
}
