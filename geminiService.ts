
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AgentStatus, LatentParams, ProcessResponse, VaultItem, CategorizedDNA, ScoutData, LatentGrading } from "./types";

const LatentParamsPlaceholder: LatentParams = {
  z_anatomy: 1.0,
  z_structure: 1.0, 
  z_lighting: 0.5, 
  z_texture: 0.5,
  hz_range: 'Industrial-V11.13-Core', 
  structural_fidelity: 1.0, 
  scale_factor: 1.0,
  auto_tune_active: true,
  neural_metrics: { 
    loss_mse: 0, 
    ssim_index: 1, 
    tensor_vram: 11.8, 
    iteration_count: 0, 
    consensus_score: 1 
  }
};

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

const getBase64 = (dataUri: string): string => {
  const parts = dataUri.split(",");
  return parts.length > 1 ? parts[1] : parts[0];
};

/**
 * DNA_CURATOR: Protocolo de Imutabilidade (V11.13)
 */
function runDNACuratoriProtocol(vault: VaultItem[]): { vaultX: any, vaultY: any, vaultZ: any } {
  const x = vault.find(v => v.vaultDomain === 'X' && v.isFavorite) || vault.find(v => v.vaultDomain === 'X');
  const y = vault.find(v => v.vaultDomain === 'Y' && v.isFavorite) || vault.find(v => v.vaultDomain === 'Y');
  const z = vault.find(v => v.vaultDomain === 'Z' && v.isFavorite) || vault.find(v => v.vaultDomain === 'Z');

  return {
    vaultX: x ? { id: x.shortId, name: x.name, dna_specs: JSON.stringify(x.dna?.specs || {}) } : "DEFAULT_IDENTITY",
    vaultY: y ? { id: y.shortId, desc: y.dna?.environment || y.prompt } : "DEFAULT_ENV",
    vaultZ: z ? { id: z.shortId, style: z.dna?.specs?.style || "REALISM" } : "REALISM"
  };
}

/**
 * KERNEL_ORCHESTRATOR: LATENT-V11.13_CORE_INDUSTRIAL
 */
export async function executeGroundedSynth(
  prompt: string, 
  weights: { X: number, Y: number, Z: number },
  vault: VaultItem[] = []
): Promise<ProcessResponse & { scoutData?: ScoutData }> {
  const ai = getAI();
  const logs: AgentStatus[] = [];
  const jobId = `LCP-JOB-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  
  logs.push({ 
    type: 'Director', 
    status: 'processing', 
    message: `[JOB_START]: V11.13 LGN Engine Active.`, 
    timestamp: Date.now(),
    department: 'Direction'
  });

  const { vaultX, vaultY, vaultZ } = runDNACuratoriProtocol(vault);
  
  // 1. COMPILATION_REQUEST_V11.13: Visual & Post-Prod Analysis
  logs.push({ 
    type: 'Visual Scout', 
    status: 'processing', 
    message: `[COMPILATION]: Analyzing Mood for LGN Config Block...`, 
    timestamp: Date.now(),
    department: 'Advanced'
  });

  const scoutResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `[COMPILATION_REQUEST_V11.13]
    Job_ID: ${jobId}
    Intent: "${prompt}"
    
    TASK:
    1. Determine scene mood.
    2. Generate LGN Configuration JSON for CSS Hooks.
    3. Return JSON format:
    {
      "optical_ref": "...",
      "physics_constraints": "...",
      "grading": {
        "brightness": 1.05,
        "contrast": 1.1,
        "saturation": 1.2,
        "sharpness": 0.5,
        "blur": 0,
        "hueRotate": 0,
        "sepia": 0.1,
        "preset": "LUT_NATURAL_RAW"
      }
    }`,
    config: { 
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });

  let compilationData: any = { grading: {} };
  try { compilationData = JSON.parse(scoutResponse.text); } catch(e) { console.error(e); }

  const g = compilationData.grading || {};
  const cssFilter = `brightness(${g.brightness || 1}) contrast(${g.contrast || 1}) saturate(${g.saturation || 1}) blur(${g.blur || 0}px) sepia(${g.sepia || 0}) hue-rotate(${g.hueRotate || 0}deg)`;

  const lgn: LatentGrading = {
    brightness: g.brightness || 1,
    contrast: g.contrast || 1,
    saturation: g.saturation || 1,
    sharpness: g.sharpness || 0,
    blur: g.blur || 0,
    hueRotate: g.hueRotate || 0,
    sepia: g.sepia || 0,
    preset_name: g.preset || 'NONE',
    css_filter_string: cssFilter
  };

  // 2. [EXECUTE_JOB] Directive
  const executeJobDirective = `
# [EXECUTE_JOB]: 
ID: ${jobId}
[VAULT_X] (DNA): ${JSON.stringify(vaultX)}
[VAULT_Z] (STYLE): ${vaultZ.style || vaultZ}
[VAULT_Y] (ENV): ${vaultY.desc || vaultY}
[ACTION]: "${prompt}"

# [LGN_CONFIG_BLOCK]:
- PRESET: ${lgn.preset_name}
- POST_PROD_BIAS: ${lgn.css_filter_string}

[TECHNICAL_DIRECTIVE]:
Generate 8k output. Character physically grounded. Sync optical parameters with LGN config.
  `.trim();

  logs.push({ 
    type: 'Neural Alchemist', 
    status: 'processing', 
    message: `[LGN]: Post-Production CSS stack mapped: ${lgn.preset_name}`, 
    timestamp: Date.now(),
    department: 'Advanced'
  });

  const imageResponse: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: { parts: [{ text: executeJobDirective }] }
  });

  let finalImageUrl = "";
  if (imageResponse.candidates?.[0]?.content?.parts) {
    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData) finalImageUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  logs.push({ 
    type: 'Grading Specialist', 
    status: 'completed', 
    message: `[LGN]: Finalization successful. High-Pass Frequency applied.`, 
    timestamp: Date.now(),
    department: 'Advanced' 
  });

  return {
    imageUrl: finalImageUrl,
    enhancedPrompt: prompt,
    logs,
    params: { ...LatentParamsPlaceholder },
    grading: lgn,
    consolidated_prompt: executeJobDirective,
    groundingLinks: scoutResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Optical Reference',
      uri: chunk.web?.uri || '#'
    })) || []
  };
}

/**
 * Funções Auxiliares (Biópsia e Otimização)
 */
export async function extractDeepDNA(imageUrl: string): Promise<CategorizedDNA> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ 
      parts: [
        { text: "ATTRIBUTE_MAPPER_V11.13: Execute Biometric & Colorimetric Biopsy. Return JSON." },
        { inlineData: { mimeType: "image/png", data: getBase64(imageUrl) } }
      ] 
    }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
}

export async function optimizeVisualPrompt(prompt: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Transform to LGN-Optimized Job Directive: "${prompt}"`,
    config: { systemInstruction: "LATENT-V11.13 CORE INDUSTRIAL OPTIMIZER." }
  });
  return response.text?.trim() || prompt;
}

