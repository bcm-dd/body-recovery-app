import { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  YStack,
  XStack,
  Text,
  Card,
  H2,
  H3,
  Button,
  Circle,
  Separator,
} from 'tamagui';
import { ChevronLeft, ChevronRight, Clock, Check, X, Moon } from '@tamagui/lucide-icons';

import { useHaptics } from '@/hooks/useHaptics';

// Mock data for the week view
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DayPlan {
  date: Date;
  dayName: string;
  status: 'completed' | 'scheduled' | 'rest' | 'skipped' | 'today';
  session?: {
    id: string;
    title: string;
    duration: number;
    exerciseCount: number;
    focusAreas: string[];
  };
}

const generateWeekPlan = (): DayPlan[] => {
  const today = new Date();
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + diff);

  return DAYS_OF_WEEK.map((dayName, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);

    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today && !isToday;
    const isRestDay = index === 6; // Sunday is rest day

    let status: DayPlan['status'];
    if (isToday) {
      status = 'today';
    } else if (isRestDay) {
      status = 'rest';
    } else if (isPast) {
      status = Math.random() > 0.2 ? 'completed' : 'skipped';
    } else {
      status = 'scheduled';
    }

    const session = isRestDay
      ? undefined
      : {
          id: `session-${index}`,
          title: index % 2 === 0 ? 'Lower Back & Hip Recovery' : 'Upper Body Mobility',
          duration: 15 + Math.floor(Math.random() * 15),
          exerciseCount: 4 + Math.floor(Math.random() * 4),
          focusAreas: index % 2 === 0 ? ['Lower Back', 'Hips'] : ['Shoulders', 'Neck', 'Upper Back'],
        };

    return {
      date,
      dayName,
      status,
      session,
    };
  });
};

