import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, TextInput } from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';
import { useUserStore } from '@/lib/stores';

type OnboardingStep = 'welcome' | 'preferences' | 'name';

const PREFERENCES = [
  { id: 'morning', label: 'Morning Routine', emoji: '☀️' },
  { id: 'health', label: 'Health & Fitness', emoji: '💪' },
  { id: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { id: 'sleep', label: 'Better Sleep', emoji: '😴' },
  { id: 'productivity', label: 'Productivity', emoji: '📈' },
  { id: 'selfcare', label: 'Self-Care', emoji: '💆' },
];

export default function Onboarding(): React.ReactElement {
  const [, setIsFirstTime] = useIsFirstTime();
  const setUserName = useUserStore.use.setUserName();
  const router = useRouter();

  const [step, setStep] = React.useState<OnboardingStep>('welcome');
  const [selectedPrefs, setSelectedPrefs] = React.useState<string[]>([]);
  const [name, setName] = React.useState('');

  const handleTogglePref = (id: string): void => {
    setSelectedPrefs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleComplete = (): void => {
    if (name.trim()) setUserName(name.trim());
    setIsFirstTime(false);
    router.replace('/(app)');
  };

  const handleSkip = (): void => {
    setIsFirstTime(false);
    router.replace('/(app)');
  };

  const handleNext = (): void => {
    if (step === 'welcome') setStep('preferences');
    else if (step === 'preferences') setStep('name');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <FocusAwareStatusBar />
      <SkipButton onSkip={handleSkip} />
      <ProgressDots currentStep={step} />
      <View className="flex-1 justify-center px-6">
        {step === 'welcome' && <WelcomeStep />}
        {step === 'preferences' && (
          <PreferencesStep
            selectedPrefs={selectedPrefs}
            onToggle={handleTogglePref}
          />
        )}
        {step === 'name' && <NameStep name={name} setName={setName} />}
      </View>
      <BottomButton
        step={step}
        name={name}
        onNext={handleNext}
        onComplete={handleComplete}
      />
    </SafeAreaView>
  );
}

function SkipButton({ onSkip }: { onSkip: () => void }): React.ReactElement {
  return (
    <View className="absolute right-4 top-16 z-10">
      <Pressable onPress={onSkip} className="px-4 py-2">
        <Text className="text-neutral-500">Skip</Text>
      </Pressable>
    </View>
  );
}

function ProgressDots({
  currentStep,
}: {
  currentStep: OnboardingStep;
}): React.ReactElement {
  return (
    <View className="mt-4 flex-row justify-center">
      {(['welcome', 'preferences', 'name'] as const).map((s) => (
        <View
          key={s}
          className={`mx-1 size-2 rounded-full ${
            s === currentStep ? 'bg-primary-500' : 'bg-neutral-200'
          }`}
        />
      ))}
    </View>
  );
}

function WelcomeStep(): React.ReactElement {
  return (
    <View className="items-center">
      <View className="mb-8 size-40 items-center justify-center rounded-full bg-primary-50">
        <Text className="text-7xl">🐱</Text>
      </View>
      <Text className="text-center text-3xl font-bold text-neutral-800">
        Welcome to Leo
      </Text>
      <Text className="mt-4 text-center text-lg text-neutral-500">
        Your friendly cat companion for building daily habits
      </Text>
      <Text className="mt-6 text-center text-base text-neutral-400">
        Small steps lead to big changes.{'\n'}Let&apos;s start your journey
        together.
      </Text>
    </View>
  );
}

type PreferencesStepProps = {
  selectedPrefs: string[];
  onToggle: (id: string) => void;
};

function PreferencesStep({
  selectedPrefs,
  onToggle,
}: PreferencesStepProps): React.ReactElement {
  return (
    <View>
      <Text className="text-center text-2xl font-bold text-neutral-800">
        What matters most to you?
      </Text>
      <Text className="mt-2 text-center text-neutral-500">
        Select what you would like to focus on (optional)
      </Text>
      <View className="mt-8 flex-row flex-wrap justify-center">
        {PREFERENCES.map((pref) => (
          <Pressable
            key={pref.id}
            onPress={() => onToggle(pref.id)}
            className={`m-1.5 rounded-2xl px-4 py-3 ${
              selectedPrefs.includes(pref.id) ? 'bg-primary-500' : 'bg-white'
            }`}
          >
            <Text
              className={`text-center ${
                selectedPrefs.includes(pref.id)
                  ? 'text-white'
                  : 'text-neutral-700'
              }`}
            >
              {pref.emoji} {pref.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function NameStep({
  name,
  setName,
}: {
  name: string;
  setName: (name: string) => void;
}): React.ReactElement {
  return (
    <View className="items-center">
      <Text className="text-6xl">👋</Text>
      <Text className="mt-6 text-center text-2xl font-bold text-neutral-800">
        What should we call you?
      </Text>
      <Text className="mt-2 text-center text-neutral-500">
        This helps personalize your experience
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor="#A3A3A3"
        className="mt-8 w-full rounded-2xl bg-white px-6 py-4 text-center text-xl text-neutral-800"
        autoFocus
        autoCapitalize="words"
      />
    </View>
  );
}

type BottomButtonProps = {
  step: OnboardingStep;
  name: string;
  onNext: () => void;
  onComplete: () => void;
};

function BottomButton({
  step,
  name,
  onNext,
  onComplete,
}: BottomButtonProps): React.ReactElement {
  const isNameStep = step === 'name';
  const buttonText = isNameStep
    ? name.trim()
      ? `Let\u0027s go, ${name.trim()}!`
      : 'Let\u0027s go!'
    : 'Continue';

  return (
    <View className="px-6 pb-8">
      <Pressable
        onPress={isNameStep ? onComplete : onNext}
        className="rounded-2xl bg-primary-500 py-4"
      >
        <Text className="text-center text-lg font-semibold text-white">
          {buttonText}
        </Text>
      </Pressable>
    </View>
  );
}
