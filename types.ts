
export type AgentType = 
  | 'Director' | 'Meta-Prompt Translator' | 'Consensus Judge' | 'Scriptwriter' | 'Visual Scout'
  | 'Anatomy Specialist' | 'Texture Master' | 'Lighting Architect'
  | 'Anatomy Critic' | 'Luminance Critic' | 'Epidermal Specialist'
  | 'Lens Specialist' | 'Composition Analyst'
  | 'Neural Alchemist' | 'Latent Optimizer'
  | 'Puppeteer Agent' | 'Pose Extractor' | 'IK Solver'
  | 'Temporal Architect' | 'Motion Sculptor' | 'Fluidity Critic'
  | 'Identity Guard' | 'Visual Quality Judge' | 'Visual Archivist'
  | 'Digital DNA Curator' | 'Noise & Geometry Critic'
  | 'VAE Agent' | 'Texture Artist' | 'Lighting Lead' | 'Rigging Supervisor'
  | 'Surgical Repair Specialist' | 'Garment Architect' | 'Material Physicist'
  | 'Perspective Architect' | 'Gravity Analyst'
  | 'Style Transfer Specialist' | 'Chromatic Aberration Manager' | 'Lighting Harmonizer'
  | 'Semantic Router' | 'Vault Prioritizer'
  | 'Identity Anchor Manager' | 'Fabric Tension Analyst'
  | 'Spatial Synchronizer' | 'Vanishing Point Analyst'
  | 'Master Colorist' | 'Ray-Trace Agent' | 'Aesthetic Critic'
  | 'Vault Kernel' | 'Heuristic Optimizer'
  | 'Attribute Mapper' | 'Schema Validator'
  | 'Physics Analyst' | 'Shadow Projectionist' | 'Collision Engine'
  | 'Grading Specialist' | 'Chroma Manager' | 'Frequency Analyst';

export type VaultDomain = 'X' | 'Y' | 'Z' | 'L';

export type ComponentType = 'PEP' | 'POP' | 'POV' | 'AMB' | 'VID' | 'GAR' | 'PHYS' | 'STYLE' | 'LIGHT';

export type ProcessingSpeed = 'Fast' | 'Balanced' | 'Deliberate' | 'Debug';

export type WarpMethod = 'affine' | 'thin_plate' | 'deformation';

export interface VisualAnchor {
  primary_color: string;
  light_direction: string;
  focal_length: string;
}

export interface LatentGrading {
  brightness: number; // Exposure
  contrast: number;   // Dynamic Range
  saturation: number; // Chroma Density
  sharpness: number;  // Z-Frequency
  blur: number;       // Atmospheric Haze
  hueRotate: number;  // Color Temp Shift
  sepia: number;      // Warmth/Vintage factor
  preset_name: string;
  css_filter_string: string;
}

export interface PoseSkeleton {
  keypoints: any[];
}

export interface PoseData {
  imageUrl: string;
  strength: number;
  symmetry_strength?: number;
  rigid_integrity?: number;
  preserveIdentity?: boolean;
  enabled: boolean;
  warpMethod: WarpMethod;
  dna?: CategorizedDNA;
  technicalDescription?: string;
}

export interface CategorizedDNA {
  dna_token?: string;
  character: string;
  pose: string;
  environment: string;
  technical_tags: string[];
  specs?: Record<string, string | number>; 
  spatial_metadata?: {
    horizon_line: number;
    vanishing_points: [number, number][];
    camera_angle: 'Low' | 'Eye-Level' | 'High' | 'Bird-Eye';
    ground_plane_y: number;
  };
  aesthetic_dna?: {
    film_grain: number;
    bokeh_depth: number;
    color_grading: string;
    lighting_setup: string;
    photon_coherence: number;
  };
}

export interface LatentParams {
  z_anatomy: number;
  z_structure: number; 
  z_lighting: number;  
  z_texture: number;
  z_garment?: number; 
  z_physics?: number;
  z_style?: number;
  hz_range: string;
  structural_fidelity: number;
  scale_factor: number;
  dna_type?: ComponentType;
  vault_domain?: VaultDomain;
  manifest?: any;
  pose_control?: PoseData;
  processing_speed?: ProcessingSpeed;
  dna?: CategorizedDNA;
  auto_tune_active?: boolean;
  active_slots?: {
    X: string | null;
    Y: string | null;
    Z: string | null;
    L: string | null;
  };
  neural_metrics: {
    loss_mse: number;
    ssim_index: number;
    tensor_vram: number;
    iteration_count: number;
    consensus_score: number;
    realism_score?: number;
    visual_critique?: string;
    qc_verdict?: 'APPROVED' | 'REPROVADO';
    qc_checklist?: Record<string, boolean>;
    identity_drift?: number;
    mesh_tension?: number;
    gravity_stability?: number;
    spectral_coherence?: number;
    semantic_match_score?: number;
    scout_diversity?: number;
    identity_lock_status?: number;
    spatial_sync_score?: number;
    aesthetic_score?: number;
    photon_accuracy?: number;
    vault_affinity_score?: number;
    projection_coherence?: number;
    physics_report?: string; 
  };
}

export interface VaultItem {
  id: string;
  shortId: string;
  name: string; 
  imageUrl: string;
  originalImageUrl: string;
  prompt: string;
  agentHistory: AgentStatus[];
  params: LatentParams;
  rating: number;
  timestamp: number;
  dna?: CategorizedDNA;
  usageCount: number;
  neuralPreferenceScore: number;
  isFavorite: boolean;
  vaultDomain: VaultDomain;
  grading?: LatentGrading;
}

export interface AgentStatus {
  type: AgentType;
  status: 'idle' | 'processing' | 'completed' | 'error';
  message: string;
  timestamp: number;
  department?: string;
}

export interface ProcessResponse {
  imageUrl: string;
  videoUrl?: string;
  enhancedPrompt: string;
  logs: AgentStatus[];
  params: LatentParams;
  collision_logic?: string;
  consolidated_prompt?: string;
  groundingLinks?: { title: string; uri: string }[];
  pexels_query?: string;
  grading?: LatentGrading;
  visual_anchor?: VisualAnchor;
}

export interface ScoutCandidate {
  id: string;
  title: string;
  source_layer: string;
  quality_metrics: {
    technical: number;
    aesthetic: number;
  };
  composite_score: number;
  votes: {
    agent: string;
    score: number;
    critique: string;
  }[];
  dna_preview: {
    z_anatomy?: number;
    z_structure?: number;
    z_lighting?: number;
    z_texture?: number;
  };
}

export interface ScoutData {
  candidates: ScoutCandidate[];
  consensus_report: string;
  winner_id: string;
  search_stats: {
    premium_hits: number;
    internal_hits: number;
  };
}

export interface FusionManifest {
  pep_id: string;
  pop_id: string;
  pov_id: string;
  amb_id: string;
  weights: {
    pep: number;
    pop: number;
    pov: number;
    amb: number;
  };
  style_modifiers: string[];
  surgicalSwap: boolean;
  fusionIntent: string;
  protectionStrength: number;
}
