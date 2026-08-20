import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PracticeScreen } from '@/components/practice-screen';
import { AppStateProvider } from '@/state/app-state';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

type TestPrompt = { label: string };
type TestAnswer = { value: string };

function renderPracticeScreen() {
  return render(
    <SafeAreaProvider>
      <AppStateProvider skipHydration>
        <PracticeScreen
          cardEyebrowText="Your answer"
          checkAnswerTestId="check-answer-button"
          createInitialAnswer={(): TestAnswer => ({ value: 'wrong-answer' })}
          createInitialPrompt={(): TestPrompt => ({ label: 'the prompt' })}
          createNextPrompt={(prompt: TestPrompt) => prompt}
          formatAnswerForFeedback={(answer: TestAnswer) => answer.value}
          isAnswerCorrect={() => false}
          nextTimeTestId="next-time-button"
          practiceInterval="5-minute"
          promptCardStyle={{}}
          renderAnswer={({ answer }) => <Text>{answer.value}</Text>}
          renderPrompt={({ prompt }) => <Text>{prompt.label}</Text>}
          timeFormat="12-hour"
          title="Practice"
        />
      </AppStateProvider>
    </SafeAreaProvider>,
  );
}

describe('PracticeScreen wrong-answer feedback', () => {
  it('keeps Check Answer enabled and shows the entered value after a wrong answer', () => {
    renderPracticeScreen();

    fireEvent.press(screen.getByTestId('check-answer-button'));

    expect(screen.getByTestId('check-answer-button')).not.toBeDisabled();
    expect(
      screen.getByTestId('practice-wrong-answer-label', { hidden: true }),
    ).toHaveTextContent('You entered wrong-answer');
  });
});
