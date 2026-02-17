/**
 * Onboarding steps by sign-up type. Scalable: add steps or new auth types here.
 * User journey: docs/user-journey/user-journey.md
 */

export type AuthType = 'email' | 'tiktok'

export type StepId = 'link_tiktok' | 'add_email' | 'request_onboarding'

export interface OnboardingStep {
  id: StepId
  order: number
  title: string
  message: string
  /** Short hint for popup or button. */
  hint: string
  /** Where to point the user: link_tiktok = /onboarding, add_email = open profile, request_onboarding = widget/button. */
  actionTarget: 'link_tiktok' | 'open_profile' | 'request_onboarding'
}

const EMAIL_USER_STEPS: OnboardingStep[] = [
  {
    id: 'link_tiktok',
    order: 1,
    title: 'Link your TikTok account',
    message: 'Connect your TikTok account so we can set up your earnings. This is required before we can start your onboarding.',
    hint: 'Click here to connect your TikTok account. You will be redirected to TikTok and then back here.',
    actionTarget: 'link_tiktok',
  },
  {
    id: 'request_onboarding',
    order: 2,
    title: 'Request onboarding',
    message: 'Once your TikTok is linked, request onboarding and our team will reach out to get you set up with your credentials.',
    hint: 'Click the button below to submit your request. An admin will contact you to complete setup.',
    actionTarget: 'request_onboarding',
  },
]

const TIKTOK_USER_STEPS: OnboardingStep[] = [
  {
    id: 'add_email',
    order: 1,
    title: 'Add your email address',
    message: 'We need a way to reach you and send your credentials. Add your email in your profile once; you can use it for account recovery and important updates.',
    hint: 'Open Settings and update your profile to add your email address.',
    actionTarget: 'open_profile',
  },
  {
    id: 'request_onboarding',
    order: 2,
    title: 'Request onboarding',
    message: 'With your email set, you can request onboarding. Our team will reach out to get you set up with your credentials.',
    hint: 'Click the button below to submit your request. An admin will contact you to complete setup.',
    actionTarget: 'request_onboarding',
  },
]

export function getOnboardingSteps(authType: AuthType): OnboardingStep[] {
  return authType === 'tiktok' ? [...TIKTOK_USER_STEPS] : [...EMAIL_USER_STEPS]
}

export function getCurrentOnboardingStep(
  authType: AuthType,
  hasTiktok: boolean,
  hasRealEmail: boolean,
  onboardingRequestedOrCompleted: boolean
): { step: OnboardingStep; index: number; total: number } | null {
  const steps = getOnboardingSteps(authType)
  if (authType === 'email') {
    if (!hasTiktok) return { step: steps[0], index: 0, total: steps.length }
    if (!onboardingRequestedOrCompleted) return { step: steps[1], index: 1, total: steps.length }
  } else {
    if (!hasRealEmail) return { step: steps[0], index: 0, total: steps.length }
    if (!onboardingRequestedOrCompleted) return { step: steps[1], index: 1, total: steps.length }
  }
  return null
}
