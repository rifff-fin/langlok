import { z } from 'zod';
import { inquiryForm } from '../content/copy';
import type { VesselChoice } from '../store/configurator';

/**
 * One inquiry (master plan §8.2). The form validates with this schema; the API will check
 * the same shape when sending goes live (Phase 6). The logo and preview travel as files
 * beside it, not in it.
 */
const e = inquiryForm.errors;
const optional = (max: number) => z.string().trim().max(max, e.tooLong);
const required = (max: number) => optional(max).min(1, e.required);

export const INQUIRY_TYPES = ['branding', 'samples', 'recan', 'contact'] as const;
export const BUSINESS_TYPES = ['hotel', 'franchise', 'event', 'venue', 'other'] as const;
export const PRODUCTS = ['can500', 'bottle990', 'both'] as const;

export const inquirySchema = z.object({
  type: z.enum(INQUIRY_TYPES),
  name: required(120),
  company: required(160),
  email: required(200).pipe(z.email(e.email)),
  phone: optional(40),
  country: required(80),
  businessType: z.enum(BUSINESS_TYPES),
  product: z.enum(PRODUCTS),
  quantityEstimate: optional(80),
  message: optional(4000),
  consent: z.boolean().refine((v) => v, e.consent),
});

export type InquiryType = (typeof INQUIRY_TYPES)[number];
export type Inquiry = z.infer<typeof inquirySchema>;

/** The product an inquiry asks about, from the configurator's vessel choice. */
export const productFor = (vessel: VesselChoice): Inquiry['product'] =>
  vessel === 'can' ? 'can500' : vessel === 'bottle' ? 'bottle990' : 'both';
