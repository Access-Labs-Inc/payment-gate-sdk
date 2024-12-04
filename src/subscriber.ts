export const DEFAULT_ACCESS_API_URL = "https://papi.accessprotocol.co/";

export type VerifySubscriberTokenResponse = {
  isSubscriber: boolean;
  userPubkey: string;
  poolPubkey: string;
};

export type AccessSubscriptionCheckerConfig = {
  poolAddress: string;
  apiUrl?: string;
};

export const createAccessSubscriptionChecker = (
  config: AccessSubscriptionCheckerConfig,
) => {
  if (!config.poolAddress) {
    throw new Error("poolAddress is required");
  }
  if (!config.apiUrl) {
    config.apiUrl = DEFAULT_ACCESS_API_URL;
  }

  const { apiUrl, poolAddress } = config;

  return {
    async checkSubscription(
      accessToken: string,
    ): Promise<VerifySubscriberTokenResponse> {
      try {
        const response = await fetch(`${apiUrl}/subscriber_token/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: accessToken,
            pool_pubkey: poolAddress,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            `HTTP error! status: ${response.status}${
              errorData ? `, message: ${errorData.message}` : ""
            }`,
          );
        }

        const data = await response.json();
        return {
          isSubscriber: data.is_subscriber,
          userPubkey: data.user_pubkey,
          poolPubkey: data.pool_pubkey,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Failed to verify subscription: ${errorMessage}`);
      }
    },
  };
};
