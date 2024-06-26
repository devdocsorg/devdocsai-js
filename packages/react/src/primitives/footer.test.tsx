import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { Footer, DevDocsAIIcon } from './footer.js';

describe('Footer', () => {
  test('render a footer', () => {
    render(<Footer />);

    const element = screen.getByText(/Powered by/);
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Powered by DevDocs.ai');

    const anchor = screen.getByText<HTMLAnchorElement>('DevDocs.ai');
    expect(anchor.href).toBe('https://devdocs.ai/');
  });

  test('render a footer with Algolia', () => {
    render(<Footer showAlgolia />);

    const anchor = screen.getByLabelText<HTMLAnchorElement>('Algolia');
    expect(anchor.href).toBe('https://algolia.com/');
  });
});

describe('DevDocsAIIcon', () => {
  test('render SVG icon', () => {
    const { container } = render(<DevDocsAIIcon />);
    expect(container).toContainHTML('svg');
  });

  test('custom className', () => {
    render(<DevDocsAIIcon className="custom-class" data-testid="test-id" />);
    const svg = screen.getByTestId('test-id');
    expect(svg).toHaveClass('custom-class');
  });

  test('custom style', () => {
    render(<DevDocsAIIcon style={{ color: 'tomato' }} data-testid="test-id" />);
    const svg = screen.getByTestId('test-id');
    // html color names are converted to rgb by some step in the build process for tests
    expect(svg).toHaveStyle({ color: 'rgb(255, 99, 71)' });
  });
});
