export const translations = {
  my: {
    header: {
      subtitle: "AI ဖြင့် ပုံများနှင့် ဗီဒီယိုများ ဖန်တီးရန်",
    },
    tabs: {
      imageGeneration: "ပုံ ဖန်တီးရန်",
      imageEditing: "ပုံ ပြင်ဆင်ရန်",
      videoGeneration: "ဗီဒီယို ဖန်တီးရန်",
    },
    apiKeyManager: {
      title: "သင်၏ Gemini API Key ကိုထည့်ပါ",
      description: "ဤအပလီကေးရှင်းကိုအသုံးပြုရန်၊ သင်၏ Google Gemini API key ကို ထည့်သွင်းပေးပါ။ အသုံးပြုနိုင်မလားဆိုတာ စစ်ဆေးပေးပါမည်။",
      placeholder: "သင်၏ API key ကို ဤနေရာတွင် ကူးထည့်ပါ",
      getApiKeyText: {
        part1: "သင်၏ API key ကို ",
        part2: " မှ ရယူနိုင်ပါသည်။",
      },
    },
    common: {
      promptLabel: "သင်၏ စိတ်ကူး (Prompt)",
      negativePromptLabel: "အရာများ မပါဝင်စေချင် (Negative Prompt)",
      negativePromptPlaceholder: "e.g., blurry, low quality, text, watermark",
      aspectRatioLabel: "ပုံ အချိုး",
      aspectRatioLandscape: "Landscape",
      aspectRatioPortrait: "Portrait",
      modelLabel: "Model",
      imageUploadLabel: "ပုံထည့်သွင်းရန် (Image Upload)",
      yourImage: "သင်၏ ပုံ",
      errorPromptRequired: "ကျေးဇူးပြု၍ prompt တစ်ခုထည့်ပါ။",
    },
    imageGenerator: {
      promptPlaceholder: "e.g., A robot holding a red skateboard.",
      generateButton: "ပုံ ဖန်တီးမည်",
      generatingButton: "ပုံ ဖန်တီးနေသည်...",
      loadingMessage: "သင်၏ ပုံကို ဖန်တီးနေသည်...",
      generatedImageTitle: "ဖန်တီးပြီး ပုံ",
      editPromptButton: "Prompt ကို ပြန်ပြင်မည်",
      downloadButton: "ပုံကို Download ရယူမည်",
    },
    imageEditor: {
      originalImageLabel: "မူရင်းပုံ",
      promptLabel: "ပြင်ဆင်ရန် ညွှန်ကြားချက် (Prompt)",
      promptPlaceholder: "e.g., add a llama next to the main subject",
      editButton: "ပုံ ပြင်မည်",
      editingButton: "ပုံ ပြင်နေသည်...",
      loadingMessage: "သင်၏ တီထွင်ဖန်တီးမှုများကို ပြင်ဆင်နေသည်...",
      originalTitle: "မူရင်း",
      editedTitle: "ပြင်ဆင်ပြီး",
      downloadButton: "ပြင်ဆင်ပြီး ပုံကို Download ရယူမည်",
      errorPromptAndImageRequired: "ကျေးဇူးပြု၍ ပုံနှင့် ပြင်ဆင်ရန် prompt နှစ်ခုလုံးကို ထည့်ပါ။",
      errorNoImageReturned: "Model မှ ပြင်ဆင်ပြီး ပုံကို ပြန်မပို့ခဲ့ပါ။",
    },
    videoGenerator: {
      promptPlaceholder: "e.g., A neon hologram of a cat driving at top speed",
      extendButton: "ဗီဒီယို ဆက်ရန် (Extend Video)",
      generateButton: "ဗီဒီယို ဖန်တီးမည်",
      generatingButton: "ဗီဒီယို ဖန်တီးနေသည်...",
      generatedVideoTitle: "ဖန်တီးပြီး ဗီဒီယို",
      downloadButton: "ဗီဒီယိုကို Download ရယူမည်",
      loadingMessages: [
        "ဒါရိုက်တာနေရာကို အသင့်ပြင်နေသည်...",
        "အကောင်းဆုံး ပုံထွက်အောင် ဖန်တီးနေသည်...",
        "AI ကို သရုပ်ဆောင်နည်း သင်ပေးနေသည်...",
        "နောက်ဆုံး အဆင့် ဖန်တီးနေသည်၊ ခဏစောင့်ပါ...",
        "သင်၏ ရုပ်ရှင်ကို အပြီးသတ်နေသည်...",
      ],
      errorNoUri: "ဗီဒီယိုဖန်တီးမှု ပြီးဆုံးသော်လည်း video URI ကို ရှာမတွေ့ပါ။",
      errorNoExtend: "ဆက်ရန် ဗီဒီယို မရှိပါ။",
    },
    errors: {
      // API Key validation errors
      invalidApiKey: "သင်ထည့်သွင်းလိုက်သော API key သည် မမှန်ကန်ပါ။ ကျေးဇူးပြု၍ စစ်ဆေးပြီး ထပ်မံကြိုးစားပါ။",
      permissionDenied: "ခွင့်ပြုချက် ငြင်းပယ်ခံရသည်။ သင်၏ API key ကို Gemini API အတွက် ဖွင့်ထားကြောင်း သေချာပါစေ။",
      validationNetwork: "API key ကို အတည်မပြုနိုင်ပါ။ သင်၏ network ချိတ်ဆက်မှုကို စစ်ဆေးပါ။",
      invalidApiKeyDefault: "မမှန်ကန်သော API Key။ key ကိုစစ်ဆေးပြီး ထပ်မံကြိုးစားပါ။",
      
      // General API errors
      quotaExceeded: "Error: API quota ပြည့်သွားပါသည်။ ကျေးဇူးပြု၍ Google AI Studio တွင် သင်၏ account အခြေအနေနှင့် billing ကို စစ်ဆေးပါ။",
      modelNotFound: "Error: တောင်းဆိုထားသော model ကို ရှာမတွေ့ပါ။ သင်၏ API key သည် ဤ model ကို အသုံးပြုခွင့် မရှိနိုင်ပါ။ ကျေးဇူးပြု၍ Google AI Studio တွင် သင်၏ ခွင့်ပြုချက်များကို စစ်ဆေးပါ။",
      invalidArgument: "Error: မမှန်ကန်သော အချက်အလက်။ prompt သို့မဟုတ် upload လုပ်ထားသော ဖိုင်တွင် ပြဿနာရှိနိုင်သည်။ ကျေးဇူးပြု၍ သင်ထည့်သွင်းထားသည်ကို ပြန်လည်စစ်ဆေးပါ။",
      permissionDeniedApiKey: "Error: ခွင့်ပြုချက် ငြင်းပယ်ခံရသည်။ သင်၏ API key ကို Gemini API အတွက် ဖွင့်ထားကြောင်း သေချာပါစေ။",
      invalidApiKeyGeneric: "Error: သင်ထည့်သွင်းလိုက်သော API key သည် မမှန်ကန်ပါ။ ကျေးဇူးပြု၍ သင်၏ key ကို စစ်ဆေးပါ။",
      unexpected: "မမျှော်လင့်ထားသော အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်။ အသေးစိတ်အတွက် console ကို စစ်ဆေးပါ။",
    }
  },
  en: {
    header: {
      subtitle: "Create images and videos with AI",
    },
    tabs: {
      imageGeneration: "Create Image",
      imageEditing: "Edit Image",
      videoGeneration: "Create Video",
    },
    apiKeyManager: {
      title: "Enter Your Gemini API Key",
      description: "To use this application, please provide your Google Gemini API key. We'll validate it to ensure it's active.",
      placeholder: "Paste your API key here to begin",
      getApiKeyText: {
        part1: "You can get your API key from ",
        part2: ".",
      },
    },
    common: {
      promptLabel: "Your Prompt",
      negativePromptLabel: "Negative Prompt",
      negativePromptPlaceholder: "e.g., blurry, low quality, text, watermark",
      aspectRatioLabel: "Aspect Ratio",
      aspectRatioLandscape: "Landscape",
      aspectRatioPortrait: "Portrait",
      modelLabel: "Model",
      imageUploadLabel: "Image Upload",
      yourImage: "Your Image",
      errorPromptRequired: "Please enter a prompt.",
    },
    imageGenerator: {
      promptPlaceholder: "e.g., A robot holding a red skateboard.",
      generateButton: "Generate Image",
      generatingButton: "Generating Image...",
      loadingMessage: "Generating your image...",
      generatedImageTitle: "Generated Image",
      editPromptButton: "Edit Prompt",
      downloadButton: "Download Image",
    },
    imageEditor: {
      originalImageLabel: "Original Image",
      promptLabel: "Editing Instructions (Prompt)",
      promptPlaceholder: "e.g., add a llama next to the main subject",
      editButton: "Edit Image",
      editingButton: "Editing in Progress...",
      loadingMessage: "Applying your creative edits...",
      originalTitle: "Original",
      editedTitle: "Edited",
      downloadButton: "Download Edited Image",
      errorPromptAndImageRequired: "Please provide both an image and an editing prompt.",
      errorNoImageReturned: "The model did not return an edited image.",
    },
    videoGenerator: {
      promptPlaceholder: "e.g., A neon hologram of a cat driving at top speed",
      extendButton: "Extend Video",
      generateButton: "Generate Video",
      generatingButton: "Generating Video...",
      generatedVideoTitle: "Generated Video",
      downloadButton: "Download Video",
      loadingMessages: [
        "Preparing the director's chair...",
        "Rendering pixels into a masterpiece...",
        "Teaching the AI how to act...",
        "Finalizing the special effects, please wait...",
        "Your cinematic masterpiece is almost ready...",
      ],
      errorNoUri: "Video generation completed but no video URI was found.",
      errorNoExtend: "No video available to extend.",
    },
    errors: {
      // API Key validation errors
      invalidApiKey: "The provided API key is not valid. Please check and try again.",
      permissionDenied: "Permission denied. Please ensure your API key is enabled for the Gemini API.",
      validationNetwork: "Could not validate the API key. Please check your network connection.",
      invalidApiKeyDefault: "Invalid API Key. Please check the key and try again.",

      // General API errors
      quotaExceeded: "Error: API quota exceeded. Please check your account status and billing in Google AI Studio.",
      modelNotFound: "Error: The requested model was not found. Your API key might not have access to this model. Please check your permissions in Google AI Studio.",
      invalidArgument: "Error: Invalid argument. There might be an issue with the prompt or uploaded file. Please review your input.",
      permissionDeniedApiKey: "Error: Permission denied. Please ensure your API key is enabled for the Gemini API.",
      invalidApiKeyGeneric: "Error: The provided API key is not valid. Please verify your key.",
      unexpected: "An unexpected error occurred. Please check the console for details.",
    }
  }
};

export type Translation = typeof translations.en;
