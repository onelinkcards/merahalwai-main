import { z } from "zod";

export const bookFormSchema = z.object({
  guestCount: z.coerce.number().min(25, "Min 25 guests").max(2000),
  customerName: z.string().min(1, "Required"),
  customerPhone: z.string().regex(/^[0-9]{10}$/, "Enter 10-digit mobile"),
  customerEmail: z.string().email("Valid email required"),
  customerWhatsapp: z.string().optional(),
  whatsappSameAsPhone: z.boolean(),
  whatsappOptIn: z.boolean(),
  eventType: z.string().min(1, "Select event type"),
  eventDate: z.string().min(1, "Required"),
  eventTime: z.string().min(1, "Required"),
  venueName: z.string().optional(),
  venueAddress: z.string().min(1, "Required"),
  venueCity: z.string().min(1, "Required"),
  venuePincode: z.string().regex(/^[0-9]{6}$/, "6-digit pincode"),
  venueState: z.string().min(1, "Required"),
  specialNote: z.string().max(300).optional(),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;
