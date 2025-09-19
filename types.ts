export enum Tab {
  IMAGE_GENERATION = 'image-generation',
  VIDEO_GENERATION = 'video-generation',
  IMAGE_EDITING = 'image-editing',
}

export interface GenerateVideosOperation {
    name: string;
    done: boolean;
    response?: {
        generatedVideos?: Array<{
            video?: {
                uri: string;
            };
        }>;
    };
    error?: any;
    metadata?: any;
}