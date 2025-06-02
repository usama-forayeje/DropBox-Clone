"use client";
import { ImageKitProvider } from "imagekitio-next"

export const authenticator = async () => {
    try {
        const response = await fetch("/api/imagekit-auth");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error authenticator :", error);
        throw error;
    }
};

export function Providers({ children }) {
    return <div>
        <ImageKitProvider
            authenticator={authenticator}
            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
        >
            {children}
        </ImageKitProvider>
    </div>;
}