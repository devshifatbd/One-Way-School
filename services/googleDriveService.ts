
// This service handles uploads to Google Drive via Google Apps Script Web App
// This bypasses the need for complex client-side OAuth token management

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEyIfNrp9M7lbr7jEl0dhQh5-62uh75hN640VilGQcTMM0FXg5CyfldUHq2ysWZY_Wng/exec"; 

export const uploadFileToDrive = async (file: File): Promise<string> => {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
        throw new Error("Google Apps Script URL is not configured.");
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async () => {
            try {
                const base64String = (reader.result as string).split(',')[1]; // Remove data:image/png;base64, prefix

                const payload = {
                    filename: `OWS_${Date.now()}_${file.name}`,
                    mimeType: file.type,
                    bytes: base64String
                };

                // Note: We send as text/plain to avoid CORS preflight (OPTIONS) requests which GAS doesn't handle easily.
                // The GAS script parses the postData.contents regardless of Content-Type.
                const response = await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.status === 'success') {
                    resolve(result.url);
                } else {
                    reject(new Error(result.message || 'Upload failed'));
                }

            } catch (error) {
                console.error("GAS Upload Error:", error);
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};