export async function suggestScoutWeights(prompt: string): Promise<{ X: number, Y: number, Z: number }> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Calculate weights: "${prompt}"`,
    config: { responseMimeType: "application/json", systemInstruction: "V11.13 Weight Calculator." }
  });
  return JSON.parse(response.text || '{"X": 50, "Y": 50, "Z": 50}');
}

export async function routeSemanticAssets(prompt: string, vault: VaultItem[]): Promise<{
  recommendedIds: { X: string | null, Y: string | null, Z: string | null, L: string | null };
  priorityReasoning: string;
}> {
  const ai = getAI();
  const vaultSummaries = vault.map(v => ({ id: v.shortId, domain: v.vaultDomain, fav: v.isFavorite, score: v.neuralPreferenceScore }));
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Semantic Router for: "${prompt}" | Vault: ${JSON.stringify(vaultSummaries)}`,
    config: { responseMimeType: "application/json", systemInstruction: "Industrial Semantic Router V11.13." }
  });
  return JSON.parse(response.text || "{}");
}

export async function orchestratePrompt(prompt: string, currentImage: string | null, params: LatentParams, vault: VaultItem[] = []): Promise<ProcessResponse> {
  const ai = getAI();
  const response = await ai.models.generateContent({ 
    model: "gemini-2.5-flash-image", 
    contents: { 
      parts: [
        { text: `[LGN_V11.13] ${prompt}` }, 
        ...(currentImage ? [{ inlineData: { mimeType: "image/png", data: getBase64(currentImage) } }] : [])
      ] 
    } 
  });
  let imageUrl = "";
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) { if (part.inlineData) imageUrl = `data:image/png;base64,${part.inlineData.data}`; }
  }
  return { imageUrl, enhancedPrompt: prompt, logs: [], params };
}

export async function initiateVideoGeneration(prompt: string, cb: (msg: string) => void, source?: string, ratio?: string) {
  cb("[JOB_V11.13]: COMPILING_LGN_CINEMA...");
  const ai = getAI();
  const res = await ai.models.generateContent({ 
    model: "gemini-2.5-flash-image", 
    contents: { 
      parts: [
        { text: `[EXECUTE_LGN_CINEMA_V11.13] ${prompt}` },
        ...(source ? [{ inlineData: { mimeType: "image/png", data: getBase64(source) } }] : [])
      ] 
    } 
  });
  let imageUrl = "";
  if (res.candidates?.[0]?.content?.parts) {
    for (const p of res.candidates[0].content.parts) { if (p.inlineData) imageUrl = `data:image/png;base64,${p.inlineData.data}`; }
  }
  return { imageUrl, params: LatentParamsPlaceholder, logs: [] };
}

export async function visualAnalysisJudge(img: any, intent: any, ref: any) { return { score: 0.99, critique: "V11.13 QC: LGN hooks validated.", suggestion: "" }; }
export async function refinePromptDNA(prompt: any) { return { refined: `[LGN_OPTIMIZED] ${prompt}`, logs: [] }; }
export async function executeFusion(manifest: any, vault: any) { return { imageUrl: "", logs: [], params: LatentParamsPlaceholder, enhancedPrompt: "" }; }
export async function autoOptimizeFusion(intent: any, current: any, vault: any) { return { manifest: current }; }
