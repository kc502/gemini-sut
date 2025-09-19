import { Translation } from '../locales/translations';

export const getFriendlyErrorMessage = (error: any, t: Translation): string => {
    const defaultMessage = t.errors.unexpected;
    if (typeof error?.message !== 'string') {
        return defaultMessage;
    }

    const message = error.message;

    // Specific error messages from Gemini API
    if (message.includes('API key not valid')) {
        return t.errors.invalidApiKeyGeneric;
    }
    if (message.includes('permission denied')) {
        return t.errors.permissionDeniedApiKey;
    }
    if (/quota/i.test(message) || message.includes('RESOURCE_EXHAUSTED')) {
        return t.errors.quotaExceeded;
    }
    if (message.includes('model was not found')) {
        return t.errors.modelNotFound;
    }
    if (message.includes('Invalid argument')) {
        return t.errors.invalidArgument;
    }
    
    // Fallback to the original error message if it's not one of the known cases.
    return message || defaultMessage;
};
