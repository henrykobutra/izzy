// Define resume-related types in a central location

export type UploadState = 'idle' | 'checking-db' | 'uploading' | 'processing' | 'saving' | 'success' | 'error';

// Helper functions for type checking
export const isCheckingDb = (state: UploadState): state is 'checking-db' => state === 'checking-db';
export const isUploading = (state: UploadState): state is 'uploading' => state === 'uploading';
export const isProcessing = (state: UploadState): state is 'processing' => state === 'processing';
export const isSaving = (state: UploadState): state is 'saving' => state === 'saving';
export const isSuccess = (state: UploadState): state is 'success' => state === 'success';
export const isError = (state: UploadState): state is 'error' => state === 'error';
export const isIdle = (state: UploadState): state is 'idle' => state === 'idle';
