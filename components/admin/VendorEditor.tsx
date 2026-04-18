"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, ChevronLeft, ChevronRight, ImagePlus, MapPin, Receipt, Store } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import type { AdminVendorRecord } from "@/data/mockAdmin";
import { EVENT_OPTIONS } from "@/data/vendorFilterOptions";
import {
  AdminButton,
  AdminEmptyState,
  AdminInput,
  AdminPanel,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/AdminUi";

type WizardStepId = "identity" | "location" | "media" | "listing" | "review";

type WizardStep = {
  id: WizardStepId;
  eyebrow: string;
  title: string;
  description: string;
};

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "identity",
    eyebrow: "Step 1",
    title: "Vendor Basics",
    description: "Core vendor identity and the contact details used for admin operations and vendor WhatsApp confirmation.",
  },
  {
    id: "location",
    eyebrow: "Step 2",
    title: "Address & Event Fit",
    description: "Add the locality, full address, and event specialization values that should match customer-side filters.",
  },
  {
    id: "media",
    eyebrow: "Step 3",
    title: "Cover & Gallery",
    description: "Upload the customer-facing photos that appear on discovery cards and vendor detail pages.",
  },
  {
    id: "listing",
    eyebrow: "Step 4",
    title: "Listing Details",
    description: "Configure the menu type, Google Place ID, about copy, and GST information required for commission billing.",
  },
  {
    id: "review",
    eyebrow: "Step 5",
    title: "Review & Save",
    description: "Check the final listing summary before saving the vendor into admin state and customer discovery.",
  },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function pickTemplateVendor(vendors: AdminVendorRecord[], menuType: AdminVendorRecord["menuType"]) {
  return clone(vendors.find((vendor) => vendor.menuType === menuType) ?? vendors[0]);
}

function buildCreateVendorSeed(vendors: AdminVendorRecord[]) {
  const template = pickTemplateVendor(vendors, "veg_and_non_veg");
  return {
    ...template,
    id: `vendor-${Date.now()}`,
    slug: "",
    name: "",
    ownerName: "",
    phone: "",
    whatsapp: "",
    email: "",
    gstNumber: "",
    address: "",
    city: "Jaipur",
    pincode: "",
    locality: "",
    eventSpecialization: [],
    coverPhoto: "",
    gallery: [],
    shortDescription: "",
    about: "",
    googlePlaceId: "",
    googleReviewsEnabled: true,
    totalOrders: 0,
    status: "inactive" as const,
    bankInfo: {
      ...template.bankInfo,
      bankName: "",
      accountNumber: "",
      holderName: "",
      ifsc: "",
      cancelledChequeUrl: "",
    },
  } satisfies AdminVendorRecord;
}

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