const STATUS_COLORS = {
  completed: '#22C55E',
  scheduled: '#3B82F6',
  rest: '#6B7280',
  skipped: '#EF4444',
  today: '#3B82F6',
};

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHaptics();
  const [weekPlan] = useState<DayPlan[]>(generateWeekPlan);
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(
    weekPlan.find((d) => d.status === 'today') || null
  );

  const handleDaySelect = useCallback(
    (day: DayPlan) => {
      triggerHaptic('selection');
      setSelectedDay(day);
    },
    [triggerHaptic]
  );

  const handlePreviousWeek = useCallback(() => {
    triggerHaptic('light');
    // Navigate to previous week
  }, [triggerHaptic]);

  const handleNextWeek = useCallback(() => {
    triggerHaptic('light');
    // Navigate to next week
  }, [triggerHaptic]);

  const getStatusIcon = (status: DayPlan['status']) => {
    switch (status) {
      case 'completed':
        return <Check size={14} color="white" />;
      case 'skipped':
        return <X size={14} color="white" />;
      case 'rest':
        return <Moon size={14} color="white" />;
      default:
        return null;
    }
  };

  const currentWeekLabel = () => {
    const first = weekPlan[0]?.date;
    const last = weekPlan[6]?.date;
    if (!first || !last) return '';

    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${first.toLocaleDateString('en-US', formatOptions)} - ${last.toLocaleDateString('en-US', formatOptions)}`;
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: 16,
      }}
    >
      <YStack gap="$4">
        {/* Header */}
        <YStack gap="$1">
          <Text color="$colorHover" fontSize="$3">
            Weekly Schedule
          </Text>
          <H2>Plan</H2>
        </YStack>

        {/* Week Navigation */}
        <Card bordered padded>
          <XStack justifyContent="space-between" alignItems="center">
            <Button
              size="$3"
              circular
              icon={ChevronLeft}
              backgroundColor="transparent"
              onPress={handlePreviousWeek}
            />
            <Text fontWeight="600" fontSize="$4">
              {currentWeekLabel()}
            </Text>
            <Button
              size="$3"
              circular
              icon={ChevronRight}
              backgroundColor="transparent"
              onPress={handleNextWeek}
            />
          </XStack>
        </Card>

        {/* Week Calendar Grid */}
        <Card bordered padded>
          <XStack justifyContent="space-between">
            {weekPlan.map((day) => {
              const isSelected = selectedDay?.date.toDateString() === day.date.toDateString();
              const statusColor = STATUS_COLORS[day.status];

              return (
                <YStack
                  key={day.dayName}
                  alignItems="center"
                  gap="$2"
                  onPress={() => handleDaySelect(day)}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Text
                    fontSize="$2"
                    color={isSelected ? '$primary' : '$colorHover'}
                    fontWeight={isSelected ? '600' : '400'}
                  >
                    {day.dayName}
                  </Text>
                  <Circle
                    size={40}
                    backgroundColor={isSelected ? '$primary' : 'transparent'}
                    borderWidth={2}
                    borderColor={isSelected ? '$primary' : statusColor}
                  >
                    {day.status === 'today' && !isSelected ? (
                      <Circle size={8} backgroundColor="$primary" />
                    ) : (
                      <Text
                        color={isSelected ? 'white' : '$color'}
                        fontWeight="600"
                      >
                        {day.date.getDate()}
                      </Text>
                    )}
                  </Circle>
                  {day.status !== 'today' && day.status !== 'scheduled' && (
                    <Circle size={18} backgroundColor={statusColor}>
                      {getStatusIcon(day.status)}
                    </Circle>
                  )}
                </YStack>
              );
            })}
          </XStack>
        </Card>

        {/* Selected Day Detail */}
        {selectedDay && (
          <Card bordered padded elevate>
            <YStack gap="$4">
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text color="$colorHover" fontSize="$2">
                    {selectedDay.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <H3>
                    {selectedDay.status === 'rest'
                      ? 'Rest Day'
                      : selectedDay.session?.title || 'No Session'}
                  </H3>
                </YStack>
                <Circle
                  size={40}
                  backgroundColor={STATUS_COLORS[selectedDay.status]}
                  opacity={0.15}
                >
                  <Circle size={24} backgroundColor={STATUS_COLORS[selectedDay.status]}>
                    {getStatusIcon(selectedDay.status) || (
                      <Text color="white" fontSize="$2" fontWeight="700">
                        {selectedDay.status === 'today' ? 'T' : 'S'}
                      </Text>
                    )}
                  </Circle>
                </Circle>
              </XStack>

              {selectedDay.status === 'rest' ? (
                <YStack gap="$2">
                  <Text color="$colorHover">
                    Rest days are important for recovery. Your body needs time to repair and adapt.
                  </Text>
                  <Text color="$colorHover" fontSize="$2">
                    Consider light stretching or a walk if you feel up to it.
                  </Text>
                </YStack>
              ) : selectedDay.session ? (
                <>
                  <XStack gap="$6">
                    <XStack alignItems="center" gap="$2">
                      <Clock size={16} color="$colorHover" />
                      <Text color="$colorHover">{selectedDay.session.duration} min</Text>
                    </XStack>
                    <Text color="$colorHover">
                      {selectedDay.session.exerciseCount} exercises
                    </Text>
                  </XStack>

                  <Separator />

                  <YStack gap="$2">
                    <Text fontWeight="600" fontSize="$3">
                      Focus Areas
                    </Text>
                    <XStack flexWrap="wrap" gap="$2">
                      {selectedDay.session.focusAreas.map((area) => (
                        <YStack
                          key={area}
                          backgroundColor="$backgroundHover"
                          paddingHorizontal="$3"
                          paddingVertical="$1"
                          borderRadius="$2"
                        >
                          <Text fontSize="$2" color="$colorHover">
                            {area}
                          </Text>
                        </YStack>
                      ))}
                    </XStack>
                  </YStack>

                  {(selectedDay.status === 'today' || selectedDay.status === 'scheduled') && (
                    <>
                      <Separator />
                      <Button backgroundColor="$primary" color="white">
                        {selectedDay.status === 'today' ? 'Start Session' : 'Preview Session'}
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <Text color="$colorHover">No session scheduled for this day.</Text>
              )}
            </YStack>
          </Card>
        )}

        {/* Week Summary */}
        <Card bordered padded>
          <YStack gap="$3">
            <Text fontWeight="600" fontSize="$4">
              This Week
            </Text>
            <XStack justifyContent="space-around">
              <YStack alignItems="center">
                <Text fontSize="$7" fontWeight="700" color="$success">
                  {weekPlan.filter((d) => d.status === 'completed').length}
                </Text>
                <Text fontSize="$2" color="$colorHover">
                  Completed
                </Text>
              </YStack>
              <YStack alignItems="center">
                <Text fontSize="$7" fontWeight="700" color="$primary">
                  {weekPlan.filter((d) => d.status === 'scheduled' || d.status === 'today').length}
                </Text>
                <Text fontSize="$2" color="$colorHover">
                  Upcoming
                </Text>
              </YStack>
              <YStack alignItems="center">
                <Text fontSize="$7" fontWeight="700" color="$colorHover">
                  {weekPlan.filter((d) => d.status === 'rest').length}
                </Text>
                <Text fontSize="$2" color="$colorHover">
                  Rest Days
                </Text>
              </YStack>
            </XStack>
          </YStack>
        </Card>
      </YStack>
    </ScrollView>
  );
}
