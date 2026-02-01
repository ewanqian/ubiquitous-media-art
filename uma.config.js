// UMA项目配置文件
// 遵循UMA-502: 云原生创作栈规范

module.exports = {
  // 项目元数据
  metadata: {
    name: "泛在媒体艺术框架",
    version: "0.1.0-alpha",
    description: "开源框架，用于创作和实践泛在媒体艺术",
    license: "Dual: CC BY-SA 4.0 & MIT",
    repository: "https://github.com/ewanqian/ubiquitous-media-art",
    keywords: ["ubiquitous-media", "generative-art", "ai-art", "real-time", "immersive"]
  },

  // UMA概念映射
  concepts: {
    core: ["UMA-001", "UMA-002", "UMA-003", "UMA-004"],
    practices: ["UMA-201", "UMA-202", "UMA-203", "UMA-204"],
    aesthetics: ["UMA-301", "UMA-302", "UMA-303", "UMA-304"]
  },

  // 技术栈配置
  techStack: {
    // 前端技术
    frontend: {
      frameworks: ["React", "Vue", "Svelte", "Plain JS"],
      visualization: ["Three.js", "D3.js", "P5.js", "Canvas API"],
      ui: ["Tailwind CSS", "Material-UI", "自定义样式"]
    },

    // 后端/云服务
    backend: {
      compute: ["AWS Lambda", "Cloudflare Workers", "Vercel Functions"],
      database: ["Firebase", "Supabase", "MongoDB Atlas"],
      storage: ["AWS S3", "Cloudflare R2", "IPFS"],
      realtime: ["Socket.io", "WebRTC", "Pusher"]
    },

    // AI/ML服务
    ai: {
      text: ["OpenAI GPT", "Claude", "本地LLM"],
      image: ["Stable Diffusion", "DALL-E", "Midjourney API"],
      audio: ["Google TTS", "ElevenLabs", "Riffusion"],
      video: ["Runway ML", "Pika Labs", "Sora API"]
    }
  },

  // 部署配置
  deployment: {
    platforms: ["Vercel", "Netlify", "GitHub Pages", "Cloudflare Pages"],
    domains: [".uma.art", ".ubimedia.art"],
    monitoring: ["Sentry", "LogRocket", "自定义指标"]
  },

  // 开发工具
  development: {
    ide: ["VS Code", "Cursor", "GitHub Codespaces"],
    packageManager: ["npm", "yarn", "pnpm"],
    testing: ["Jest", "Cypress", "Playwright"],
    docs: ["TypeDoc", "Docusaurus", "自定义生成器"]
  },

  // 社区配置
  community: {
    platforms: ["GitHub Discussions", "Discord", "Matrix"],
    languages: ["zh-CN", "en-US", "ja-JP"],
    contribution: {
      levels: ["beginner", "intermediate", "advanced", "expert"],
      areas: ["concepts", "code", "docs", "design", "community"]
    }
  },

  // 项目生成器选项
  generators: {
    templates: [
      {
        name: "basic-uma",
        description: "基础UMA项目，包含实时数据可视化",
        path: "./TEMPLATES/basic-uma"
      },
      {
        name: "ai-generative",
        description: "AI生成艺术项目，集成多模态模型",
        path: "./TEMPLATES/ai-generative"
      },
      {
        name: "immersive-web",
        description: "沉浸式Web体验，支持XR设备",
        path: "./TEMPLATES/immersive-web"
      }
    ]
  }
};

// 环境配置
const envConfig = {
  development: {
    apiEndpoints: {
      dataSources: "http://localhost:3000/api",
      aiServices: "http://localhost:3001",
      storage: "http://localhost:3002"
    },
    debug: true,
    logging: "verbose"
  },

  production: {
    apiEndpoints: {
      dataSources: "https://api.uma.art/v1",
      aiServices: "https://ai.uma.art/v1",
      storage: "https://storage.uma.art/v1"
    },
    debug: false,
    logging: "errors"
  }
};

// 导出配置
module.exports.getConfig = (env = 'development') => {
  const baseConfig = module.exports;
  const envSpecific = envConfig[env] || envConfig.development;

  return {
    ...baseConfig,
    environment: env,
    endpoints: envSpecific.apiEndpoints,
    debug: envSpecific.debug,
    logging: envSpecific.logging
  };
};
