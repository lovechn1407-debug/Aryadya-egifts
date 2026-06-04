// Type declaration for @cashfreepayments/cashfree-js
// The package ships a UMD bundle without types.
declare module "@cashfreepayments/cashfree-js" {
  export interface CashfreeInstance {
    checkout(options: {
      paymentSessionId: string;
      redirectTarget?: "_self" | "_blank" | "_modal";
      returnUrl?: string;
    }): Promise<{ error?: unknown; redirect?: boolean }>;
  }

  export function load(options: {
    mode: "sandbox" | "production";
  }): Promise<CashfreeInstance>;
}
