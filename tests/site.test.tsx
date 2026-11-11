import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../src/App';

describe('Share The Care visitor experience', () => {
  it('lets a visitor prepare an honest pickup inquiry and close it with Escape', async () => {
    render(<App />);
    const trigger = screen.getAllByRole('button', { name: /ask about a pickup/i })[0];
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/open your email app/i)).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText('Your name'), { target: { value: 'Sam & Alex' } });
    fireEvent.change(within(dialog).getByLabelText('Your neighborhood'), { target: { value: 'The Bridges' } });
    fireEvent.change(within(dialog).getByLabelText('What would you like to give?'), { target: { value: 'Two bags of clothing & canned food' } });
    const email = within(dialog).getByRole('link', { name: /open email draft/i });
    const href = email.getAttribute('href')!;
    expect(href).toMatch(/^mailto:anishkoppula@gmail.com\?/);
    const parameters = new URLSearchParams(href.split('?')[1]);
    expect(parameters.get('subject')).toContain('The Bridges');
    expect(parameters.get('body')).toContain('Sam & Alex');
    expect(parameters.get('body')).toContain('Two bags of clothing & canned food');
    expect(within(dialog).queryByText(/pickup confirmed/i)).not.toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('opens each drive story with a consistent map and keeps the trial notes out of the presentation', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Here’s what we did on those four drives.' })).toBeInTheDocument();
    const stories = [
      { name: 'Quail Run', clothing: '146', map: '/images/quail-run-map.png' },
      { name: 'The Bridges', clothing: '112', map: '/images/bridges-map.png' },
      { name: 'Gale Ranch', clothing: '184', map: '/images/gale-ranch-map.png' },
      { name: 'Windemere', clothing: '168', map: '/images/windemere-map.png' },
    ];
    for (const story of stories) {
      const trigger = screen.getByRole('button', { name: `Explore ${story.name} Drive` });
      trigger.focus();
      fireEvent.click(trigger);
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByRole('heading', { name: `${story.name} Drive` })).toBeInTheDocument();
      expect(within(dialog).queryAllByText(/Example impact|Trial website|Illustrative results/i)).toHaveLength(0);
      expect(within(dialog).getByText(story.clothing, { exact: true })).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { name: 'Explore the route' })).toBeInTheDocument();
      expect(within(dialog).getByRole('img', { name: `Collection map for ${story.name}` })).toHaveAttribute('src', story.map);
      fireEvent.keyDown(dialog, { key: 'Escape' });
      await waitFor(() => expect(trigger).toHaveFocus());
    }
  });

  it('opens the pickup inquiry from Give Fresh Start and describes the expanded donation categories', async () => {
    render(<App />);
    expect(screen.getByText('We collect clothing, shelf-stable food, unopened hygiene products, and baby essentials from your doorstep.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Give Fresh Start' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('What would you like to give?')).toHaveAttribute('placeholder', 'Clothing, shelf-stable food, unopened hygiene products, baby essentials, or a question…');
  });

  it('labels the historical roster and events and keeps the published contacts available', () => {
    render(<App />);
    expect(screen.getByText('The 2025 team')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quail Run' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The Bridges' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gale Ranch' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Windemere' })).toBeInTheDocument();
    expect(document.querySelectorAll('.drive-card')).toHaveLength(4);
    expect([...document.querySelectorAll('.person h3')].map(e => e.textContent)).toEqual(['Anish Koppula', 'Brian Ayabe', 'Rahul Gopalasetty']);
    expect(screen.getByRole('img', { name: 'Anish Koppula' })).toHaveAttribute('src', '/images/anish-koppula-new.webp');
    expect(screen.getAllByText('Co-founder / President')).toHaveLength(2);
    expect(screen.getByRole('link', { name: '(650) 680-6214' })).toHaveAttribute('href', 'tel:+16506806214');
    expect(screen.getByRole('link', { name: 'anishkoppula@gmail.com' })).toHaveAttribute('href', 'mailto:anishkoppula@gmail.com');
    expect(screen.getAllByText('June 24, 2025')).toHaveLength(2);
  });

  it('closes mobile navigation after choosing a section', () => {
    render(<App />);
    const toggle = screen.getByRole('button', { name: 'Open navigation' });
    fireEvent.click(toggle);
    const mobile = screen.getByRole('navigation', { name: 'Mobile navigation' });
    fireEvent.click(within(mobile).getByRole('link', { name: 'Our people' }));
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('returns keyboard focus to the menu toggle when Escape closes mobile navigation', () => {
    render(<App />);
    const toggle = screen.getByRole('button', { name: 'Open navigation' });
    fireEvent.click(toggle);
    const menu = screen.getByRole('navigation', { name: 'Mobile navigation' });
    within(menu).getByRole('link', { name: 'Our people' }).focus();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(toggle).toHaveFocus();
  });

  it('does not move the rail when a mouse returns after being released outside it', () => {
    const { container } = render(<App />);
    const rail = container.querySelector<HTMLDivElement>('.rail-viewport')!;
    rail.scrollLeft = 100;
    // Pointer capture is a browser primitive; these stubs allow detection of erroneous dragging.
    rail.hasPointerCapture = () => false;
    rail.setPointerCapture = () => {};
    const pointer = (type: string, clientX: number, buttons: number) => {
      const event = new MouseEvent(type, { bubbles: true, clientX, button: 0, buttons });
      Object.defineProperty(event, 'pointerType', { value: 'mouse' });
      Object.defineProperty(event, 'pointerId', { value: 1 });
      fireEvent(rail, event);
    };
    pointer('pointerdown', 150, 1);
    // The release occurs outside the element, so it receives no pointerup.
    pointer('pointermove', 210, 0);
    expect(rail.scrollLeft).toBe(100);
  });
});
