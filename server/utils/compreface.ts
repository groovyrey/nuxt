export const useCompreFace = () => {
  const config = useRuntimeConfig();
  const baseUrl = config.comprefaceUrl || 'http://localhost:8000';
  const apiKey = config.comprefaceApiKey;

  const request = async (endpoint: string, method: string, body: any) => {
    if (!apiKey) {
      console.warn('CompreFace API Key missing. Biometrics will fail.');
      throw new Error('Biometric service unavailable');
    }

    const response = await fetch(`${baseUrl}/api/v1/recognition/${endpoint}`, {
      method,
      headers: {
        'x-api-key': apiKey,
        ...(typeof body === 'object' && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {})
      },
      body: body instanceof FormData ? body : JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'CompreFace request failed');
    }

    return response.json();
  };

  return {
    /**
     * Registers a new face for a subject (username)
     */
    async addFace(username: string, imageBase64: string) {
      // CompreFace expects just the base64 part, or a file
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      return await request(`subjects/${username}/faces`, 'POST', {
        file: base64Data
      });
    },

    /**
     * Recognizes a face from an image and returns the most likely subject
     */
    async recognize(imageBase64: string) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      const result = await request('recognize', 'POST', {
        file: base64Data
      });
      
      // CompreFace returns an array of detections
      if (result.result && result.result.length > 0) {
        const detection = result.result[0];
        const subject = detection.subjects?.[0];
        
        if (subject && subject.similarity > 0.9) { // High confidence threshold
          return subject.subject;
        }
      }
      return null;
    },

    /**
     * Verifies if the face in the image matches the specific username
     */
    async verify(username: string, imageBase64: string) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      const result = await request(`recognize?limit=1&prediction_count=1`, 'POST', {
        file: base64Data
      });

      if (result.result && result.result.length > 0) {
        const detection = result.result[0];
        const match = detection.subjects?.find((s: any) => s.subject === username);
        
        if (match) {
          console.log(`CompreFace Match: ${username}, Similarity: ${match.similarity}`);
          return match.similarity > 0.85; // Standard threshold
        }
      }
      return false;
    }
  };
};
