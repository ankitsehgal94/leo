import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { ArrowRight } from '@/components/ui/icons';
import { useUserStore } from '@/lib/stores';

const FEATURES = {
  free: [
    { text: 'Up to 3 habits', included: true },
    { text: 'Basic templates', included: true },
    { text: 'Daily journal', included: true },
    { text: '7-day progress view', included: true },
    { text: 'Unlimited habits', included: false },
    { text: 'All templates', included: false },
    { text: 'Advanced stats', included: false },
  ],
  premium: [
    { text: 'Unlimited habits', included: true },
    { text: 'All templates', included: true },
    { text: 'Daily journal', included: true },
    { text: '7-day progress view', included: true },
    { text: 'Advanced stats', included: true },
    { text: 'Priority support', included: true },
    { text: 'Early access to features', included: true },
  ],
};

export default function Paywall(): React.ReactElement {
  const router = useRouter();
  const setPremium = useUserStore.use.setPremium();
  const [selectedPlan, setSelectedPlan] = React.useState<'monthly' | 'yearly'>(
    'yearly'
  );

  const handlePurchase = (): void => {
    Alert.alert('Purchase Premium', 'This is a stub for in-app purchase.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Activate (Dev)',
        onPress: () => {
          setPremium(true);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <FocusAwareStatusBar />
      <PaywallHeader onBack={() => router.back()} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <HeroSection />
        <PlanSelection selectedPlan={selectedPlan} onSelect={setSelectedPlan} />
        <FeaturesComparison />
        <CTASection
          selectedPlan={selectedPlan}
          onPurchase={handlePurchase}
          onDismiss={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function PaywallHeader({ onBack }: { onBack: () => void }): React.ReactElement {
  return (
    <View className="flex-row items-center border-b border-neutral-100 px-4 py-3">
      <Pressable onPress={onBack} className="mr-4">
        <View className="rotate-180">
          <ArrowRight color="#737373" />
        </View>
      </Pressable>
      <Text className="flex-1 text-lg font-semibold text-neutral-800">
        Go Premium
      </Text>
    </View>
  );
}

function HeroSection(): React.ReactElement {
  return (
    <View className="items-center px-6 pt-8">
      <View className="size-20 items-center justify-center rounded-full bg-primary-100">
        <Text className="text-4xl">🐱✨</Text>
      </View>
      <Text className="mt-4 text-2xl font-bold text-neutral-800">
        Unlock Your Full Potential
      </Text>
      <Text className="mt-2 text-center text-base text-neutral-500">
        Get unlimited habits and premium features to build lasting routines
      </Text>
    </View>
  );
}

type PlanSelectionProps = {
  selectedPlan: 'monthly' | 'yearly';
  onSelect: (plan: 'monthly' | 'yearly') => void;
};

function PlanSelection({
  selectedPlan,
  onSelect,
}: PlanSelectionProps): React.ReactElement {
  return (
    <View className="mt-8 flex-row px-4">
      <PlanCard
        type="monthly"
        price="$4.99"
        period="/month"
        isSelected={selectedPlan === 'monthly'}
        onSelect={() => onSelect('monthly')}
      />
      <View className="w-3" />
      <PlanCard
        type="yearly"
        price="$39.99"
        period="/year"
        isSelected={selectedPlan === 'yearly'}
        onSelect={() => onSelect('yearly')}
        badge="SAVE 33%"
      />
    </View>
  );
}

type PlanCardProps = {
  type: string;
  price: string;
  period: string;
  isSelected: boolean;
  onSelect: () => void;
  badge?: string;
};

function PlanCard({
  type,
  price,
  period,
  isSelected,
  onSelect,
  badge,
}: PlanCardProps): React.ReactElement {
  return (
    <Pressable
      onPress={onSelect}
      className={`flex-1 rounded-xl border-2 p-4 ${
        isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'border-neutral-200 bg-white'
      }`}
    >
      {badge && (
        <View className="absolute -top-2 right-2 rounded-full bg-success-500 px-2 py-0.5">
          <Text className="text-xs font-semibold text-white">{badge}</Text>
        </View>
      )}
      <Text className="text-center text-sm capitalize text-neutral-500">
        {type}
      </Text>
      <Text className="mt-1 text-center text-2xl font-bold text-neutral-800">
        {price}
      </Text>
      <Text className="text-center text-xs text-neutral-400">{period}</Text>
    </Pressable>
  );
}

function FeaturesComparison(): React.ReactElement {
  return (
    <View className="mt-8 px-4">
      <Text className="mb-4 text-center text-sm font-semibold text-neutral-500">
        WHAT YOU GET
      </Text>
      <View className="flex-row">
        <FeatureColumn
          title="Free"
          features={FEATURES.free}
          isPremium={false}
        />
        <View className="w-3" />
        <FeatureColumn
          title="Premium ✨"
          features={FEATURES.premium}
          isPremium={true}
        />
      </View>
    </View>
  );
}

type FeatureColumnProps = {
  title: string;
  features: { text: string; included: boolean }[];
  isPremium: boolean;
};

function FeatureColumn({
  title,
  features,
  isPremium,
}: FeatureColumnProps): React.ReactElement {
  return (
    <View
      className={`flex-1 rounded-xl p-4 ${
        isPremium ? 'border-2 border-primary-500 bg-white' : 'bg-neutral-100'
      }`}
    >
      <Text
        className={`mb-3 text-center font-semibold ${isPremium ? 'text-primary-600' : 'text-neutral-600'}`}
      >
        {title}
      </Text>
      {features.map((feature, index) => (
        <View key={index} className="mb-2 flex-row items-center">
          <Text
            className={
              feature.included ? 'text-success-500' : 'text-neutral-300'
            }
          >
            {feature.included ? '✓' : '✗'}
          </Text>
          <Text
            className={`ml-2 text-xs ${feature.included ? 'text-neutral-700' : 'text-neutral-400'}`}
          >
            {feature.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

type CTASectionProps = {
  selectedPlan: 'monthly' | 'yearly';
  onPurchase: () => void;
  onDismiss: () => void;
};

function CTASection({
  selectedPlan,
  onPurchase,
  onDismiss,
}: CTASectionProps): React.ReactElement {
  const priceText = selectedPlan === 'monthly' ? '$4.99/mo' : '$39.99/yr';
  return (
    <View className="mt-8 px-4 pb-8">
      <Pressable
        onPress={onPurchase}
        className="rounded-2xl bg-primary-500 px-6 py-4"
      >
        <Text className="text-center text-lg font-semibold text-white">
          Start Premium - {priceText}
        </Text>
      </Pressable>
      <Pressable onPress={onDismiss} className="mt-4 py-2">
        <Text className="text-center text-neutral-500">Maybe later</Text>
      </Pressable>
      <Text className="mt-4 text-center text-xs text-neutral-400">
        Cancel anytime. Subscription auto-renews until cancelled.
      </Text>
    </View>
  );
}
