import { Translation } from '../locales/translations';

export const getFriendlyErrorMessage = (error: any, t: Translation): string => {
    const defaultMessage = t.errors.unexpected;
    if (typeof error?.message !== 'string') {
        return defaultMessage;
    }

    let message = error.message;

    if (message.startsWith('{')) {
        try {
            const parsedError = JSON.parse(message);
            const apiError = parsedError.error;

            if (apiError && apiError.message) {
                if (apiError.status === 'RESOURCE_EXHAUSTED' || apiError.code === 429) {
                    return t.errors.quotaExceeded;
                } else if (apiError.status === 'NOT_FOUND' || apiError.code === 404) {
                    return t.errors.modelNotFound;
                } else if (apiError.status === 'INVALID_ARGUMENT' || apiError.code === 400) {
                     return t.errors.invalidArgument;
                }
                
                return `Error: ${apiError.message} (Status: ${apiError.status || 'UNKNOWN'})`;
            }
        } catch (e) {
            // Not a valid JSON string, fall through to return the original message
        }
    }

    if (message.includes('API key not valid')) {
        return t.errors.invalidApiKeyGeneric;
    }
     if (message.includes('permission denied')) {
        return t.errors.permissionDeniedApiKey;
    }

    return message || defaultMessage;
};
