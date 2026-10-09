import type { TrustedHTML } from '../../utils/index.js';

/** A native form with optional three-step progressive enhancement. */
export interface MultiStepFormProps {
  className?: string;
  /** Additional attributes; string attributes are explicitly trusted legacy markup. */
  attrs?: string | Record<string, string | number | boolean | null | undefined>;
  /** Native form endpoint. Omit to submit to the current document URL. */
  action?: string;
  method?: 'get' | 'post';
}
/** Branded component HTML, usable directly in other component slots. */
export function multiStepForm(props?: MultiStepFormProps): TrustedHTML;
