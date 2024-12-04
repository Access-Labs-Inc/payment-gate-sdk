import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  createAccessSubscriptionChecker,
  DEFAULT_ACCESS_API_URL,
} from "./subscriber";

const SUBSCRIPTION_TOKEN_KEY = "access-protocol-subscription-token";

function setAccessToken(accessToken: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(SUBSCRIPTION_TOKEN_KEY, accessToken);
  }
}

function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(SUBSCRIPTION_TOKEN_KEY);
  }
  return null;
}

function clearAccessToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SUBSCRIPTION_TOKEN_KEY);
  }
}

const POOL_ADDRESS = process.env.NEXT_PUBLIC_POOL_ADDRESS;

type SubscriptionContextType = {
  token: string | null;
  clearSubscription: () => void;
};

const AccessSubscriptionContext = createContext<SubscriptionContextType>({
  token: null,
  clearSubscription: () => {},
});

export function AccessSubscriptionProvider({
  children,
  poolAddress,
  accessApiUrl,
}: {
  children: React.ReactNode;
  poolAddress: string;
  accessApiUrl?: string;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const clearSubscription = () => {
    clearAccessToken();
    setToken(null);
  };

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("access_token");

    if (urlToken) {
      setAccessToken(urlToken);
      setToken(urlToken);
    }

    const storedToken = urlToken || getAccessToken();

    if (storedToken && POOL_ADDRESS) {
      const checker = createAccessSubscriptionChecker({
        poolAddress,
        apiUrl: accessApiUrl ?? DEFAULT_ACCESS_API_URL,
      });

      checker
        .checkSubscription(storedToken)
        .then(({ isSubscriber }) => {
          if (!isSubscriber) setToken(null);
        })
        .catch((err) => {
          console.error("Failed to verify subscription:", err);
          setToken(null);
        });
    }
  }, []);

  if (!mounted) return null;

  return (
    <AccessSubscriptionContext.Provider value={{ token, clearSubscription }}>
      <>{children}</>
    </AccessSubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(AccessSubscriptionContext);
