import type { AdminOrderRecord, AdminVendorRecord } from "@/data/mockAdmin";
import { formatCurrency } from "@/data/mockAccount";
import { getCustomerFacingBillSummary } from "@/lib/calculateBill";

export const COMMISSION_RATE = 0.1;
export const COMMISSION_GST_RATE = 0.18;

export const PLATFORM_INVOICE_COMPANY = {
  brandName: "Mera Halwai",
  legalName: "RE-SHAGUN HOSPITALITY PRIVATE LIMITED",
  gstin: "08AAOCR9294E1ZP",
  cin: "U56100RJ2025PTC105294",
  email: "merahalwai.com@gmail.com",
  constitution: "Private Limited Company",
  registrationType: "Regular",
  incorporationDate: "19/08/2025",
  gstCertificateIssueDate: "18/09/2025",
  addressLines: [
    "1034, Mahaveer Nagar II",
    "Mahaveer Nagar II",
    "Kota, Rajasthan",
    "PIN: 324005",
    "India",
  ],
} as const;

export type CommissionInvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  bookingReferenceDate: string;
  placeOfSupply: string;
  reverseCharge: "No";
  principalAmount: number;
  commissionAmount: number;
  gstAmount: number;
  totalPayable: number;
  amountInWords: string;
  fileName: string;
  lineDescription: string;
  terms: string[];
};

function sanitizeFragment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function twoDigit(num: number) {
  return num.toString().padStart(2, "0");
}

function formatShortStamp(date: Date) {
  return `${date.getFullYear()}${twoDigit(date.getMonth() + 1)}${twoDigit(date.getDate())}`;
}

function toWordsBelowHundred(value: number) {
  const belowTwenty = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (value < 20) return belowTwenty[value];
  const ten = Math.floor(value / 10);
  const unit = value % 10;
  return `${tens[ten]}${unit ? ` ${belowTwenty[unit]}` : ""}`;
}

function toWordsBelowThousand(value: number): string {
  if (value === 0) return "";
  if (value < 100) return toWordsBelowHundred(value);

  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  return `${toWordsBelowHundred(hundred)} Hundred${rest ? ` ${toWordsBelowHundred(rest)}` : ""}`;
}

export function amountToIndianWords(value: number) {
  const rounded = Math.max(0, Math.round(value));
  if (rounded === 0) return "Zero Rupees Only";

  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const hundred = rounded % 1000;

  const parts = [
    crore ? `${toWordsBelowThousand(crore)} Crore` : "",
    lakh ? `${toWordsBelowThousand(lakh)} Lakh` : "",
    thousand ? `${toWordsBelowThousand(thousand)} Thousand` : "",
    hundred ? toWordsBelowThousand(hundred) : "",
  ].filter(Boolean);

  return `${parts.join(" ")} Rupees Only`;
}

export function buildCommissionInvoice(order: AdminOrderRecord, vendor: AdminVendorRecord): CommissionInvoiceData {
  const bookingBill = getCustomerFacingBillSummary(order.bill);
  const principalAmount = bookingBill.bookingValue;
  const commissionAmount = Math.round(principalAmount * COMMISSION_RATE);
  const gstAmount = Math.round(commissionAmount * COMMISSION_GST_RATE);
  const totalPayable = commissionAmount + gstAmount;
  const referenceDate = new Date(order.paymentLinkSentAt ?? order.createdAt);
  const invoiceDate = formatDate(referenceDate.toISOString());
  const invoiceNumber = `MHCI-${order.id.replace(/[^A-Z0-9]/gi, "")}-${formatShortStamp(referenceDate)}`;
  const vendorSlug = sanitizeFragment(vendor.name) || "vendor";

  return {
    invoiceNumber,
    invoiceDate,
    bookingReferenceDate: formatDate(order.createdAt),
    placeOfSupply: `${vendor.city}, Rajasthan`,
    reverseCharge: "No",
    principalAmount,
    commissionAmount,
    gstAmount,
    totalPayable,
    amountInWords: amountToIndianWords(totalPayable),
    fileName: `vendor-commission-invoice-${vendorSlug}-${invoiceNumber}.pdf`,
    lineDescription: `Platform commission on booking order ${order.id}`,
    terms: [
      "This invoice is raised for platform commission only.",
      "Final customer booking invoice will be issued separately by the vendor.",
      "This invoice is for vendor/platform billing purposes only.",
      "Payment, if applicable, should be made as per agreed vendor settlement terms.",
      "This is a system-generated tax invoice.",
    ],
  };
}

export function getCommissionInvoiceRows(order: AdminOrderRecord, vendor: AdminVendorRecord) {
  const invoice = buildCommissionInvoice(order, vendor);

  return [
    { label: "Principal Amount", value: formatCurrency(invoice.principalAmount) },
    { label: "Commission @ 10%", value: formatCurrency(invoice.commissionAmount) },
    { label: "GST @ 18% on Commission", value: formatCurrency(invoice.gstAmount) },
    { label: "Total Payable", value: formatCurrency(invoice.totalPayable) },
  ];
}
