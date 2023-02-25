"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFirebaseAuth } from "../../auth/firebase";
import { clientConfig } from "../../config/client-config";
import { useLoadingCallback } from "react-loading-hook";
import { getGoogleProvider, loginWithProvider } from "./firebase";
import { useAuth } from "../../auth/hooks";
import styles from "./login.module.css";
import { Button } from "../../ui/button";
import { LoadingIcon } from "../../ui/icons";

export function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [showAnonymousInfo, setShowAnonymousInfo] = React.useState(true);
  const [hasLogged, setHasLogged] = React.useState(false);
  const { tenant } = useAuth();
  const { getFirebaseAuth } = useFirebaseAuth(clientConfig);
  const [handleLoginWithGoogle, isLoading] = useLoadingCallback(async () => {
    setHasLogged(false);
    const { GoogleAuthProvider } = await import("firebase/auth");
    const auth = await getFirebaseAuth();
    await loginWithProvider(
      auth,
      await getGoogleProvider(auth),
      GoogleAuthProvider.credentialFromError
    );
    setHasLogged(true);
  });

  React.useEffect(() => {
    const redirect = params.get("redirect");

    if (tenant && !tenant.isAnonymous) {
      router.push(redirect ?? "/");
      return;
    }

    if (tenant && showAnonymousInfo) {
      setShowAnonymousInfo(false);
    }
  }, [tenant?.isAnonymous]);

  return (
    <div className={styles.page}>
      <h2>next-firebase-auth-edge example login page</h2>
      {!tenant && showAnonymousInfo && (
        <div className={styles.info}>
          <p>
            No user found. Singing in as anonymous... <LoadingIcon />
          </p>
        </div>
      )}
      {!hasLogged && (
        <Button
          loading={isLoading}
          disabled={isLoading || !tenant}
          onClick={handleLoginWithGoogle}
        >
          Log in with Google
        </Button>
      )}
      {hasLogged && (
        <div className={styles.info}>
          <p>
            Redirecting to <strong>{params.get("redirect") || "/"}</strong> <LoadingIcon />
          </p>
        </div>
      )}
    </div>
  );
}