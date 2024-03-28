import { DevDocsAI } from '@devdocsai/react';
import React, { ReactElement } from 'react';

export default function IndexPage(): ReactElement {
  return (
    <DevDocsAI
      projectKey={
        process.env.NEXT_PUBLIC_DEVDOCSAI_PROJECT_KEY || 'YOUR-PROJECT-KEY'
      }
      chat={{
        enabled: true,
        iDontKnowMessage: 'Sorry, I am not sure how to answer that.',
        systemPrompt:
          'You are a very enthusiastic company representative who loves to help people!',
        temperature: 0.1,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        maxTokens: 500,
        sectionsMatchCount: 10,
        sectionsMatchThreshold: 0.5,
        defaultView: {
          message: () => (
            <div style={{ padding: 16, fontSize: 15 }}>
              Welcome to the DevDocs.ai chatbot!
            </div>
          ),
          prompts: [
            'What is DevDocs.ai?',
            'Is React supported?',
            'Is there an API?',
          ],
        },
      }}
      search={{
        enabled: false,
      }}
    />
  );
}
