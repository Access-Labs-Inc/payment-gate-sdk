export function getPaymentGateUrl(
  poolAddress: string,
  callbackUrl: string,
  paymentGateUrl = "https://gate.accessprotocol.co",
): string {
  if (!poolAddress) {
    throw new Error("Pool address is required");
  }
  if (!callbackUrl) {
    throw new Error("Callback URL is required");
  }
  return `${paymentGateUrl}?pool_address=${poolAddress}&callback_url=${encodeURIComponent(callbackUrl)}`;
}
