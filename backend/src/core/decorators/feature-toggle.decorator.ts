import { SetMetadata } from '@nestjs/common';

export const FEATURE_TOGGLE_KEY = 'feature_toggle';
export const FeatureToggle = (featureName: string) => SetMetadata(FEATURE_TOGGLE_KEY, featureName);