function StepIndicator({
  currentStep,
  setCurrentStep,
  stepValidity,
}: {
  currentStep: number;
  setCurrentStep: (value: number) => void;
  stepValidity: Record<WizardStepId, boolean>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {WIZARD_STEPS.map((step, index) => {
        const active = index === currentStep;
        const complete = index < currentStep && stepValidity[step.id];
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => setCurrentStep(index)}
            className={`rounded-[18px] border px-4 py-4 text-left transition ${
              active
                ? "border-[#111827] bg-[#111827] text-white shadow-[0_16px_40px_rgba(17,24,39,0.16)]"
                : complete
                  ? "border-[#C7D2FE] bg-[#F8FAFF] text-[#1F2937]"
                  : "border-[#D5DAE2] bg-white text-[#4B5563]"
            }`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${active ? "text-white/70" : "text-[#6B7280]"}`}>
              {step.eyebrow}
            </p>
            <p className="mt-2 text-[15px] font-black tracking-[-0.02em]">{step.title}</p>
            <p className={`mt-2 text-[12px] leading-[1.5] ${active ? "text-white/78" : "text-[#6B7280]"}`}>
              {complete ? "Ready" : active ? "Current step" : "Fill next"}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function EventChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[14px] border px-4 py-3 text-left text-[13px] font-semibold transition ${
        active
          ? "border-[#111827] bg-[#111827] text-white"
          : "border-[#D5DAE2] bg-[#F8FAFC] text-[#334155] hover:border-[#94A3B8]"
      }`}
    >
      {label}
    </button>
  );
}

function FileField({
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
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{label}</span>
      <div className="rounded-[18px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5">
        <div className="mb-4 flex items-center gap-3 text-[#334155]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#D9E1EC] bg-white">
            <ImagePlus className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-[#111827]">{label}</p>
            {helper ? <p className="text-[12px] text-[#64748B]">{helper}</p> : null}
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
          className="w-full text-[13px] text-[#0F172A] file:mr-3 file:rounded-[10px] file:border-0 file:bg-[#111827] file:px-3 file:py-2 file:text-[12px] file:font-bold file:text-white"
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
    <div className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{title}</p>
      {image ? (
        <Image src={image} alt="" width={640} height={320} unoptimized className="mt-3 h-44 w-full rounded-[16px] object-cover" />
      ) : images.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {images.slice(0, 6).map((src, index) => (
            <Image
              key={`${title}-${index}`}
              src={src}
              alt=""
              width={160}
              height={120}
              unoptimized
              className="h-24 w-full rounded-[14px] object-cover"
            />
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-[#64748B]">{emptyLabel}</p>
      )}
    </div>
  );
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
    const existing = state.vendors.find((vendor) => vendor.id === vendorId);
    if (mode === "edit") return existing ? clone(existing) : null;
    return state.vendors.length ? buildCreateVendorSeed(state.vendors) : null;
  }, [mode, state.vendors, vendorId]);

  const [form, setForm] = useState<AdminVendorRecord | null>(seedVendor);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  useEffect(() => {
    setForm(seedVendor);
    setCurrentStep(0);
    setSlugTouched(mode === "edit");
  }, [mode, seedVendor]);

  useEffect(() => {
    if (!form || slugTouched) return;
    setForm((current) => (current ? { ...current, slug: slugify(current.name) } : current));
  }, [form?.name, form, slugTouched]);

  if (!form) {
    return (
      <AdminShell title="Vendor unavailable" description="Vendor record could not be loaded.">
        <AdminEmptyState title="Vendor record unavailable" body="The vendor state could not be loaded for editing." />
      </AdminShell>
    );
  }

  const currentStepId = WIZARD_STEPS[currentStep]?.id ?? "identity";
  const slugConflict = state.vendors.some((vendor) => vendor.slug === form.slug && vendor.id !== form.id);

  const stepValidity: Record<WizardStepId, boolean> = {
    identity: Boolean(form.name.trim() && form.ownerName.trim() && form.whatsapp.trim() && form.email.trim() && form.slug.trim() && !slugConflict),
    location: Boolean(form.locality.trim() && form.city.trim() && form.pincode.trim() && form.address.trim() && form.eventSpecialization.length > 0),
    media: Boolean(form.coverPhoto || form.gallery.length > 0),
    listing: Boolean(form.menuType && form.about.trim()),
    review:
      Boolean(form.name.trim()) &&
      Boolean(form.locality.trim()) &&
      Boolean(form.about.trim()) &&
      Boolean(form.email.trim()) &&
      !slugConflict,
  };

  const stepCanContinue = stepValidity[currentStepId];
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  const applyMenuTemplate = (menuType: AdminVendorRecord["menuType"]) => {
    const template = pickTemplateVendor(state.vendors, menuType);
    setForm((current) =>
      current
        ? {
            ...current,
            menuType,
            packages: {
              bronze: {
                ...clone(template.packages.bronze),
                pricePerPlate: current.packages.bronze.pricePerPlate,
              },
              silver: {
                ...clone(template.packages.silver),
                pricePerPlate: current.packages.silver.pricePerPlate,
              },
              gold: {
                ...clone(template.packages.gold),
                pricePerPlate: current.packages.gold.pricePerPlate,
              },
            },
            addons: clone(template.addons),
            water: clone(template.water),
          }
        : current
    );
  };

  const saveVendor = () => {
    if (!form || saving || slugConflict || !stepValidity.review) return;
    setSaving(true);
    try {
      const finalVendor: AdminVendorRecord = {
        ...form,
        id: mode === "create" ? form.slug : form.id,
        slug: form.slug,
        phone: form.whatsapp,
        whatsapp: form.whatsapp,
        bankInfo: {
          ...form.bankInfo,
          holderName: form.ownerName || form.name,
        },
      };

      if (mode === "create") {
        createVendor(finalVendor);
      } else {
        updateVendor(form.id, finalVendor);
      }
      router.push("/admin/vendors");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title={mode === "create" ? "Add Vendor" : `Edit ${form.name || "Vendor"}`}
      description="Create or update the vendor record that drives customer-facing listing details, booking assignment, and commission billing."
      actions={
        <div className="flex flex-wrap gap-3">
          <AdminButton variant="secondary" onClick={() => router.push("/admin/vendors")}>
            Cancel
          </AdminButton>
          {isLastStep ? (
            <AdminButton onClick={saveVendor} disabled={saving || slugConflict || !stepValidity.review}>
              {saving ? "Saving..." : mode === "create" ? "Create Vendor" : "Save Changes"}
            </AdminButton>
          ) : null}
        </div>
      }
    >
      <div className="space-y-6">
        <StepIndicator currentStep={currentStep} setCurrentStep={setCurrentStep} stepValidity={stepValidity} />

        <AdminPanel
          eyebrow={WIZARD_STEPS[currentStep].eyebrow}
          title={WIZARD_STEPS[currentStep].title}
          description={WIZARD_STEPS[currentStep].description}
        >
          {currentStepId === "identity" ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <AdminInput
                label="Vendor Name"
                value={form.name}
                placeholder="Royal Bagh"
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <AdminInput
                label="Owner Name"
                value={form.ownerName}
                placeholder="Naveen Sharma"
                onChange={(event) => setForm({ ...form, ownerName: event.target.value })}
              />
              <AdminInput
                label="Vendor WhatsApp Number"
                value={form.whatsapp}
                placeholder="+91 98XXXXXXXX"
                hint="This number is used when admin sends the vendor confirmation link on WhatsApp."
                onChange={(event) => setForm({ ...form, whatsapp: event.target.value, phone: event.target.value })}
              />
              <AdminInput
                label="Operations Email"
                type="email"
                value={form.email}
                placeholder="vendor@example.com"
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />

              <div className="lg:col-span-2 rounded-[18px] border border-[#D5DAE2] bg-[#F8FAFC] px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748B]">Auto-generated Slug</p>
                <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[18px] font-black tracking-[-0.03em] text-[#111827]">{form.slug || "vendor-slug-preview"}</p>
                    <p className="mt-1 text-[13px] text-[#64748B]">Used in vendor URLs and customer booking routes.</p>
                  </div>
                  <div className="flex gap-2">
                    <AdminButton variant="secondary" onClick={() => setSlugTouched((value) => !value)}>
                      {slugTouched ? "Lock Auto Slug" : "Edit Slug"}
                    </AdminButton>
                  </div>
                </div>
                {slugTouched ? (
                  <div className="mt-4 max-w-[420px]">
                    <AdminInput
                      label="Slug"
                      value={form.slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        setForm({ ...form, slug: slugify(event.target.value) });
                      }}
                      hint={slugConflict ? "This slug already exists. Choose a unique slug." : "Lowercase, hyphen-separated, customer-facing URL."}
                      className={slugConflict ? "border-[#E7C8D0] focus:border-[#E7C8D0] focus:ring-[#F7E1E6]" : ""}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {currentStepId === "location" ? (
            <div className="space-y-6">
              <div className="grid gap-5 lg:grid-cols-3">
                <AdminInput
                  label="Locality"
                  value={form.locality}
                  placeholder="C-Scheme"
                  onChange={(event) => setForm({ ...form, locality: event.target.value })}
                />
                <AdminInput
                  label="City"
                  value={form.city}
                  placeholder="Jaipur"
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                />
                <AdminInput
                  label="Pincode"
                  value={form.pincode}
                  placeholder="302001"
                  onChange={(event) => setForm({ ...form, pincode: event.target.value })}
                />
              </div>

              <AdminTextarea
                label="Full Address"
                value={form.address}
                placeholder="Full billing and operations address"
                onChange={(event) => setForm({ ...form, address: event.target.value })}
              />

              <div className="rounded-[18px] border border-[#D5DAE2] bg-[#F8FAFC] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748B]">Event Specialization</p>
                    <p className="mt-2 text-[14px] leading-[1.65] text-[#616B78]">
                      Select the exact event types this vendor should appear under on the customer listing and vendor discovery filters.
                    </p>
                  </div>
                  <AdminButton
                    variant="secondary"
                    onClick={() =>
                      setForm({
                        ...form,
                        eventSpecialization:
                          form.eventSpecialization.length === EVENT_OPTIONS.length ? [] : [...EVENT_OPTIONS],
                      })
                    }
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    {form.eventSpecialization.length === EVENT_OPTIONS.length ? "Clear All" : "Select All"}
                  </AdminButton>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {EVENT_OPTIONS.map((option) => (
                    <EventChip
                      key={option}
                      label={option}
                      active={form.eventSpecialization.includes(option)}
                      onClick={() =>
                        setForm({
                          ...form,
                          eventSpecialization: form.eventSpecialization.includes(option)
                            ? form.eventSpecialization.filter((entry) => entry !== option)
                            : [...form.eventSpecialization, option],
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {currentStepId === "media" ? (
            <div className="space-y-6">
              <div className="grid gap-5 xl:grid-cols-2">
                <FileField
                  label="Cover Photo"
                  helper="Primary hero image used on the customer vendor page."
                  onFiles={async (files) => {
                    const first = files[0];
                    if (!first) return;
                    const preview = await readFileAsDataUrl(first);
                    setForm({ ...form, coverPhoto: preview });
                  }}
                />
                <FileField
                  label="Gallery Images"
                  helper="Multiple images used in album, preview strips, and vendor gallery."
                  multiple
                  onFiles={async (files) => {
                    const previews = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
                    setForm({ ...form, gallery: previews });
                  }}
                />
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <PreviewPanel title="Cover Preview" image={form.coverPhoto} emptyLabel="No cover image uploaded yet." />
                <PreviewPanel title="Gallery Preview" images={form.gallery} emptyLabel="No gallery images uploaded yet." />
              </div>
            </div>
          ) : null}

          {currentStepId === "listing" ? (
            <div className="space-y-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <AdminSelect
                  label="Menu Type"
                  value={form.menuType}
                  onChange={(event) => applyMenuTemplate(event.target.value as AdminVendorRecord["menuType"])}
                >
                  <option value="veg_only">Veg Only</option>
                  <option value="veg_and_non_veg">Veg + Non-Veg</option>
                </AdminSelect>
                <AdminInput
                  label="Google Place ID"
                  value={form.googlePlaceId ?? ""}
                  placeholder="ChIJ..."
                  onChange={(event) => setForm({ ...form, googlePlaceId: event.target.value })}
                />
                <AdminInput
                  label="Vendor GST Number"
                  value={form.gstNumber}
                  placeholder="GST number if available"
                  hint="Used in admin-side commission invoice billing."
                  onChange={(event) => setForm({ ...form, gstNumber: event.target.value.trim().toUpperCase() })}
                />
                <AdminSelect
                  label="Listing Status"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as AdminVendorRecord["status"] })}
                >
                  <option value="inactive">Inactive</option>
                  <option value="active">Active</option>
                </AdminSelect>
              </div>

              <div className="rounded-[18px] border border-[#D5DAE2] bg-[#F8FAFC] p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748B]">Set Vendor Pricing</p>
                <p className="mt-2 text-[14px] leading-[1.65] text-[#616B78]">
                  Set this vendor&apos;s bronze, silver, and gold price per plate.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {(["bronze", "silver", "gold"] as const).map((tier) => (
                    <AdminInput
                      key={tier}
                      label={`${tier.charAt(0).toUpperCase() + tier.slice(1)} Price / Plate`}
                      value={String(form.packages[tier].pricePerPlate)}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          packages: {
                            ...form.packages,
                            [tier]: {
                              ...form.packages[tier],
                              pricePerPlate: Number(event.target.value) || 0,
                            },
                          },
                        })
                      }
                    />
                  ))}
                </div>
              </div>

              <AdminInput
                label="Short Description"
                value={form.shortDescription}
                placeholder="Short line used on the customer listing cards"
                onChange={(event) => setForm({ ...form, shortDescription: event.target.value })}
              />

              <AdminTextarea
                label="About"
                value={form.about}
                placeholder="Customer-facing about copy"
                onChange={(event) => setForm({ ...form, about: event.target.value })}
              />
            </div>
          ) : null}

          {currentStepId === "review" ? (
            <div className="space-y-6">
              <div className="grid gap-5 xl:grid-cols-2">
                <AdminPanel eyebrow="Business" title="Vendor Snapshot" className="border-[#E5E7EB] bg-[#F8FAFC] shadow-none">
                  <div className="grid gap-4 md:grid-cols-2">
                    <ReviewField label="Vendor Name" value={form.name} />
                    <ReviewField label="Owner Name" value={form.ownerName} />
                    <ReviewField label="WhatsApp" value={form.whatsapp} />
                    <ReviewField label="Email" value={form.email} />
                    <ReviewField label="Slug" value={form.slug} />
                    <ReviewField label="GST Number" value={form.gstNumber || "—"} />
                  </div>
                </AdminPanel>

                <AdminPanel eyebrow="Address" title="Frontend Listing Fields" className="border-[#E5E7EB] bg-[#F8FAFC] shadow-none">
                  <div className="grid gap-4 md:grid-cols-2">
                    <ReviewField label="Locality" value={form.locality} />
                    <ReviewField label="City" value={form.city} />
                    <ReviewField label="Pincode" value={form.pincode} />
                    <ReviewField label="Menu Type" value={form.menuType === "veg_only" ? "Veg Only" : "Veg + Non-Veg"} />
                    <ReviewField label="Status" value={form.status === "active" ? "Active" : "Inactive"} />
                    <ReviewField label="Google Place ID" value={form.googlePlaceId || "—"} />
                  </div>
                  <div className="mt-4 rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Full Address</p>
                    <p className="mt-2 text-[15px] font-semibold leading-[1.7] text-[#111827]">{form.address || "—"}</p>
                  </div>
                </AdminPanel>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <AdminPanel eyebrow="Discovery" title="Event Specialization" className="border-[#E5E7EB] bg-[#F8FAFC] shadow-none">
                  <div className="flex flex-wrap gap-2.5">
                    {form.eventSpecialization.length ? (
                      form.eventSpecialization.map((entry) => (
                        <span
                          key={entry}
                          className="inline-flex items-center rounded-full border border-[#D1D5DB] bg-white px-3 py-2 text-[12px] font-semibold text-[#334155]"
                        >
                          {entry}
                        </span>
                      ))
                    ) : (
                      <p className="text-[14px] text-[#64748B]">No event specialization selected yet.</p>
                    )}
                  </div>
                </AdminPanel>

                <AdminPanel eyebrow="Media" title="Uploaded Assets" className="border-[#E5E7EB] bg-[#F8FAFC] shadow-none">
                  <div className="space-y-4">
                    <ReviewField label="Cover Uploaded" value={form.coverPhoto ? "Yes" : "No"} />
                    <ReviewField label="Gallery Count" value={`${form.gallery.length} images`} />
                    <ReviewField
                      label="Package Pricing"
                      value={`Bronze ₹${form.packages.bronze.pricePerPlate} · Silver ₹${form.packages.silver.pricePerPlate} · Gold ₹${form.packages.gold.pricePerPlate}`}
                    />
                  </div>
                </AdminPanel>
              </div>
            </div>
          ) : null}
        </AdminPanel>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[13px] text-[#6B7280]">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[14px] border border-[#D5DAE2] bg-white">
              {currentStepId === "identity" ? <Store className="h-4 w-4" /> : null}
              {currentStepId === "location" ? <MapPin className="h-4 w-4" /> : null}
              {currentStepId === "media" ? <ImagePlus className="h-4 w-4" /> : null}
              {currentStepId === "listing" ? <Receipt className="h-4 w-4" /> : null}
              {currentStepId === "review" ? <Store className="h-4 w-4" /> : null}
            </span>
            <span>
              {currentStep + 1} / {WIZARD_STEPS.length} completed steps
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <AdminButton variant="secondary" disabled={currentStep === 0} onClick={() => setCurrentStep((value) => Math.max(0, value - 1))}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </AdminButton>
            {isLastStep ? (
              <AdminButton onClick={saveVendor} disabled={saving || slugConflict || !stepValidity.review}>
                {saving ? "Saving..." : mode === "create" ? "Create Vendor" : "Save Changes"}
              </AdminButton>
            ) : (
              <AdminButton disabled={!stepCanContinue} onClick={() => setCurrentStep((value) => Math.min(WIZARD_STEPS.length - 1, value + 1))}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </AdminButton>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{label}</p>
      <p className="mt-2 text-[15px] font-semibold leading-[1.6] text-[#111827]">{value || "—"}</p>
    </div>
  );
}
