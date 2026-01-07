
import { GoogleGenAI, Type } from "@google/genai";
import { ShadowConfig, ImageQuality } from "../types";
import { STYLE_PRESETS } from "../constants";

const getLightSourceDescription = (angle: number, elevation: number) => {
  const normalizedAngle = ((angle % 360) + 360) % 360;
  let direction = "";
  
  if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) direction = "directly from the front (top-down bias)";
  else if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) direction = "from the top-right";
  else if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) direction = "from the right side";
  else if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) direction = "from the bottom-right";
  else if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) direction = "from the bottom";
  else if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) direction = "from the bottom-left";
  else if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) direction = "from the left side";
  else if (normalizedAngle >= 292.5 && normalizedAngle < 337.5) direction = "from the top-left";

  const heightDesc = elevation > 75 ? "high overhead (zenith)" : 
                     elevation > 45 ? "moderate studio height" : 
                     elevation > 20 ? "low-angle side light" : "near-ground level";

  return `${direction} at a ${heightDesc} elevation (${elevation} degrees)`;
};

export const analyzeClothingItem = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  const mimeType = base64Image.match(/data:(.*?);/)?.[1] || 'image/png';

  const styleIds = STYLE_PRESETS.filter(s => !s.isCustom).map(s => s.id).join(', ');
  const prompt = `Analyze this clothing item photo. 
  1. Identify the specific type of clothing (e.g., Hoodie, Summer Dress, Leather Jacket).
  2. Identify the dominant color.
  3. Based on the item's style, recommend 3 background style IDs from this specific list: [${styleIds}].
  
  Return the analysis in Arabic for the text parts, but keep IDs in English.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clothingType: { type: Type.STRING, description: "Type of the clothing item in Arabic" },
            dominantColor: { type: Type.STRING, description: "Dominant color in Arabic" },
            recommendedIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of 3 recommended style IDs from the provided list"
            },
            advice: { type: Type.STRING, description: "Brief professional advice in Arabic regarding why these styles were chosen" }
          },
          required: ["clothingType", "dominantColor", "recommendedIds", "advice"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
};

export const editImageWithGemini = async (
  base64Image: string,
  editPrompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const modelName = 'gemini-2.5-flash-image';
  const data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  const mimeType = base64Image.match(/data:(.*?);/)?.[1] || 'image/png';

  const systemInstruction = `You are a professional photo editor. 
  Task: ${editPrompt}.
  
  Instructions:
  - Apply the requested changes while strictly preserving the identity and details of the central product/clothing item.
  - Maintain the original quality and resolution as much as possible.
  - If the user asks to "remove" something, cleanly fill the space with a natural continuation of the background.
  - If the user asks for a "filter", apply it realistically to the whole scene.
  - Return only the resulting image.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { data, mimeType } }
        ]
      },
      config: {
        systemInstruction: systemInstruction
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("لم يتم استلام أي بيانات من النموذج.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("لم يتم العثور على صورة في استجابة النموذج.");
  } catch (error: any) {
    console.error("Gemini Editing Error:", error);
    if (error?.message?.includes('429')) throw new Error("تجاوزت حد الطلبات. حاول لاحقاً.");
    if (error?.message?.includes('safety')) throw new Error("تم حجب المحتوى لدواعي السلامة.");
    throw new Error(error?.message || "فشل تعديل الصورة.");
  }
};

export const generateBackgroundVariation = async (
  base64Image: string,
  stylePrompt: string,
  shadowConfig: ShadowConfig,
  padding: number = 10,
  quality: ImageQuality = 'standard',
  autoLighting: boolean = false
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const modelName = 'gemini-2.5-flash-image';
  const data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  const mimeType = base64Image.match(/data:(.*?);/)?.[1] || 'image/png';

  const intensityDesc = shadowConfig.intensity > 70 ? 'strong, dark, and highly defined' : shadowConfig.intensity > 30 ? 'moderate and natural' : 'very subtle, soft and faint';
  const softnessDesc = shadowConfig.softness > 70 ? 'highly diffused with extremely blurry feathered edges' : shadowConfig.softness > 30 ? 'soft-box style with realistic fall-off' : 'sharper and more direct';
  const distanceDesc = shadowConfig.shadowDistance > 70 ? 'elongated and cast far from the base' : shadowConfig.shadowDistance > 30 ? 'moderately sized' : 'tight and close to the product base';
  const spreadDesc = shadowConfig.spread > 70 ? 'broad and wide-reaching shadow footprint' : shadowConfig.spread > 30 ? 'balanced and natural shadow area' : 'narrow, focused and tight shadow area';
  const lightSourcePos = getLightSourceDescription(shadowConfig.lightAngle, shadowConfig.elevation);

  const qualityPrompts = {
    standard: "Clean professional studio photography style, standard e-commerce resolution. Sharp edges and realistic lighting.",
    high: "High-resolution professional commercial photography, enhanced details, vivid fabric textures, and premium balanced studio lighting. Very crisp output.",
    ultra: "Masterpiece quality commercial photography, hyper-realistic 8k details, razor-sharp textures, cinematic lighting depth, high-end fashion magazine level polish. Flawless pixel-perfect integration."
  };

  const shadowInstruction = autoLighting 
    ? `SMART LIGHTING & SHADOWS: 
      - Analyze the generated background scene and automatically synthesize a professional 3-point lighting setup (key, fill, and rim light).
      - Ensure the color temperature and light intensity on the product perfectly match the environment.
      - Generate physically accurate contact shadows and cast shadows based on the inferred light sources in the scene.
      - Highlights and reflections on the product must reflect the environment for a seamless composite.`
    : `LIGHTING & SHADOWS: 
      - Primary light source position: ${lightSourcePos}.
      - Shadow Intensity: ${intensityDesc}.
      - Shadow Softness: ${softnessDesc}.
      - Shadow Extension/Length: ${distanceDesc}.
      - Shadow Spread/Width: ${spreadDesc}.
      - Vertical Light Elevation: ${shadowConfig.elevation} degrees.
      - Add a physically accurate contact shadow and cast shadow matching these parameters.`;

  const systemInstruction = `Professional product photo background replacement and lighting simulation expert. 
  
  PRODUCT INTEGRITY:
  Keep the clothing item in the foreground EXACTLY the same in every detail: color, fabric texture, stitching, logo, shape, and size. 
  Maintain original aspect ratio.
  
  QUALITY & STYLE:
  - Render Style: ${qualityPrompts[quality]}
  
  FINAL TOUCHES:
  Clean background removal with pixel-perfect smooth edges. No halo effects. High-end e-commerce ready.`;

  const userPrompt = `COMPOSITION:
  - Add a padding of approximately ${padding}% around the product to give it breathing room.
  - The background should be: ${stylePrompt}.
  
  ${shadowInstruction}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: userPrompt }
        ]
      },
      config: {
        systemInstruction: systemInstruction
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("لم يتم استلام أي بيانات من النموذج.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("لم يتم العثور على صورة في استجابة النموذج.");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    if (error?.message?.includes('429')) throw new Error("تجاوزت حد الطلبات. حاول لاحقاً.");
    if (error?.message?.includes('safety')) throw new Error("تم حجب المحتوى لدواعي السلامة.");
    throw new Error(error?.message || "فشل توليد الصورة.");
  }
};
